/* jshint esnext:true, node:true */
'use strict';
var express = require('express');
var fs = require('fs-extra');
var path = require('path');

var HEADERS_EXT = '.headers';
module.exports = function(root, options){
    if (options == null) options = {};

    var router = express.Router();

    if(options.headers){
      router.use(function(req, res, next){
        res.set(options.headers);
        next();
      });
    }

    if(options.delay){
        router.use(function(req, res, next){
            setTimeout(next, options.delay);
        });
    }

    function bindProcessors(paths){
        var currentPath = path.join(root, paths.join('/'));
        fs.readdirSync(currentPath).forEach(function(dir){
            var currentPathFile = path.join(currentPath, dir);
            var stat = fs.statSync(currentPathFile);
            if (stat.isDirectory()) {
                bindProcessors(paths.concat([dir]));
            } else {
                var parsed = path.parse(dir);
                switch(parsed.ext){
                    case '.json':
                    case '.xml':
                    {
                        var headersFile = path.join(currentPath, parsed.name + HEADERS_EXT);
                        var headers = fs.readJsonSync(headersFile, { throws: false });

                        var respCb = function(req, res){
                          if(headers){
                            res.set(headers);
                          }
                          res.sendFile(currentPathFile);   
                        };
                        let route = paths.join('/');
                        let routes = [route + parsed.ext];
                        if(parsed.ext === '.json'){
                            routes.push(route);
                        }
                        router[parsed.name.toLowerCase()](routes, respCb);
                        break;
                    }
                    case '.js': 
                    {
                        var cb = require(currentPathFile);
                        let route = paths.join('/');
                        let routes = [route, route + '.json'];
                        router[parsed.name.toLowerCase()](routes, cb);
                        break;
                    }
                }
            }
        });
    }
    bindProcessors(['']);
    var cb404 =  options['404'] || function(req, res){
        res.status(404).json({ error: 'Mock not found' });
    };
    router.use(cb404);
    return router;
};
