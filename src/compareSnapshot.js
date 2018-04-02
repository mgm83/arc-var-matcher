const fs = require('fs')
const captureSnapshot = require('./captureSnapshot')
const chalk = require('chalk')

const { pathToSnapshots, logger } = require('./util')

const match = function (prevSnap, params) {
  for (prop in params) {
    if (params[prop] === prevSnap[prop]) {
      logger.match(prevSnap, prop)
    } else {
      logger.mismatch(params, prevSnap, prop)
    }
  }
  return Promise.resolve()
}

module.exports = function (filename, callback) {
  const prevSnap = JSON.parse(
    fs.readFileSync(`${pathToSnapshots()}/${filename}`, 'utf8')
  )
  const url = prevSnap['Current URL']
  captureSnapshot(url, function (newSnap) {
    match(prevSnap, newSnap)
      .then(function () {
        callback()
      })
      .catch(function (err) {
        console.error(err)
      })
  })
}

