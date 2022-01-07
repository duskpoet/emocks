# emocks
emocks - express mocks
emocks is a mocking middleware for express servers.
## How does it work?
* Organize all of your mocks using folder structure, representing your api url
* You can use HTTP VERBS as file names to create different mocks
* You can use static .json files for responses or .js modules, that can create dynamic answers

## Supported features
* json, dynamic answers
* custom headers

## Installation
    npm install emocks
## Example
    Assuming we have the following folder structure:
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
const path    = require('path');
const express = require('express');
const emocks  = require('emocks');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use('/', emocks(path.join(__dirname, './mocks')));
app.listen(3000);
```
### mocks/users/GET.json
```JSON
[ 
  { "id": 1, "name": "Jon Snow", "state": "Knows nothing" },
  { "id": 2, "name": "Arya Stark", "state": "Knows valar morghulis" }
]
```
### mocks/users/GET.headers
```JSON
{ "X-Password": "The winter is coming" }
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

```
HTTP/1.1 200 OK
X-Password: The winter is coming
```
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
 */
emocks(path.join(__dirname, './path/to/mocks-folder'), {
    //emulate server response delay
    delay: 1000,
    //custom 'Not Found' handler
    404: function(req, res){ ... },
    //global headers, will be applied to every response
    headers: { "X-Custom-Global-Header": "Hello!" },
});
```

### Now supports typescript!

## Additional info
Please offer suggestions via issues.
emocks is an abbreviation for express mocks. Any similarity to emacs is unintended.
