const { dialog, ipcMain } = require('electron')
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
    this.updateChannel()
  }

  init () {
    this.autoUpdater.logger = log
    this.autoUpdater.logger.transports.file.level = 'info'

    this.sendMessageToWindow('console', { msg: `🖥 App channel: ${ this.autoUpdater.channel }` })
    this.sendMessageToWindow('console', `App version: ${ this.version }`)
    this.sendMessageToWindow('message', { msg: `🖥 App version: ${ this.version }` })

    this.autoUpdater.on('error', (_, error) => {
      this.sendMessageToWindow('message', { msg: `😱 Error: ${ error }` })
    })

    this.autoUpdater.on('checking-for-update', () => {
      this.sendMessageToWindow('message', { msg: '🔎 Checking for updates' })
    })

    this.autoUpdater.on('update-available', () => {
      this.sendMessageToWindow('message', { msg: '🎉 Update available. Downloading ⌛️' })
    })

    this.autoUpdater.on('update-not-available', () => {
      this.sendMessageToWindow('message', { msg: '👎 Update not available' })
    })

    this.autoUpdater.on('download-progress', (progressObj) => {
      let { bytesPerSecond, percent, transferred, total } = progressObj
      let logMessage = `Download speed: ${ bytesPerSecond }`
    
      logMessage = `${ logMessage } - Downloaded ${ percent } %`
      logMessage = `${ logMessage } (${ transferred }/${ total })`
    
      this.sendMessageToWindow('message', { msg: logMessage })
    })

    this.autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox({
        type: 'info',
        title: '🤘 Update downloaded',
        message: '🤘 Update downloaded, do you want update now?',
        buttons: ['Yep', 'Nope']
      }, isConfirm => {
        if (isConfirm === 0) {
          let [isSilent, isForceRunAfter] = [true, true]
          autoUpdater.quitAndInstall(isSilent, isForceRunAfter)
        }
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

  updateChannel (channel = 'stable') {
    this.sendMessageToWindow('message', {
      msg: `
        <p style="margin:0">
          🤘 Current channel is <b>${ channel }</b>
        </p>
      `
    })

    this.autoUpdater.channel = channel
    this.autoUpdater.setFeedURL({
      url: `http://127.0.0.1:3000/releases/${ channel }`,
      provider: 'generic',
      channel
    })

    this.checkForUpdates()
  }

  sendMessageToWindow (eventName, data) {
    this.mainWindow.webContents.send(eventName, data)
    console.info(data.msg)
  }
}
