const prisma = require('../config/prisma');
const rules = require('../config/rules');

function parseDate(value) {
  return new Date(value + 'T00:00:00.000Z');
}

function normalizeTime(value) {
  return value.trim();
}

function getTimeSlots(durationMinutes) {
  const slots = [];
  const { start, end, slotIntervalMinutes } = rules.scheduling.workingHours;
  for (let hour = start; hour < end; hour++) {
    for (let minute of [0, slotIntervalMinutes]) {
      const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const endDate = new Date(`1970-01-01T${startTime}:00.000Z`);
      endDate.setMinutes(endDate.getMinutes() + durationMinutes);
      if (endDate.getUTCHours() < end || (endDate.getUTCHours() === end && endDate.getUTCMinutes() === 0)) {
        slots.push(startTime);
      }
    }
  }
  return slots;
}

async function findAppointmentsByLawyerDate(lawyerId, date, excludeId = null) {
  const where = {
    assignedLawyerId: lawyerId,
    date: parseDate(date)
  };
  if (excludeId) {
    where.id = { not: excludeId };
  }
  return prisma.appointment.findMany({ where });
}

function hasConflict(existingAppointments, startTime, endTime) {
  return existingAppointments.some((appointment) => {
    return appointment.startTime < endTime && appointment.endTime > startTime;
  });
}

async function detectConflict(lawyerId, date, startTime, endTime, excludeId = null) {
  const existing = await findAppointmentsByLawyerDate(lawyerId, date, excludeId);
  return hasConflict(existing, normalizeTime(startTime), normalizeTime(endTime));
}

async function lawyerLoad(lawyerId, date) {
  return prisma.appointment.count({ where: { assignedLawyerId: lawyerId, date: parseDate(date) } });
}

async function getLeastBusyLawyer(date) {
  const dateStart = parseDate(date);
  const lawyers = await prisma.lawyer.findMany({
    where: { active: true },
    include: { user: true, appointments: { where: { date: dateStart } } }
  });
  const sorted = lawyers
    .map((lawyer) => ({
      id: lawyer.id,
      name: lawyer.user?.name || 'Unknown',
      load: lawyer.appointments.length
    }))
    .sort((a, b) => a.load - b.load);
  return sorted[0] || null;
}

async function suggestTimes(lawyerId, date, durationMinutes = rules.scheduling.defaultAppointmentDurationMinutes) {
  const slots = getTimeSlots(durationMinutes);
  const available = [];

  for (const startTime of slots) {
    const endDate = new Date(`1970-01-01T${startTime}:00.000Z`);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);
    const endTime = `${String(endDate.getUTCHours()).padStart(2, '0')}:${String(endDate.getUTCMinutes()).padStart(2, '0')}`;
    const conflict = await detectConflict(lawyerId, date, startTime, endTime);
    if (!conflict) {
      available.push(startTime);
      if (available.length >= 4) break;
    }
  }
  return available;
}

module.exports = { detectConflict, lawyerLoad, getLeastBusyLawyer, suggestTimes };
