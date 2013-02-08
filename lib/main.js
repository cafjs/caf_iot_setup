
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
var setup = require('./setup');

var config = {
    // dirname: <string>  no extra static public dir
    port: 8080

};


var startWS = exports.startWS = function(spec) {

    spec = spec || config;
    var app =  express.createServer();
    app.use(express.bodyParser());
    app.use(app.router);
    if (spec.dirname) {
        app.use(express.static(dirname));
    }
    app.use(express.static(__dirname + '/../public'));
    app.post('/configure', function(req, res) {
                 setup.doIt(spec, req.body);
             });
    app.listen(spec.port || 8080);
};


var stopWS = exports.stopWS = function(app) {
    if (app) {
        app.close();
    }
};

