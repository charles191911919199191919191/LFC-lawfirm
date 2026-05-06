const prisma = require('../config/prisma');

function buildChartSeries(appointments) {
  const countsByDate = {};
  appointments.forEach((appointment) => {
    const label = appointment.date.toISOString().slice(0, 10);
    countsByDate[label] = (countsByDate[label] || 0) + 1;
  });
  const labels = Object.keys(countsByDate).sort();
  const values = labels.map((label) => countsByDate[label]);
  return { labels, values };
}

async function getDashboardData(req, res) {
  const totalAppointments = await prisma.appointment.count();
  const urgentCases = await prisma.appointment.count({ where: { caseType: 'Urgent' } });
  const activeLawyers = await prisma.lawyer.count({ where: { active: true } });
  const attorneys = await prisma.lawyer.findMany({
    include: { appointments: true, user: true }
  });

  const workloadLabels = attorneys.map((lawyer) => lawyer.user?.name || 'Unknown');
  const workloadValues = attorneys.map((lawyer) => lawyer.appointments.length);

  const appointments = await prisma.appointment.findMany({
    orderBy: { date: 'asc' }
  });
  const trends = buildChartSeries(appointments);

  res.json({
    overview: { totalAppointments, urgentCases, activeLawyers },
    workloadDistribution: { labels: workloadLabels, values: workloadValues },
    appointmentTrends: trends
  });
}

module.exports = { getDashboardData };
