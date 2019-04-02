const os = require('os')
const { autoUpdater } = require('electron')

module.exports =
class AutoUpdateManager {
  constructor (mainWindow) {
    this.mainWindow = mainWindow
    this.autoUpdater = autoUpdater
    this.version = require('../package.json').version

    this._nutsUrl = 'https://electron-autoupdater-starter-server.now.sh'
    this._platform = os.platform()
    this._arch = os.arch()

    this.init()
  }

  init () {
    this.sendMessageToWindow('console', `App version: ${ this.version }`)
    this.sendMessageToWindow('message', { msg: `🖥 App version: ${ this.version }` })

    autoUpdater.setFeedURL(this.feedUrl)

    autoUpdater.on('error', (ev, err) => {
      this.sendMessageToWindow('message', { msg: `😱 Error: ${ err }` })
    })

    autoUpdater.once('checking-for-update', (ev, err) => {
      this.sendMessageToWindow('message', { msg: '🔎 Checking for updates' })
    })

    autoUpdater.once('update-available', (ev, err) => {
      this.sendMessageToWindow('message', { msg: '🎉 Update available. Downloading ⌛️', hide: false })
    })

    autoUpdater.once('update-not-available', (ev, err) => {
      this.sendMessageToWindow('message', { msg: '👎 Update not available' })
    })

    autoUpdater.once('update-downloaded', (ev, err) => {
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

    console.log(this.feedUrl)
    autoUpdater.checkForUpdates()
  }

  sendMessageToWindow (ev, data) {
    this.mainWindow.webContents.send(ev, data)
  }

  get feedUrl () {
    let url = `${ this._nutsUrl }/update/%s/${ this.version }`
    switch (this._platform) {
      case 'darwin': return url.replace('%s', this.platform)
      case 'win32': return url.replace('%s', 'win32')
      case 'linux': return url.replace('%s', 'linux')
      default: return null
    }
  }

  get platform () {
    return `${ this.platform }_${ this._arch }`
  }
}
