
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
// init/dmenu-source-start 
//
// generate 'source' property and 'start' method and add them to each dmenu
// object
//
"use strict";

define([
    'jquery',
    'lib',
    'target'
], function (
    $,
    lib,
    target
) {

    return function () {

        var i,
            dmenus,
            dmenuSource = function (dmn) {
                // dmn is dmenu name
                // dmo is dmenu object
                var dmo = target.pull(dmn),
                    r = '',
                    len = dmo.entries.length,
                    i,
                    back = target.pull(dmo.back),
                    entry;
            
                r += '<form id="' + dmn + '"><br><b>' + dmo.title + '</b><br><br>';
    
                for (i = 0; i < len; i += 1) {
                    // the entries are names of targets
                    entry = target.pull(dmo.entries[i]);
                    if (lib.privCheck(entry.aclProfile)) {
                        r += i + '. ' + entry.menuText + '<br>';
                    }
                }
                r += 'X. ' + back.menuText + '<br>';
                r += '<br><b>Your choice:</b> <input name="sel" size=3 maxlength=2> ' +
                          '<input type="submit" value="Submit"><br><br></form>';
                return r;
            },
            dmenuSubmit = function (dmn) {
                // dmn is dmenu name
                // dmo is dmenu object
                var dmo = target.pull(dmn),
                    sel = $('input[name="sel"]').val(),
                    len = dmo.entries.length,
                    entry,
                    selection;
            
                if (sel >= 0 && sel <= len) {
                    // we can only select the entry if we have sufficient priv level
                    selection = target.pull(dmo.entries[sel]);
                    if (lib.privCheck(selection.aclProfile)) {
                        //console.log('Selection ' + sel + ' passed priv check');
                        entry = selection;
                    }
                } else if (sel === 'X' || sel === 'x') {
                    entry = target.pull(dmo.back);
                }
                if (entry !== undefined) {
                    //console.log("Selected " + dmn + " menu entry: " + entry.name);
                    //console.log("About to call the 'start' method of ", entry);
                    entry.start();
                }
            },
            dmenuSubmitKey = function (dmn) {
                return function (event) {
                    event.preventDefault();
                    //console.log("Submitting: " + dmn);
                    dmenuSubmit(dmn);
                };
            },
            dmenuKeyListener = function (dmn) {
                return function (event) {
                    lib.logKeyPress(event);
                    if (event.keyCode === 13) {
                        dmenuSubmitKey(dmn);
                    } else if (event.keyCode === 9) {
                        event.preventDefault();
                    }
                };
            },
            dmenuStart = function (dmn) {
                // dmn is dmenu name
                // dmo is dmenu object
                var dmo = target.pull(dmn);
                return function () {
                    $('#mainarea').html(dmo.source);
                    $('input[name="sel"]').val('').focus();
                    $('#' + dmn).submit(dmenuSubmitKey(dmn));
                    $('input[name="sel"]').keydown(dmenuKeyListener(dmn));
                };
            };
    
        // loop through the dmenu objects, adding 'source' and 'start' to each

        dmenus = target.getAll('dmenu');
        //console.log("dmenu-source-start about to loop through all dmenus ", dmenus);
        for (i in dmenus ) {
            if (dmenus.hasOwnProperty(i)) {
                dmenus[i].source = dmenuSource(i);
                dmenus[i].start = dmenuStart(i);
            }
        }

    };

});
