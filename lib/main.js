
/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
"use strict";

/**
 * A basic local web server to configure an IoT device.
 *
 *
 */
var express = require('express');
var async = require('async');
var setup = require('./setup');

var config = {
    // dirname: <string>  no extra static public dir
    home: '/tmp',
    wpaHome: '/tmp',
    port: 8088,
    wpaScript: 'wpaSetup.sh',
    gitScript: 'gitSetup.sh',
    appScript: 'appSetup.sh'

};

var DUMMY_PASSWORD="******";
/*
 * type is {wpaPassword: string, ssid: string, deviceId: string,
 *          git: string, baseUrl: string}
 *
 */
var lastConfig = null;

var startWS = exports.startWS = function(spec) {
    spec = spec || config;
    spec.defaultFile = spec.defaultFile || './defaults.json';
    lastConfig = lastConfig || require(spec.defaultFile);
    var app =  express.createServer();
    app.use(express.bodyParser());
    app.use(app.router);
    if (spec.dirname) {
        app.use(express.static(dirname));
    }
    app.use(express.static(__dirname + '/../public'));
    app.get('/defaults', function(req, res) {
                var noPassword = function(key, value) {
                    if (key === 'wpaPassword') {
                        return DUMMY_PASSWORD;
                    } else {
                        return value;
                    }
                };
                res.send(JSON.stringify(lastConfig, noPassword));
            });
    app.post('/configure', function(req, res) {
                 if ((req.body.wpaPassword === DUMMY_PASSWORD) &&
                     (req.body.ssid === lastConfig.ssid)) {
                     req.body.wpaPassword = lastConfig.wpaPassword;
                 }
                 async.series([
                                  function(cb0) {
                                      setup.doIt(spec, req.body, cb0);
                                  }
                              ],  function(err, data) {
                                  if (err) {
                                      res.send(JSON.stringify(err));
                                  } else {
                                      debugger;
                                      lastConfig = data[0];
                                      res.send(JSON.stringify({ok: true}));
                                  }
                              });

             });
    app.listen(spec.port || 8088);
};


var stopWS = exports.stopWS = function(app) {
    if (app) {
        app.close();
    }
};

