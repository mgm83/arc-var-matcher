const fs = require('fs')
const captureSnapshot = require('./captureSnapshot')
const chalk = require('chalk')

const { pathToSnapshots } = require('./util')

const [, , dirName] = process.argv

const dirPath = `${pathToSnapshots}/${dirName}`

fs.readdirSync(dirPath).forEach(function(file) {
  fs.readFile(`${dirPath}/${file}`, 'utf8', function (err, data) {
    if (err) throw err;
    const prevSnap = JSON.parse(data)
    const url = `${file.split('|').join('/')}`
    captureSnapshot(url, function (params) {
      for (prop in params) {
        if (params[prop] === prevSnap[prop]) {
          console.log(chalk.green(`matched ${prevSnap[prop]} for ${prop}`))
        } else {
          console.log(chalk.red(`mismatch for ${prop}`))
          console.log(`EXPECTED: ${prevSnap[prop]}`)
          console.log(`RECIEVED: ${params[prop]}`)
        }
      }
    })
  });
})