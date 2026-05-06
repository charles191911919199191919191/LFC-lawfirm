const settings = {
  overloadThreshold: 5
};

function getSettings() {
  return settings;
}

function updateSettings(updates) {
  Object.assign(settings, updates);
  return settings;
}

module.exports = { getSettings, updateSettings };
