module.exports =
class AutoUpdateManager {
  constructor (mainWindow) {
    this.mainWindow = mainWindow
    this.autoUpdater = require('electron').autoUpdater
    this.version = require('../package.json').version
    this.init()
  }

  init () {
    this.autoUpdater.logger = require('electron-log')
    this.autoUpdater.logger.transports.file.level = 'info'

    this.sendMessageToWindow('console', `App version: ${ this.version }`)
    this.sendMessageToWindow('message', { msg: `🖥 App version: ${ this.version }` })

    this.autoUpdater.on('error', (_, error) => {
      this.sendMessageToWindow('message', { msg: `😱 Error: ${ error }` })
    })

    this.autoUpdater.once('checking-for-update', () => {
      this.sendMessageToWindow('message', { msg: '🔎 Checking for updates' })
    })

    this.autoUpdater.once('update-available', () => {
      this.sendMessageToWindow('message', { msg: '🎉 Update available. Downloading ⌛️', hide: false })
    })

    this.autoUpdater.once('update-not-available', () => {
      this.sendMessageToWindow('message', { msg: '👎 Update not available' })
    })

    this.autoUpdater.once('update-downloaded', () => {
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

    this.autoUpdater.checkForUpdates()
  }

  sendMessageToWindow (eventName, data) {
    this.mainWindow.webContents.send(eventName, data)
  }
}
