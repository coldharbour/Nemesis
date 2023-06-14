const Client = require('ssh2').Client;

function createSSHConnection(host, port, user, password, onReady, onError) {
    const conn = new Client();
  
    conn
      .on('ready', () => {
        console.log('SSH connection ready');
        onReady();
      })
      .on('error', (err) => {
        console.log('SSH connection error:', err);
        onError(err);
      })
      .on('close', (hadError) => {
        console.log('SSH connection closed', hadError ? 'with an error' : 'without an error');
      })
      .on('banner', (message, language) => {
        console.log('SSH banner message:', message);
      })
      .connect({
        host: host,
        port: port,
        username: user,
        password: password,
        tryKeyboard: true,
      });
  
    return conn;
  }

  module.exports = { createSSHConnection };