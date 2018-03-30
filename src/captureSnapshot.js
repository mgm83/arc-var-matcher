const Nightmare = require('nightmare')

const { expandQueryString, processParams } = require('./util')

const nightmare = Nightmare({ show: true })
const adobeUrl = 'http://m.trb.com/b/ss/tribnglobal/'

module.exports = function captureSnapshot (url, callback) {
  nightmare
    .on('did-get-response-details', (
      event,
      status,
      newURL,
      originalURL
    ) => {
      if (originalURL.startsWith(adobeUrl)) {
        const processedParams = processParams(expandQueryString(originalURL))
        callback(processedParams)
      }
    })
    .goto(url)
    .then(nightmare.show)
}
