const prisma = require('../config/prisma');

async function getLawyers(req, res) {
  const lawyers = await prisma.lawyer.findMany({
    include: { user: true }
  });
  res.json(lawyers.map((lawyer) => ({
    id: lawyer.id,
    name: lawyer.user?.name || 'Unknown',
    email: lawyer.user?.email || '',
    specialization: lawyer.specialization || 'General',
    phone: lawyer.phone,
    active: lawyer.active
  })));
}

async function createLawyer(req, res) {
  const { name, email, password, specialization, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const userCheck = await prisma.user.findUnique({ where: { email } });
  if (userCheck) {
    return res.status(409).json({ message: 'A user already exists with that email.' });
  }

  const hashedPassword = require('bcryptjs').hashSync(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'LAWYER' }
  });

  const lawyer = await prisma.lawyer.create({
    data: {
      userId: user.id,
      phone: phone || null,
      specialization: specialization || 'General',
      active: true
    }
  });

  res.status(201).json({ message: 'Lawyer created successfully.', lawyer });
}

async function toggleLawyer(req, res) {
  const lawyerId = Number(req.params.id);
  const existingLawyer = await prisma.lawyer.findUnique({ where: { id: lawyerId } });
  if (!existingLawyer) {
    return res.status(404).json({ message: 'Lawyer not found.' });
  }
  const lawyer = await prisma.lawyer.update({
    where: { id: lawyerId },
    data: { active: !existingLawyer.active }
  });
  res.json({ message: 'Lawyer status updated.', active: lawyer.active });
}

module.exports = { getLawyers, createLawyer, toggleLawyer };
