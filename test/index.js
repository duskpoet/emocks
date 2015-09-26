var emocks = require('../index');
var express = require('express');
var path = require('path');
var request = require('supertest');

var MOCKS_PATH = '../examples/mocks';

describe('Emocks runs', function(){
  function createApp(options){
    var app = express();
    app.use('/', emocks(path.join(__dirname, MOCKS_PATH), options));
    return app;
  }
  it('GET /', function(){
    var app = createApp({});
    request(app)
      .get('/')
      .expect(200);
  });
});

