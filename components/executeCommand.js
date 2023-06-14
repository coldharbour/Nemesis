
const pty = require('node-pty');
async function executeCommand(conn, command, interactive = false) {
  
  
    return new Promise((resolve, reject) => {
      let output = '';
  
      if (interactive) {
        const ptyProcess = pty.spawn('bash', [], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env
        });
  
        ptyProcess.on('exit', (code) => {
       
          resolve({ serverResponse: output, exitCode: code });
        });
  
        ptyProcess.on('data', (data) => {
          output += data;
          console.log(`interactive command output: ${output}`);
        });
  
        const cleanedCommand = command.replace(/`/g, '');
        ptyProcess.write(`${cleanedCommand}\r`);
  
      } else {
        // Remove backticks from the command
        const cleanedCommand = command.replace(/`/g, '');
  
        conn.exec(cleanedCommand, (err, stream) => {
          if (err) reject({ serverResponse: err, exitCode: -1 });
  
          stream
            .on('close', (code) => {
             
              resolve({ serverResponse: output, exitCode: code });
            })
            .on('data', (data) => {
              output += data;
              // console.log(`successful command output: ${output}`)
            })
            .stderr.on('data', (data) => {
              output += data;
              // console.log(`error message: ${data} for command ${cleanedCommand}`)
            });
        });
      }
    });
  }

  module.exports = executeCommand;