function writeToStatus(data, window) {
    console.log(data);
    window.webContents.send('status-message', data);
  }
  
  module.exports = writeToStatus;
  