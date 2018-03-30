const fs = require('fs')
const path = require('path')

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

exports.pathToSnapshots = path.join(
  __dirname,
  'snapshots'
)

exports.saveToJSON = function (filename, snapshot) {
  fs.writeFile(
    `${exports.pathToSnapshots}/${filename}`,
    JSON.stringify(snapshot, null, ' '),
    'utf8',
    function (err) {
      if (err) {
        console.error(err)
      } else {
        console.log('file save complete') 
      }
    })
}


