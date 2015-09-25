# emocks
emocks - express mocks
emocks is a mocking middleware for express servers.
## How does it work?
* Organize all your mocks using folder structure, that will correspond your api url. 
* You can use HTTP VERBS as file names to create different mocks
* You can use static .json files for your answers or .js modules, that can create dynamic answers
## Installation
    npm install emocks
## Example
    Assume we have following folder structure:
```
|-- mocks
  |-- users
    |-- GET.json
    |-- :id
      |-- PUT.js
|-- server.js
```
### server.js
```javascript
var path    = require('path');
var express = require('express');
var emocks  = require('emocks');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use('/', emocks(path.join(__dirname, './mocks'));
app.listen(3000);
```
### mocks/users/GET.json
```JSON
[ 
  { "id": 1, "name": "Jon Snow", "state": "Knows nothing" },
  { "id": 2, "name": "Arya Stark", "state": "Knows valar morghulis" }
]
```
### mocks/users/PUT.js
```javascript
module.exports = function(req, res){
  var result = req.body;
  result.id = req.params.id;
  res.json(result);
}
```
### Api calls
`GET /users`

Response
```JSON
[ 
  { "id": 1, "name": "Jon Snow", "state": "Knows nothing" },
  { "id": 2, "name": "Arya Stark", "state": "Knows valar morghulis" }
]
```
`PUT /users/2`
```JSON
{ "name": "Arya Stark", "state": "Sees nothing" }
```
Response
```JSON
{ "id": 2, "name": "Arya Stark", "state": "Sees nothing" }
```

### Options
```javascript
/**
 * @param {string} path - absolute path to mocks directory
 * @param {object} options
 * @param {number} options.delay - emulate server response delay
 */
emocks(path.join(__dirname, './path/to/mocks-folder'), {
    delay: 1000
});
```

## Additional info
Please offer suggestions via issues.
emocks is an abbreviation for express mocks. Any similarity to emacs is unintended.
