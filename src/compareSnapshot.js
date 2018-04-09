const fs = require('fs')
const captureSnapshot = require('./captureSnapshot')
const chalk = require('chalk')

const { getConfig, logger } = require('./util')

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

const getLocalUrl = function ({
  env,
  snapshot,
  domains,
  query
}) {
  if (env !== 'local') {
    const canonical = snapshot['Current URL'] === domains[1]
      ? domains[0]
      : snapshot['Current URL'].split(domains[1])

    if (Array.isArray(canonical)) {
      return `${domains[0]}${canonical[1]}${ query }`
    } else if (typeof canonical === 'string') {
      return `${canonical}${ query }`
    } else {
      throw new Error('Check your config to make sure you have a localDomain and productionDomain')
    }
  }
  return snapshot['Current URL']
}

const getDomains = function (config) {
  if (config.localDomain && config.productionDomain) {
    return [ config.localDomain, config.productionDomain ]
  } else {
    throw new Error('Your config file did not contain a localDomain and/or productionDomain')
  }
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

