const { remote, ipcRenderer } = require('electron')

let counter = 0

function showMessage ({ msg, hide = false, replaceAll = false }) {
  let container = document.getElementById('msg-container')
  let html = `<li id="msg-${ ++counter }">${ msg }</li>`

  if (replaceAll) container.innerHTML = html
  else container.insertAdjacentHTML('beforeend', html)

  if (hide) {
    setTimeout(() => {
      let el = container.querySelector(`#msg-${ counter }`)
      el.remove()
    }, 5000)
  }
}

window.quitAndInstall = function quitAndInstall () {
  remote.autoUpdater.quitAndInstall()
}

window.updateChannel = function updateChannel () {
  let channels = document.getElementById('channels')
  let channel = channels[channels.selectedIndex].value
  
  ipcRenderer.send('change-channel', channel)
}

ipcRenderer.on('console', (event, message) => console.info(message))
ipcRenderer.on('message', (event, data) => showMessage(data))
