module.exports = {
  init() {
    console.log('Notification plugin initialized.');
  },
  sendNotification(message) {
    console.log('[notification]', message);
  }
};
