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
 * Scripts to change configuration
 *
 */
var async = require('async');
var exec = require('child_process').exec;
var path = require('path');

var doScript = function(script, cwd, args, cb) {
    var options = {
        env: process.env,
        cwd: cwd
    };
    if (script.indexOf('/') !== 0) {
        script = __dirname + path.sep + script;
    }
    var fullScript = script + ' ' + args.join(' ');
    exec(fullScript, options,
         function(err, stdout, stderr) {
             console.log(fullScript + ' stdout: ' + stdout);
             console.log(fullScript + ' stderr: ' + stderr);
             if (err) {
                 cb(err);
             } else {
                 cb(err, "ok");
             }
         });
};

/**
 * Changes current configuration.
 *
 * specType {home: string, // top directory for the app
 *           wpaHome: string, // directory with wpa config /etc/wpa_suplicant
 *           wpaScript: string, // script to configure wireless
 *           gitScript: string, // script to clone/pull the app code
 *           appScript: string  // script to start the app
 *          }
 * @param {specType} spec Configuration that cannot be changed by user.
 * @param {configType} config  Configuration provided by the client.
 * @param {caf.cb} cb A callback.
 */
exports.doIt = function(spec, config, cb) {
    // TO DO: need to sanitize input in config
    async.series([
                     function(cb0) {
                         doScript(spec.wpaScript, spec.wpaHome,
                                  [config.ssid, config.wpaPassword], cb0);
                     },
                     function(cb0) {
                         doScript(spec.gitScript, spec.home,
                                  [config.git], cb0);
                     },
                     function(cb0) {
                         var url = config.baseUrl + '/iot/' + config.deviceId;
                         doScript(spec.appScript, spec.home, [url], cb0);
                     }], function(err, data) {
                         if (err) {
                             cb(err);
                         } else {
                             cb(err, config);
                         }
                     });
};
