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
var crypto = require('crypto');
var peg = require('pegjs');
var fs = require('fs');

var WPA_SUPPLICANT_CONF = 'wpa_supplicant.conf';
var WPA_SUP_PEGJS = 'wpa_sup.pegjs';

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
 * Returns the WPA PSK passphrase derived from wlan ssid/passwd.
 * 
 * @param {string} ssid Wireless network SSID.
 * @param {string} passwd WLAN password.
 * @param {caf.cb} cb A callback that returns (err, data) where data is a 64 
 * character string with the hex encoded passphrase.
 * 
 */
var pskStr = function(ssid, passwd, cb) {
    crypto.pbkdf2(passwd, ssid, 4096, 256, function(err, key) {
                      if (err) {
                          cb(err);
                      } else {
                          var result = new Buffer(key,"binary").toString("hex");
                          cb(err, result.slice(0, 64));
                      }
                  });
};


/**
 * Parses a wpa_supplicant.conf file returning header and networks config.
 * 
 * type netType is {ssid: string, psk: string}
 * 
 * @param {string} wpaHome
 * @return {{header: string, networks: Array.<netType>}}  A parsed 
 * wpa_supplicant.conf 
 */
var loadWPA = function(wpaHome) {
    var grammar = fs.readFileSync(__dirname + '/' + WPA_SUP_PEGJS, 'utf8');
    var input = fs.readFileSync(wpaHome + '/' + WPA_SUPPLICANT_CONF, 'utf8');
    var parser = peg.buildParser(grammar);
    return parser.parse(input);
};

/**
 * Writes a wpa_supplicant.conf file, versioning the old one.
 * 
 * type netType is {ssid: string, psk: string}
 *
 * @param {string} wpaHome
 * @param {{header: string, networks: Array.<netType>}}  A parsed wpaConfig
 * @param {caf.cb} cb A callback
 */
var writeWPA = function(wpaHome, wpaConfig, cb) {
    var fileOut = wpaHome + '/' + WPA_SUPPLICANT_CONF;
    try {
        fs.renameSync(fileOut, fileOut + '.bak');
    } catch (err) {
         console.log("Cannot rename wpa_supplicant.conf " +
                     JSON.stringify(err));
    }
    // No duplicate SSID, keep the most recent.
    var nets = {};
    wpaConfig.networks.forEach(function(net) {
                                  nets[net.ssid] = net.psk; 
                               });
    var output =  wpaConfig.header;
    for (var ssid in nets) {
        output = output + '\nnetwork={\n     ssid="'+ ssid + 
            '"\n     psk=' + nets[ssid] + '\n}\n'; 
    }
    fs.writeFile(fileOut, output, cb);
};


var updateWPA = function(wpaHome, ssid, passwd, cb) {
    var wpaConfig = {header: 'ctrl_interface=DIR=/var/run/wpa_supplicant' + 
                     ' GROUP=netdev\nupdate_config=1\n', networks: []};
    try {
        wpaConfig = loadWPA(wpaHome);
    } catch (err) {
        console.log("Cannot parse wpa_supplicant.conf " + JSON.stringify(err));
    }
    async.waterfall([
                        function(cb0) {
                            pskStr(ssid, passwd, cb0);
                        }
                    ], function(err, psk) {
                        if (err) {
                            cb(err);
                        } else {
                            wpaConfig.networks.push({ssid: ssid, psk: psk});
                            writeWPA(wpaHome, wpaConfig, cb);
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
                         updateWPA(spec.wpaHome, config.ssid,
                                   config.wpaPassword, cb0);
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
