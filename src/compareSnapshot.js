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

const getEnvUrl = function (env, snapshot) {
  if (env === 'production') {
    const canonical = snapshot['Current URL'].split('pb')
    if (canonical && canonical[1]) {
      // eVar20 is the site name, e.g., 'latimes'
      return `http://${snapshot['eVar20']}.com${canonical[1]}`
    } else {
      throw new Error('Invalid URL structure. Must contain "pb" segment to fetch production version')
    }
  } else {
    throw new Error('Support for "production" environments only at this time')
  }
}

module.exports = function (filename, callback, env) {
  const prevSnap = JSON.parse(
    fs.readFileSync(`${pathToSnapshots()}/${filename}`, 'utf8')
  )
  const url = env ? getEnvUrl(env, prevSnap) : prevSnap['Current URL']
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

