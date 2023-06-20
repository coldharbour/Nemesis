function writeToLog(data, window) {
    console.log(data);
    window.webContents.send('log-message', data);
  }
  
  module.exports = writeToLog;
  