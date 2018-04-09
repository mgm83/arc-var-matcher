# arc-var-matcher
Automated analytics "end-to-end" testing for Adobe variable matching.

## Installation

`npm install git+https://github.com/wapopartners/arc-var-matcher.git --save-dev`

## API

### configuration

`arc-var-matcher` is looking for **.var_matcher_config.json** in the _root_ of your NPM project directory.

"snapshotPath": "src/js/__tests__/analytics/snapshots",
  "localDomain": "http://localhost/pb/",
  "productionDomain": "http://www.latimes.com/",

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
 "Name Space": "tribuneinteractive",
 "pageName": "lat:entertainment:movies:la-ca-mn-sneaks-strong-women-summer-films-20170421:story.",
 "Current URL": "http://www.latimes.com/entertainment/movies/la-ca-mn-sneaks-strong-women-summer-films-20170421-story.html",
 "currencyCode": "USD",
 "server": "www.latimes.com",
 "prop1": "lat:entertainment:movies:la-ca-mn-sneaks-strong-women-summer-films-20170421:story.",
 "hier1": "latimes:entertainment:movies",
 "prop2": "entertainment",
 "prop20": "D=g",
 "eVar20": "latimes",
 "prop21": "0 - 99",
 "eVar21": "story",
 "prop33": "Monday",
 "prop34": "1:30PM",
 "eVar35": "lat:entertainment:movies:la-ca-mn-sneaks-strong-women-summer-films-20170421:story.",
 "prop36": "1",
 "eVar36": "la-ca-mn-sneaks-strong-women-summer-films-20170421",
 "prop37": "default",
 "eVar37": "768||1024",
 "prop38": "story",
 "eVar38": "Portrait",
 "eVar39": "800x578",
 "prop44": "la-ca-mn-sneaks-strong-women-summer-films-20170421",
 "prop57": "story",
 "prop59": "Michael Ordona",
 "prop62": "signed-out",
 "prop64": "04-21-2017 06:00",
 "prop74": "arc"
}
```
### Compare snapshot to local version
```
yarn compare-snapshot test production
```
Output:
```
matched "tribuneinteractive" for  Name Space
matched "lat:entertainment:movies:la-ca-mn-sneaks-strong-women-summer-films-20170421:story." for  pageName
mismatch  for  Current URL 
 EXPECTED:  "http://www.latimes.com/entertainment/movies/la-ca-mn-sneaks-strong-women-summer-films-20170421-story.html" 
 RECIEVED:  "http://localhost/pb/entertainment/movies/la-ca-mn-sneaks-strong-women-summer-films-20170421-story.html"
matched "USD" for  currencyCode
matched "www.latimes.com" for  server
matched "lat:entertainment:movies:la-ca-mn-sneaks-strong-women-summer-films-20170421:story." for  prop1
matched "latimes:entertainment:movies" for  hier1
matched "entertainment" for  prop2
matched "D=g" for  prop20
matched "latimes" for  eVar20
mismatch  for  prop21 
 EXPECTED:  "0 - 99" 
 RECIEVED:  "100 - 199"
matched "story" for  eVar21
matched "Monday" for  prop33
matched "1:30PM" for  prop34
matched "lat:entertainment:movies:la-ca-mn-sneaks-strong-women-summer-films-20170421:story." for  eVar35
matched "1" for  prop36
matched "la-ca-mn-sneaks-strong-women-summer-films-20170421" for  eVar36
matched "default" for  prop37
matched "768||1024" for  eVar37
matched "story" for  prop38
matched "Portrait" for  eVar38
matched "800x578" for  eVar39
matched "la-ca-mn-sneaks-strong-women-summer-films-20170421" for  prop44
matched "story" for  prop57
matched "Michael Ordona" for  prop59
matched "signed-out" for  prop62
mismatch  for  prop64 
 EXPECTED:  "04-21-2017 06:00" 
 RECIEVED:  "04-21-2017 13:00"
mismatch  for  prop74 
 EXPECTED:  "arc" 
 RECIEVED:  "arcdev"
✨  Done in 7.73s.
```
