const fs = require('fs')
const captureSnapshot = require('./captureSnapshot')
const chalk = require('chalk')
const {
  getConfig,
  logger,
  getDomains,
  getLocalUrl
} = require('./util')

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

module.exports = function (
  filename,
  callback,
  env,
  query
) {
  const config = getConfig()

  const prevSnap = JSON.parse(
    fs.readFileSync(`${config.snapshotPath}/${filename}`, 'utf8')
  )

  const url = getLocalUrl({
    env,
    snapshot: prevSnap,
    domains: getDomains(config),
    query: query || ''
  })
  
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

