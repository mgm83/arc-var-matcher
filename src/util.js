const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const varMap = require('./varMap')

exports.expandQueryString = function (queryString, object) {
  var rQueryString = /[?#]?([^\[=&]+)(\[\])?(?:(=)([^&]*))?/g;
  var params = typeof object == 'object' ? object : {},
    value;
  if (queryString && typeof queryString == 'string') queryString.replace(rQueryString, function (a, b, c, d, e) {
    value = e === undefined || e === '' ? (d === '=' ? '' : true) : e;
    if (c) {
      (params[b] && params[b].push || (params[b] = [])).push(value);
    } else {
      params[b] = value;
    }
  });
  return params;
}

exports.processParams = function (params) {
  const result = {};
  for (const prop in params) {
    if (varMap.hasOwnProperty(prop)) {
      result[`${varMap[prop]}`] = decodeURIComponent(params[prop])
    }
  }
  return result;
}

exports.filenameFormat = function (url) {
  const [pagePath, query] = url.split('?')
  const pathSegment =
    pagePath
      .split('/')
      .map((el, i, ar) => i === (ar.length - 1) ? el : `${el}|`)
      .join('')
  return `${pathSegment}?${query}`
}

exports.getConfig = function () {
  const configFile = path.join(process.cwd(), '.var_matcher_config.json')
  if (fs.existsSync(configFile)) {
    return JSON.parse(fs.readFileSync(configFile, 'utf8'))
  } else {
    throw new Error('.var_matcher_config.json file not found')
  }
}

exports.saveToJSON = function (filename, callback, snapshot) {
  fs.writeFile(
    `${exports.getConfig().snapshotPath}/${filename}`,
    JSON.stringify(snapshot, null, ' '),
    'utf8',
    function (err) {
      if (err) {
        console.error(err)
      } else {
        console.log('file save complete')
        callback()
      }
    })
}

exports.getDomains = function (config) {
    const domains =
      Object.keys(config).reduce(function (accumulator, key) {
        if (key.includes('Domain')) {
          accumulator[key] = config[key]
        }
        return accumulator
    }, {})
    return domains
}

const isHomepage = (url, domain) => url === domain

const matchDomain = function (env, url, domains) {
  switch (env) {
    case 'production':
      return isHomepage(url, domains.productionDomain)
        ? domains.localDomain
        : url.split(domains.productionDomain)
    case 'sandbox':
      const sandboxDomain =
        Object.values(domains.sandboxDomains)
          .filter(value => url.includes(value))
          .pop()
      return isHomepage(url, sandboxDomain)
        ? domain.localDomain
        : url.split(sandboxDomain)
    default:
      return null
  }
} 

exports.getLocalUrl = function ({
  env,
  snapshot,
  domains,
  query
}) {
  const currentUrl = snapshot['Current URL']
  if (env !== 'local') {
    const canonical = (function () {
      if (env === 'sandbox' && domains.sandboxDomains) {
        return matchDomain('sandbox', currentUrl, domains)
      } else if (env === 'production' && domains.productionDomain) {
        return matchDomain('production', currentUrl, domains)
      } else {
        throw new Error('Make sure config has local, sandbox and/or production domains')
      }
    })()

    if (Array.isArray(canonical)) {
      return `${domains.localDomain}${canonical[1]}${query}`
    } else if (typeof canonical === 'string') {
      return `${canonical}${query}`
    } else {
    }
  }
  return currentUrl
}

exports.filterVars = function (ignoredVars, snapshot) { 
  if (ignoredVars) {
    const filtered =
      Object.entries(snapshot).reduce(function (result, [key, value]) {
        if (!ignoredVars.includes(key)) {
          result[key] = value
          return result
        }
        return result
      }, {})
    return filtered
  }
  return snapshot
}

exports.logger = {
  match: function(prevSnap, prop) {
    console.log(
      `${chalk.green('matched')}`,
      `"${prevSnap[prop]}" for `,
      `${chalk.green(`${prop}`)}`
    )
  },
  mismatch: function(params, prevSnap, prop) {
    console.log(
      chalk.red(`mismatch `),
      "for ",
      `${chalk.red(`${prop}`)}`,
      '\n',
      chalk.green('EXPECTED: '),
      `"${prevSnap[prop]}"`,
      '\n',
      chalk.red('RECIEVED: '),
      `"${params[prop]}"`
    )
  }
}


