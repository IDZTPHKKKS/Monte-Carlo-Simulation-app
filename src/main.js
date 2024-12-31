const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  
      nodeIntegration: false,  
      contextIsolation: true,  
    }
  });

  
  win.loadFile('public/index.html');
}


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


ipcMain.handle('get-page-path', (event, category) => {
  const pages = {
    finance: 'pages/finance.html',
    crypto: 'pages/crypto.html',
    gambling: 'pages/gambling.html',
    optimization: 'pages/optimization.html',
    biology: 'pages/biology.html',
    ai: 'pages/ai.html'
  };

  return path.join(__dirname, pages[category] || '');  
});
