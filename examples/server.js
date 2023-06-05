import express from 'express';
import emocks from '../dist/index.js';
import path from 'node:path';

var app = express();
app.use('/', emocks(path.join(__dirname, './mocks'), {
    delay: 500,
    404: function(_req, res){
        res.status(404).send('It\'s a trap!');
    },
    headers: {
      'X-Header': 'test'
    },
    watch: true
}));
var server = app.listen(3000, function(){
  console.log('Mocking server started on port ' + server.address().port);
});
