const fs = require('fs')
const captureSnapshot = require('./captureSnapshot')
const chalk = require('chalk')

const { pathToSnapshots } = require('./util')

const [, , name] = process.argv

// const filePath = `${url.split('/').join('|')}`

fs.readFile(`${pathToSnapshots}/${name}`, 'utf8', function (err, data) {
  if (err) throw err;
  const prevSnap = JSON.parse(data)
  const url = prevSnap['Current URL']
  captureSnapshot(url, function (params) {
    for (prop in params) {
      if (params[prop] === prevSnap[prop]) {
        console.log(
          `${chalk.green('matched')}`,
          `"${prevSnap[prop]}" for `,
          `${chalk.green(`${prop}`)}`
        )
      } else {
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
  })
});
