const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Your existing dependencies
const main = require('./components/main');
const { createSSHConnection } = require('./utils/sshConnection.js');

// const { host, port, user, password } = require('./config/config.js');

let mainWindow; // Make mainWindow accessible in this scope
let port = 22;
let host = '';
let user = '';
let password = '';
let target = '';
let apiKey = '';
let gptModel = 'gpt-3.5-turbo';

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
};

// comment this out when running automation, only on for UI editing 
// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//   hardResetMethod: 'exit'
// });

// console.log(`user: ${user}`)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// set ssh
ipcMain.handle('update-ssh-credentials', (_, data) => {
  // console.log('Received data:', data);
  if (data.host !== undefined) {
    host = data.host;
  }
  if (data.user !== undefined) {
    user = data.user;
  }
  if (data.password !== undefined) {
    password = data.password;
  }
  if (data.sshLogin !== undefined) {
    sshLogin = data.sshLogin;
  }
});
// set target
ipcMain.handle('set-target', (_, data) => {
  if (data.target !== undefined) {
    target = data.target
  }
})

//set api key 
ipcMain.handle('update-api-key', (_, data) => {
  if (data.apiKey !== undefined) {
    apiKey = data.apiKey
  }
})

//set gpt model
ipcMain.handle('update-gpt-model', (_, data) => {
  if (data.gptModel !== undefined) {
    gptModel = data.gptModel
  }
})

// set api key  and model on index, pass to main then to each time api is called

// Register an IPC event handler for file download
ipcMain.handle('download-file', async (event) => {
  const fileName = 'report.txt'; // Replace with the actual file name
  const filePath = path.join(__dirname, fileName);



  // Trigger the download
  event.sender.downloadURL(`file://${filePath}`);
});




function startApplication(window) {
  console.log(`SETUP:`)
  console.log(`--User: ${user}`)
  console.log(`--Pass: ${password}`)
  console.log(`--Host: ${host}`)
  console.log(`--Target: ${target}`)
  console.log(`--Model: ${gptModel}`)
  console.log(`--API Key: ${apiKey}`)
  if (!window) {
    console.log('Window is not ready yet');
    return;
  }

  


  if ((!host || !user || !password || !target || !apiKey)) {
    console.log('SSH login not set. Cannot start the app.');
    window.webContents.send('setup-message', 'Setup failed');
    // check if all fields are populated, update later to check 
    return;
  }

  const conn = createSSHConnection(
    host,
    port,
    user,
    password,
    async () => {
      console.log('SSH connection established');
      window.webContents.send('setup-message', 'Process running');
      await main(conn, window, target, gptModel, apiKey);
    },
    (err) => {
      console.log('Error connecting to SSH server:', err);
      window.webContents.send('setup-message', 'SSH Failed');
    }
  );
}
ipcMain.handle('start-ssh-connection', async () => {
  // Your function implementation
  await startApplication(mainWindow); // Pass the mainWindow object to startApplication
});