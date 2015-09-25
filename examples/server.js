var express = require('express');
var emocks  = require('../index');
var path    = require('path');

var app = express();
app.use('/', emocks(path.join(__dirname, './mocks'), {
    delay: 500,
    404: function(req, res){
        res.status(404).send('It\'s a trap!');
    }
}));
app.listen(3000);
