/* jshint esnext:true, node:true */
'use strict';
var express = require('express');
var fs = require('fs-extra');
var path = require('path');

module.exports = function(root, options){
    if (options == null) options = {};

    var router = express.Router();

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
                        var respCb = function(req, resp){
                            resp.sendFile(currentPathFile);   
                        };
                        router[parsed.name.toLowerCase()](paths.join('/'), respCb);
                        break;
                    case '.js': 
                        var cb = require(currentPathFile);
                        router[parsed.name.toLowerCase()](paths.join('/'), cb);
                        break;
                }
            }
        });
    }
    bindProcessors(['']);
    router.use(function(req, res){
        res.status(404).json({ error: 'Mock not found' });
    });
    return router;
};
