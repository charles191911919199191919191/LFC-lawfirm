class PluginManager {
  constructor() {
    this.plugins = [];
  }

  register(plugin) {
    if (plugin && typeof plugin.init === 'function') {
      this.plugins.push(plugin);
      plugin.init();
    }
  }
}

module.exports = new PluginManager();
