const captureSnapshot = require('./captureSnapshot')
const { saveToJSON } = require('./util')

module.exports = function (filename, url, callback) {
  captureSnapshot(
    url, 
    saveToJSON.bind(null, filename, callback)
  )
}
