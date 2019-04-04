const { ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const version = require('../package.json').version

module.exports =
class AutoUpdateManager {
  constructor (mainWindow) {
    this.mainWindow = mainWindow
    this.autoUpdater = autoUpdater
    this.ipcMain = ipcMain
    this.version = version
    
    this.init()
    this.checkForUpdates()
  }

  init () {
    this.autoUpdater.logger = log
    this.autoUpdater.logger.transports.file.level = 'info'

    this.sendMessageToWindow('console', `App version: ${ this.version }`)
    this.sendMessageToWindow('message', { msg: `🖥 App version: ${ this.version }` })

    this.autoUpdater.on('error', (_, error) => {
      this.sendMessageToWindow('message', { msg: `😱 Error: ${ error }` })
    })

    this.autoUpdater.on('checking-for-update', () => {
      this.sendMessageToWindow('message', { msg: '🔎 Checking for updates' })
    })

    this.autoUpdater.on('update-available', () => {
      this.sendMessageToWindow('message', { msg: '🎉 Update available. Downloading ⌛️', hide: false })
    })

    this.autoUpdater.on('update-not-available', () => {
      this.sendMessageToWindow('message', { msg: '👎 Update not available' })
    })

    this.autoUpdater.on('download-progress', (progressObj) => {
      let { bytesPerSecond, percent, transferred, total } = progressObj
      let logMessage = `Download speed: ${ bytesPerSecond }`
    
      logMessage = `${ logMessage } - Downloaded ${ percent } %`
      logMessage = `${ logMessage } (${ transferred }/${ total })`
    
      this.sendStatusToWindow('message', {
        hide: true,
        msg: logMessage
      })
    })

    this.autoUpdater.on('update-downloaded', () => {
      this.sendMessageToWindow('message', {
        hide: false,
        replaceAll: true,
        msg: `
          <p style="margin:0">
            🤘 Update downloaded - <a onclick="quitAndInstall()">Restart</a>
          </p>
        `
      })
    })

    this.ipcMain.on('change-channel', (_, value) => this.updateChannel(value))
  }

  checkForUpdates () {
    clearTimeout(this.timeout)
    this.autoUpdater.checkForUpdatesAndNotify()
    this.timeout = setTimeout(() => {
      this.checkForUpdates()
    }, 10 * 60 * 1000)
  }

  updateChannel (channel) {
    this.sendMessageToWindow('message', {
      hide: true,
      msg: `
        <p style="margin:0">
          🤘 Current channel is <b>${ channel }</b>
        </p>
      `
    })
    this.autoUpdater.channel = channel
    this.checkForUpdates()
  }

  sendMessageToWindow (eventName, data) {
    this.mainWindow.webContents.send(eventName, data)
  }
}
