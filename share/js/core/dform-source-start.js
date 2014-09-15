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
// init/dform-source-start
//
// add 'source' and 'start' properties to dform objects
//
"use strict";

define ([
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
            dforms,
            dformSource = function (dfn) {
                // dfn is dform name
                // dfo is dform object
                var dfo = target.pull(dfn);
                return function (obj) {
            
                    //console.log("Generating source code of dform " + dfn);
                    var r = '<form id="' + dfo.name + '">',
                        len,
                        i,
                        entry;
            
                    r += '<br><b>' + dfo.title + '</b><br><br>';
            
                    if (dfo.preamble) {
                        r += dfo.preamble + '<br><br>';
                    }
            
                    // READ-ONLY entries first
                    len = dfo.entriesRead ? dfo.entriesRead.length : 0;
                    if (len > 0) {
                        for (i = 0; i < len; i += 1) {
                            entry = dfo.entriesRead[i];
                            if (lib.privCheck(entry.aclProfileRead)) {
                                r += lib.rightPadSpaces(entry.text.concat(':'), 13);
                                r += '<span id="' + entry.name + '">' + (obj[entry.prop] || '') + '</span><br>';
                            }
                        }
                        r += '<br>';
                    }
            
                    // READ-WRITE entries second
                    len = dfo.entriesWrite ? dfo.entriesWrite.length : 0;
                    if (len > 0) {
                        for (i = 0; i < len; i += 1) {
                            entry = dfo.entriesWrite[i];
                            if (lib.privCheck(entry.aclProfileWrite)) {
                                r += lib.rightPadSpaces(entry.text.concat(':'), 13);
                                r += '<input id="' + entry.name + '" ';
                                r += 'name="entry' + i + '" ';
                                r += 'value="' + (obj[entry.prop] || '') + '" ';
                                r += 'size="' + entry.maxlen + '" ';
                                r += 'maxlength="' + entry.maxlen + '"><br>';
                            }
                        }
                        r += '<br>';
                    }
            
                    // miniMenu at the bottom
                    len = dfo.miniMenu.entries.length;
                    //console.log("miniMenu length is " + len);
                    if (len > 0) {
                        r += 'Menu:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                        for (i = 0; i < len; i += 1) {
                            //console.log("i === " + i);
                            entry = target.pull(dfo.miniMenu.entries[i]);
                            if (lib.privCheck(entry.aclProfile)) {
                                r += i + '. ' + entry.menuText + '&nbsp;&nbsp;';
                            }
                        }
                        r += 'X. ' + dfo.miniMenu.back[0] + '<br>';
                    } else {
                        r += dfo.miniMenu.back[0] + '<br>';
                    }
            
                    r += '<b>Your choice:</b> <input name="sel" size=3 maxlength=2> ' +
                              '<input id="submitButton" type="submit" value="Submit"><br><br>';
                    r += '</form>';
                    //console.log("Assembled source code for " + dfn + " - it has " + r.length + " characters");
                    return r;
                };
            },
            dformSubmit = function (dfn, obj) {
                // dfn is dform name
                // dfo is dform object
                var dfo = target.pull(dfn);
            
                //console.log("Entering MFILE.dformSubmit with argument " + dfn);
                $('#result').html('');
            
                // validate selection
                var sel = $('input[name="sel"]').val(),
                    len,
                    i,
                    newObj,
                    selection,
                    entry,
                    item;
            
                // if miniMenu has no entries, 'Back' is the only option
                len = dfo.miniMenu.length;
                if (len === 0) {
                    sel = 'X';
                } else if (sel === '') {
                    return;
                }
            
                // clone the object
                newObj = $.extend({}, obj);
            
                // replace the writable properties with the values from the form
                if (dfo.entriesWrite) {
                    len = dfo.entriesWrite.length;
                    for (i = 0; i < len; i += 1) {
                        entry = dfo.entriesWrite[i];
                        newObj[entry.prop] = $('#' + entry.name).val();
                    }
                    //console.log("Modified object based on form contents", newObj);
                }
            
                if (sel >= 0 && sel <= len) {
                    //console.log("sel " + sel + " is within range");
                    // we can only select the item if we have sufficient priv level
                    selection = target.pull(dfo.miniMenu.entries[sel]);
                    if (lib.privCheck(selection.aclProfile)) {
                        //console.log('Selection ' + sel + ' passed priv check');
                        item = selection;
                    }
                } else if (sel === 'X' || sel === 'x') {
                    //console.log('dfo.menu.back:', dfo.miniMenu.back);
                    item = target.pull(dfo.miniMenu.back[1]);
                } else {
                    console.log('Doing nothing');
                }
            
                if (item !== undefined) {
                    //console.log("Selected " + dfn + " menu item: " + item.name);
                    item.start(newObj);
                }
            },
            dformKeyListener = function (dfn, obj) {
                return function (event) {
            
                    var len = $("input:text").length,
                        n = $("input:text").index($(document.activeElement));
    
                    lib.logKeyPress(event);
            
                    if (event.keyCode === 13) {
                        //console.log('Listener detected <ENTER> keypress');
                        //console.log("This form has elements 0 through " + (len - 1));
                        //console.log("The current element is no. " + n);
                        event.preventDefault();
                        if ( n === len - 1 ) {
                            //console.log("Triggering submit button click");
                            $('#submitButton').click();
                        } else {
                            $("input:text")[n + 1].focus();
                        }
            
                    } else if (event.keyCode === 9) {
                        var elnam = $(document.activeElement).attr("name");
                        if (elnam === 'entry0' && event.shiftKey) {
                            event.preventDefault();
                        } else if (elnam === 'sel' && !event.shiftKey) {
                            event.preventDefault();
                        }
                    }
            
                };
            },
            dformListen = function (dfn, obj) {
                //console.log("Listening in form " + dfn);
                $('#' + dfn).submit( function (event) {
                    event.preventDefault();
                    //console.log("Suppressed bogus submit event");
                });
                $('input[name="sel"]').val('');
                if ($('input[name="entry0"]').length) {
                    $('input[name="entry0"]').focus();
                } else {
                    $('input[name="sel"]').focus();
                }
                $('#submitButton').on("click", function (event) {
                    event.preventDefault;
                    console.log("Submitting form" + dfn);
                    dformSubmit(dfn, obj);
                });
                $('#' + dfn).on("keydown", dformKeyListener(dfn, obj));
            },
            dformStart = function (dfn) {
                // console.log('Entering dformStart with argument: ' + dfn);
                var dfo = target.pull(dfn);
                return function () {
                    var obj = dfo.hookGetObj();
                    //console.log('The object we are working with is:', obj);
                    $('#mainarea').html(dfo.source(obj));
                    dformListen(dfn, obj);
                };
            };
    
        dforms = target.getAll('dform');
        for (i in dforms ) {
            if (dforms.hasOwnProperty(i)) {
                dforms[i].source = dformSource(i);
                dforms[i].start = dformStart(i);
            }
        }

    };

});
