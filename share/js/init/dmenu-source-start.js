
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
    'dmenu',
    'init/dmenu-entries-back',
    'lib'
], function (
    $,
    dmenu,
    dmenuEntriesBack,
    lib
) {

    var dummy = Object.create(null),
        i,
        dmenuSource = function (dmn) {
            // dmn is dmenu name
            var r = '',
                len = dmenu[dmn].entries.length,
                i,
                back = dmenu[dmn].back,
                target;
        
            r += '<form id="' + dmn + '"><br><b>' + dmenu[dmn].title + '</b><br><br>';

            for (i = 0; i < len; i += 1) {
                // the entries can be any target (except they hopefully won't be a
                // minimenu)
                target = dmenu[dmn].entries[i];
                if (lib.privCheck(target.aclProfile)) {
                    r += i + '. ' + target.menuText + '<br>';
                }
            }
            r += 'X. ' + back.menuText + '<br>';
            r += '<br><b>Your choice:</b> <input name="sel" size=3 maxlength=2> ' +
                      '<input type="submit" value="Submit"><br><br></form>';
            return r;
        },
        dmenuSubmit = function (dmn) {
            //console.log("Entering dmenuSubmit with argument " + dmn);
        
            var sel = $('input[name="sel"]').val(),
                len = dmenu[dmn].entries.length,
                entry,
                selection;
        
            if (sel >= 0 && sel <= len) {
                // we can only select the entry if we have sufficient priv level
                selection = dmenu[dmn].entries[sel];
                if (lib.privCheck(selection.aclProfile)) {
                    //console.log('Selection ' + sel + ' passed priv check');
                    entry = selection;
                }
            } else if (sel === 'X' || sel === 'x') {
                entry = dmenu[dmn].back;
            }
            if (entry !== undefined) {
                //console.log("Selected " + dmn + " menu entry: " + entry.name);
                console.log("About to call the 'start' method of ", entry);
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
            return function () {
                $('#mainarea').html(dmenu[dmn].source);
                $('input[name="sel"]').val('').focus();
                $('#' + dmn).submit(dmenuSubmitKey(dmn));
                $('input[name="sel"]').keydown(dmenuKeyListener(dmn));
            };
        };

    // loop through the dmenu objects, adding 'source' and 'start' to each
    for (i in dmenu) {
        if (dmenu.hasOwnProperty(i)) {
            dmenu[i].source = dmenuSource(i);
            dmenu[i].start = dmenuStart(i);
        }
    }

    // return a dummy (placeholder) object
    return dummy;
});
