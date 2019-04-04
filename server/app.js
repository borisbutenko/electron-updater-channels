const fs = require('fs')
const express = require('express')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000

function getLatestRelease () {
  let __dir = path.resolve(__dirname, 'releases', 'latest')

  let versionDesc = fs.readdirSync(__dir).filter(file => {
    let filePath = path.join(__dir, file)
    return fs.statSync(filePath).isDirectory()
  }).reverse()

  return versionDesc[0]
}

function getBaseURL () {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:' + port
  }
  return 'https://electron-updater-channels.herokuapp.com'
}

app.get('/updates/latest', (req, res) => {
  let latest = getLatestRelease()
  let client = req.query.v

  if (client === latest) {
    res.status(204).end()
  }
  else {
    let baseURL = getBaseURL()
    let updateURL = baseURL + '/release/linux/' + latest + '/electron.AppImage'

    res.json({
      url: updateURL,
      name: 'My Release Name',
      notes: 'There are some release notes',
      pub_date: new Date()
    })
  }
})

app.listen(port, () => console.log(`Express server listening on port ${ port }`))
