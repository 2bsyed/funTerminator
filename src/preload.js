
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	listFiles: (dir) => ipcRenderer.invoke('list-files', dir),
	runCommand: (cmd, cwd) => ipcRenderer.invoke('run-command', cmd, cwd)
});
