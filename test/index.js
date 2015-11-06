var emocks = require('../index');
var express = require('express');
var path = require('path');
var request = require('supertest');
var fs = require('fs');
var rimraf = require('rimraf');

var MOCKS_PATH = '../examples/mocks';

describe('Emocks runs', function(){
    before(function(done){
        fs.mkdir('tmp', done);
    });
    after(function(done){
        rimraf('tmp', done);
    });
    function createApp(options, pathPas){
        pathPas = pathPas || path.join(__dirname, MOCKS_PATH);
        var app = express();
        app.use('/', emocks(pathPas, options));
        return app;
    }
    it('GET /', function(){
        var app = createApp();
        request(app)
        .get('/')
        .expect(200)
        .end();
    });
    it('Headers', function(){
        var app = createApp({
            headers: {
                'X-Test': 'test'
            }
        });
        request(app)
        .get('/users')
        .expect('X-Test', 'test')
        .expect('X-Cutom-Header', 'Lol')
        .expect(200)
        .end();
    });
    it('Delay', function(){
        var app = createApp({
            delay: 100
        });
        request(app)
        .get('/')
        .expect(200)
        .end();
    });
    it('js response', function(){
        var app = createApp({});
        request(app)
        .get('/users/3')
        .expect(200, {
            id: 1, name: 'John'
        })
        .end();
    });
    it('404', function(){
        var app = createApp({
            404: function(req, res){
                res.status(404).send();
            }
        });
        request(app)
        .get('/unknown')
        .expect(404)
        .end();

        var app2 = createApp();
        request(app2)
        .get('/unknown')
        .expect(404, { error: 'Mock not found' })
        .end();
    });
    it('Watch', function(){
        var app = createApp({
            watch: true
        }, 'tmp');
        fs.writeFileSync('tmp/GET.json', '{}');

        request(app)
        .get('/')
        .expect(200)
        .end();

    });
});
