const { resolve } = require('path')
const { app, BrowserWindow } = require('electron')

const AutoUpdateManager = require('./auto-update-manager')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadFile(resolve(global.__root, 'src', 'index.html'))
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.openDevTools()
  mainWindow.webContents.on('did-finish-load', () => new AutoUpdateManager(mainWindow))
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('ready', createWindow)
