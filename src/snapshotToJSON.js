const captureSnapshot = require('./captureSnapshot')
const { saveToJSON } = require('./util')

const [ , , url ] = process.argv
captureSnapshot(url, saveToJSON)
