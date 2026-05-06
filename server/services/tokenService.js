const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const AppError = require('../error/AppError');

const refreshTokenTTL = 30 * 24 * 60 * 60 * 1000;

function signAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

async function createRefreshToken(userId) {
  const token = signRefreshToken();
  const expiresAt = new Date(Date.now() + refreshTokenTTL);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
}

async function rotateRefreshToken(oldToken) {
  const existing = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!existing) {
    throw new AppError('Refresh token reuse detected.', 401, 'TOKEN_REUSE');
  }
  if (existing.revoked || existing.expiresAt < new Date()) {
    throw new AppError('Refresh token invalid or expired.', 401, 'INVALID_REFRESH_TOKEN');
  }
  const newToken = signRefreshToken();
  const expiry = new Date(Date.now() + refreshTokenTTL);
  await prisma.refreshToken.update({
    where: { token: oldToken },
    data: { revoked: true, revokedAt: new Date(), replacedByToken: newToken }
  });
  await prisma.refreshToken.create({ data: { token: newToken, userId: existing.userId, expiresAt: expiry } });
  return { newToken, userId: existing.userId };
}

async function revokeRefreshToken(token) {
  await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true, revokedAt: new Date() } });
}

module.exports = { signAccessToken, createRefreshToken, rotateRefreshToken, revokeRefreshToken, refreshTokenTTL };
