const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function getUsers(req, res) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  })));
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const normalizedRole = ['ADMIN', 'STAFF', 'LAWYER'].includes(role) ? role : 'STAFF';
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: normalizedRole }
  });

  if (normalizedRole === 'LAWYER') {
    await prisma.lawyer.create({ data: { userId: user.id, active: true } });
  }

  res.status(201).json({ message: 'User created successfully.' });
}

async function deleteUser(req, res) {
  const userId = Number(req.params.id);
  if (!userId) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  await prisma.user.delete({ where: { id: userId } });
  res.json({ message: 'User deleted successfully.' });
}

module.exports = { getUsers, createUser, deleteUser };
