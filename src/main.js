const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


// IPC handler for file browsing
ipcMain.handle('list-files', async (event, dir) => {
  try {
    return fs.readdirSync(dir).filter(f => !f.startsWith('.'));
  } catch (e) {
    return [];
  }
});

// IPC handler for running shell commands
ipcMain.handle('run-command', async (event, cmd, cwd) => {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(cmd, { cwd: cwd || process.cwd(), shell: true }, (error, stdout, stderr) => {
      if (error) {
        resolve(stderr || error.message);
      } else {
        resolve(stdout || '');
      }
    });
  });
});

// IPC handler for reading files
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return '';
  }
});

// IPC handler for writing files
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return 'Saved!';
  } catch (e) {
    return 'Error saving file: ' + e.message;
  }
});
