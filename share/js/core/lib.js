// ************************************************************************* 
// Copyright (c) 2014, SUSE LLC
// 
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice,
// this list of conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright
// notice, this list of conditions and the following disclaimer in the
// documentation and/or other materials provided with the distribution.
// 
// 3. Neither the name of SUSE LLC nor the names of its contributors may be
// used to endorse or promote products derived from this software without
// specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
// ************************************************************************* 
//
// lib.js
//
"use strict";

define ([
    'current-user',
    'prototypes'
], function (
    currentUser,
    prototypes
) {

    return {

        // give object a "haircut" by throwing out all properties
        // that do not appear in proplist
        hairCut: function (obj, proplist) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (proplist.indexOf(prop) !== -1) {
                        continue;
                    }
                    delete obj[prop];
                }
            }
            return obj;
        },

        // log events to browser JavaScript console
        logKeyPress: function (event) {
            console.log("WHICH: " + event.which + ", KEYCODE: " + event.keyCode);
        },

        // check current employee's privilege against a given ACL profile
        privCheck: function (p) {
            var cep = currentUser.priv;
            if (p === 'passerby') {
                return true;
            }
            if (p === 'inactive' && cep !== 'passerby') {
                return true;
            }
            if (p === 'active' && cep !== 'passerby' && cep !== 'inactive') {
                return true;
            }
            if (p === 'admin' && cep === 'admin') {
                return true;
            }
            return false;
        },

        // right pad a string with spaces 
        rightPadSpaces: function (strToPad, padto) {
            var sp = '&nbsp;',
                padSpaces = sp.repeat(padto - String(strToPad).length);
            return strToPad.concat(padSpaces);
        },

        // constructor for dmenu objects - used in dmenu.js and app/dmenu.js
        dmenuConstructor: function (args) {
            var r = Object.create(prototypes.target);
            r.name = args.name;
            r.menuText = args.menuText;
            r.title = args.title;
            r.get_title = function () { return this.title; };
            r.aclProfile = args.aclProfile;
            return r;
        },

        // constructor for dform objects - used in dform.js and app/dform.js
        dformConstructor: function (args) {
            var r = Object.create(prototypes.target);
            r.name = args.name;
            r.menuText = args.menuText;
            r.title = args.title;
            r.get_title = function () { return this.title; };
            r.preamble = args.preamble;
            r.get_title = function () { return this.preamble; };
            r.aclProfile = args.aclProfile;
            r.entriesRead = args.entriesRead;
            r.get_entriesRead = function () { return this.entriesRead; };
            r.entriesWrite = args.entriesWrite;
            r.get_entriesWrite = function () { return this.entriesWrite; };
            if (args.hasOwnProperty('hookGetObj') && typeof args.hookGetObj === 'function') {
                r.hookGetObj = args.hookGetObj;
            } else {
                r.hookGetObj = function () { return null; };
            }
            return r;
        },

        // constructor for daction objects - used in daction.js and app/daction.js
        dactionConstructor: function (args) {
            var r = Object.create(prototypes.target);
            r.name = args.name;
            r.menuText = args.menuText;
            r.aclProfile = args.aclProfile;
            if (args.hasOwnProperty('start') && typeof args.start === 'function') {
                r.start = args.start;
            }
            return r;
        }

    };
});

