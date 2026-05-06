const { getSettings, updateSettings } = require('../config/settings');

function getSystemSettings(req, res) {
  res.json(getSettings());
}

function updateSystemSettings(req, res) {
  const { overloadThreshold } = req.body;
  if (typeof overloadThreshold !== 'number' || overloadThreshold < 1) {
    return res.status(400).json({ message: 'Threshold must be a positive number.' });
  }
  const settings = updateSettings({ overloadThreshold });
  res.json(settings);
}

module.exports = { getSystemSettings, updateSystemSettings };
