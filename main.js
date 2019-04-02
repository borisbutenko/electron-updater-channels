global.__root = __dirname
require(
  require('path').resolve(__dirname, 'src-electron', 'main-process')
)
