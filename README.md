# arc-var-matcher
Automated analytics "end-to-end" testing for Adobe variable matching.

## Installation

`npm install git+https://github.com/wapopartners/arc-var-matcher.git --save-dev`

## API

### configuration

`arc-var-matcher` is looking for **.var_matcher_config.json** in the _root_ of your NPM project directory.

| property  | description |
| ------------- | ------------- | 
| snapshotPath  | path (relative to project root) to save your snapshot file  |
| localDomain  | local domain to use to navigate to URLs in local testing |
| productionDomain  | production domain to compare to URLs in local testing |

Example (use this)
```
{
  "snapshotPath": "src/js/__tests__/analytics/snapshots",
  "localDomain": "http://localhost/pb/",
  "productionDomain": "http://www.latimes.com/"
}
```

### functions

`snapshotToJSON`

Writes a JSON file to disk at location specified in user generated config file.

| argument  | type | description
| ------------- | ------------- | -------------- |
| filename  | string  | name of snapshot file to save |
| url  | string | URL to visit to make snapshot |
| callback  | function | to be run after your snapshot successfully saves |

`compareSnapshot`

Compares a snapshot saved to disk with a live page snapshot

| argument  | type | description
| ------------- | ------------- | -------------- |
| filename  | string  | name of snapshot file on disk |
| callback  | function | to be run after your snapshot successfully comparison is made |
| env  | string  | environment (local, production, sandbox, etc) you are comparing to |
| query  | string  | (optional)  | query params to add to end of the compare URL |

## Example Usage

**snapshot.js**
```javascript
const { snapshotToJSON } = require('arc-var-matcher')

const [, , filename, url] = process.argv

snapshotToJSON(filename, url, function () {
  process.exit(0)
})
```

**compare.js**
```javascript
const { compareSnapshot } = require('arc-var-matcher')

const [ , , filename, env, query ] = process.argv
compareSnapshot(
  filename,
  function () {
    process.exit(0)
  },
  env,
  query
)
```
**package.json**
```
"scripts": {
  "snapshot-to-json": "node snapshot.js",
  "compare-snapshot": "node compare.js"
}
```
### Generate snapshot
from the command line:
```
yarn snapshot-to-json test http://www.latimes.com/entertainment/movies/la-ca-mn-sneaks-strong-women-summer-films-20170421-story.html
```
Check to see new file:
```
{
 "pageName": "lat:entertainment:movies:la-ca-mn-sneaks-strong-women-summer-films-20170421:story.",
 "Current URL": "http://www.latimes.com/entertainment/movies/la-ca-mn-sneaks-strong-women-summer-films-20170421-story.html",
 "currencyCode": "USD",
 "server": "www.latimes.com",
  // ...
}
```
### Compare snapshot to local version
```
yarn compare-snapshot test production
```
Output:
```
matched "lat:entertainment:movies:la-ca-mn-sneaks-strong-women-summer-films-20170421:story." for  pageName
mismatch  for  Current URL 
 EXPECTED:  "http://www.latimes.com/entertainment/movies/la-ca-mn-sneaks-strong-women-summer-films-20170421-story.html" 
 RECIEVED:  "http://localhost/pb/entertainment/movies/la-ca-mn-sneaks-strong-women-summer-films-20170421-story.html"
matched "USD" for  currencyCode
mismatch  for  prop21 
 EXPECTED:  "0 - 99" 
 RECIEVED:  "100 - 199"
// ...
✨  Done in 7.73s.
```
