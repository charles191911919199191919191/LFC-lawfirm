const prisma = require('../config/prisma');

const MAX_DAILY_APPOINTMENTS = 5;

function parseDate(value) {
  return new Date(value + 'T00:00:00.000Z');
}

function normalizeTime(value) {
  return value.trim();
}

async function detectConflict(lawyerId, date, startTime, endTime, excludeId = null) {
  const dateStart = parseDate(date);
  const conditions = {
    assignedLawyerId: lawyerId,
    date: dateStart
  };
  const appointments = await prisma.appointment.findMany({
    where: { ...conditions, id: excludeId ? { not: excludeId } : undefined }
  });

  return appointments.some((appointment) => {
    return (
      appointment.startTime < endTime &&
      appointment.endTime > startTime
    );
  });
}

async function getLeastBusyLawyer(date) {
  const dateStart = parseDate(date);
  const workloads = await prisma.lawyer.findMany({
    where: { active: true },
    include: { appointments: { where: { date: dateStart } }, user: true }
  });
  return workloads
    .map((lawyer) => ({
      lawyerId: lawyer.id,
      lawyerName: lawyer.user?.name || 'Unknown Lawyer',
      load: lawyer.appointments.length
    }))
    .sort((a, b) => a.load - b.load)[0] || null;
}

async function suggestTimeSlots(lawyerId, date, durationMinutes = 60) {
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  const intervalMinutes = 30;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute of [0, 30]) {
      const start = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const end = new Date(`1970-01-01T${start}:00.000Z`);
      end.setMinutes(end.getMinutes() + durationMinutes);
      if (end.getHours() >= endHour && end.getMinutes() > 0) continue;
      const endString = `${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`;
      const conflict = await detectConflict(lawyerId, date, start, endString);
      if (!conflict) {
        slots.push(start);
      }
    }
  }
  return slots.slice(0, 4);
}

async function getAppointments(req, res) {
  const { role, id } = req.user;
  if (role === 'LAWYER') {
    const lawyer = await prisma.lawyer.findUnique({ where: { userId: id } });
    if (!lawyer) {
      return res.json([]);
    }
    const appointments = await prisma.appointment.findMany({
      where: { assignedLawyerId: lawyer.id },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: { assignedLawyer: { include: { user: true } }, createdBy: true }
    });
    return res.json(appointments);
  }

  const appointments = await prisma.appointment.findMany({
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    include: { assignedLawyer: { include: { user: true } }, createdBy: true }
  });
  res.json(appointments);
}

async function createAppointment(req, res) {
  const { clientName, contactInfo, date, startTime, endTime, caseType, assignedLawyerId, notes, status } = req.body;
  if (!clientName || !contactInfo || !date || !startTime || !endTime || !assignedLawyerId) {
    return res.status(400).json({ message: 'Required appointment fields are missing.' });
  }

  if (startTime >= endTime) {
    return res.status(400).json({ message: 'End time must be later than start time.' });
  }

  const lawyerId = Number(assignedLawyerId);
  const appointmentDate = parseDate(date);
  const hasConflict = await detectConflict(lawyerId, date, normalizeTime(startTime), normalizeTime(endTime));
  const dailyLoad = await prisma.appointment.count({ where: { assignedLawyerId: lawyerId, date: appointmentDate } });
  const overloaded = dailyLoad >= MAX_DAILY_APPOINTMENTS;
  const suggestions = {
    alternativeLawyer: await getLeastBusyLawyer(date),
    suggestedTimes: await suggestTimeSlots(lawyerId, date)
  };

  if (hasConflict) {
    return res.status(409).json({
      message: 'Conflict detected. Please review suggestions.',
      overloaded,
      suggestions
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientName,
      contactInfo,
      date: appointmentDate,
      startTime: normalizeTime(startTime),
      endTime: normalizeTime(endTime),
      caseType: caseType || 'Regular',
      assignedLawyerId: lawyerId,
      notes,
      status: status || 'Scheduled',
      createdById: req.user.id
    }
  });

  await prisma.caseLog.create({
    data: {
      appointmentId: appointment.id,
      userId: req.user.id,
      action: 'Created appointment',
      details: `Appointment for ${clientName} scheduled.`
    }
  });

  res.status(201).json({ appointment, overloaded, suggestions });
}

async function updateAppointment(req, res) {
  const appointmentId = Number(req.params.id);
  const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!existing) {
    return res.status(404).json({ message: 'Appointment not found.' });
  }

  const { clientName, contactInfo, date, startTime, endTime, caseType, assignedLawyerId, notes, status } = req.body;
  const appointmentDate = parseDate(date);
  const hasConflict = await detectConflict(Number(assignedLawyerId), date, normalizeTime(startTime), normalizeTime(endTime), appointmentId);
  const suggestions = {
    alternativeLawyer: await getLeastBusyLawyer(date),
    suggestedTimes: await suggestTimeSlots(Number(assignedLawyerId), date)
  };

  if (hasConflict) {
    return res.status(409).json({
      message: 'Conflict detected while updating.',
      suggestions
    });
  }

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      clientName,
      contactInfo,
      date: appointmentDate,
      startTime: normalizeTime(startTime),
      endTime: normalizeTime(endTime),
      caseType: caseType || existing.caseType,
      assignedLawyerId: Number(assignedLawyerId),
      notes,
      status: status || existing.status
    }
  });

  await prisma.caseLog.create({
    data: {
      appointmentId: appointment.id,
      userId: req.user.id,
      action: 'Updated appointment',
      details: `Appointment updated for ${clientName}.`
    }
  });

  res.json({ appointment, suggestions });
}

async function deleteAppointment(req, res) {
  const appointmentId = Number(req.params.id);
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found.' });
  }

  await prisma.appointment.delete({ where: { id: appointmentId } });
  await prisma.caseLog.create({
    data: {
      appointmentId,
      userId: req.user.id,
      action: 'Deleted appointment',
      details: `Appointment deleted for ${appointment.clientName}.`
    }
  });

  res.json({ message: 'Appointment deleted.' });
}

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
