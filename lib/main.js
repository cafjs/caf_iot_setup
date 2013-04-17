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
var os = require('os');

/** Interval to detect missing network in msec.*/
var NETWORK_CHECK_INTERVAL= 15000;

/*
 * type is {wpaPassword: string, ssid: string, git: string, appUrl: string}
 *
 */
var appConfig = null;

var initAppConfig = function(spec) {
    var cb0 = function(err, data) {
        if (err) {
            console.log("Error initializing appConfig: " + JSON.stringify(err));
            appConfig = {};
        } else {
            appConfig = data;
        }
    };
    setup.doIt(spec, {}, cb0);
};

var monitorNetwork = function(recoverF) {
    return function() {
        var ok =false;
        var networks = os.networkInterfaces();
        for (var netName in networks) {
            var all = networks[netName];
            all.forEach(function(x) {
                            // only IPv4 supported
                            if ((x.family === 'IPv4') && !x.internal &&
                                x.address) {
                                ok = true;
                            }
                        });
        }
        if (!ok) {
            recoverF();
        }
    };
};

var startWS = exports.startWS = function(spec) {
    spec = spec || require('./defaults.json');
    appConfig || initAppConfig(spec);
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
                        return undefined;
                    } else {
                        return value;
                    }
                };
                res.send(JSON.stringify(appConfig, noPassword));
            });
    app.post('/configure', function(req, res) {
                 async.series([
                                  function(cb0) {
                                      setup.doIt(spec, req.body, cb0);
                                  }
                              ],  function(err, data) {
                                  if (err) {
                                      res.send(JSON.stringify(err));
                                  } else {
                                      debugger;
                                      appConfig = data[0];
                                      res.send(JSON.stringify({ok: true}));
                                  }
                              });

             });
    var recoveryF = function() {
        console.log("Lost network!!");
    };
    app.myInterval = setInterval(monitorNetwork(recoveryF),
                                 NETWORK_CHECK_INTERVAL);
    app.listen(spec.port || 8088);
};


var stopWS = exports.stopWS = function(app) {
    if (app) {
        app.close();
        if (app.myInterval) {
            clearInterval(app.myInterval);
        }
    }
};

