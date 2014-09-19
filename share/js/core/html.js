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
// html.js - functions that generate HTML source code
//
"use strict";

define ([
    'cf',
    'current-user'
], function (
    cf,
    currentUser
) {
    return {
        demoActionFromMenu: function () {
            return '<br><br>SAMPLE ACTION - SOMETHING IS HAPPENING<br><br><br>';
        },
        demoActionFromSubmenu: function () {
            return '<br><br>SAMPLE ACTION - foo bar actioning bazness<br><br><br>';
        },
        loginDialog: function () {
            var r = '';
            r += '<form id="loginform">';
            r += '<br><br><br>';
            r += cf('loginDialogChallengeText');
            r += '<br><br>';
            r += 'Username: <input name="nam" size="' + cf('loginDialogMaxLengthUsername') + '"';
            r += 'maxlength="' + cf('loginDialogMaxLengthUsername') + '" /><br>';
            r += 'Password: <input name="pwd" type="password" size="' + cf('loginDialogMaxLengthPassword') + '"';
            r += 'maxlength="' + cf('loginDialogMaxLengthPassword') + '" /><br><br>';
            r += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            r += '<input type="submit" value="Submit"><br><br>';
            r += '</form>';
            return r;
        },
        logout: function () {
            var r = '';
            r += '<br><br><br>';
            r += 'You have been logged out of our humble application<br><br>';
            r += 'Have a lot of fun!<br><br><br>';
            return r;
        },
        body: function () {
            var r = '',
                cu = currentUser(),
                cunick,
                cupriv,
                nickToDisplay;

            if (cu) {
                cunick = cu.obj.nick || null;
                cupriv = cu.priv || 'passerby';
            } else {
                cunick = null;
                cupriv = 'passerby';
            }
            nickToDisplay = cunick ? cu.obj.nick : '&lt;NONE&gt;';
            
            r += '<div class="abovebox">';
            r += '<p class="alignleft"><span style="font-size: 24px">';
            r += '<strong>' + cf('appName') + '</strong></span>';
            r += '&nbsp;' + cf('appVersion') + '</p>';
            r += '<p class="alignright">Employee: ' + nickToDisplay;
            if (cupriv === 'admin') {
                r += '&nbsp;ADMIN';
            }
            r += '</p>';
            r += '</div>';

            r += '<div class="boxbot" id="header" style="clear: both;">';
            r += '   <span class="subbox" id="topmesg">If application appears';
            r += '   unresponsive, make sure browser window is active and press \'TAB\'</span>';
            r += '</div>';

            r += '<div class="mainarea" id="mainarea"></div>';

            r += '<div class="boxbot" id="result"></div>';

            r += '<div class="statusline" id="statusline"></div>';
            return r;
        }
    }
});
