const express = require('express')
const [app, port] = [express(), process.env.PORT || 3000]

app.get('/releases/:channel/:file', (req, res) => {
  let { channel, file } = req.params
  res.sendFile(file, {
    root: `${ __dirname }/releases/${ channel }/`,
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  })
})

app.listen(port, () => console.log(`Express server listening on port ${ port }`))
