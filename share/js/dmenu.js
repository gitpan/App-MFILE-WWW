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
// dmenu.js -- first-round initialization and storage of dmenu objects
//
// A 'dmenu' is a simple menu that is dynamically generated at runtime.
//
// dmenus are initialized in several rounds -- this module being the first.
// It creates the dmenu module object and populates it with a "core" dmenu,
// called 'demoMenu'. At this point, the demoMenu object is incomplete: it
// is missing 'source', 'start', 'entries', and 'back' properties.
//
// The second round of initialization is the application's dmenu routine,
// (app/dmenu), which adds its own application-specific set of (incomplete)
// dmenus to this object.
//
// In the third round, which can only take place after all daction and
// dform objects have been initialized, the 'entries' and 'back' properties
// are added to each core dmenu object.
//
// Round 4: add 'entries' and 'back' properties to the application's dmenu
// objects.
//
// Finally, in the last round (init/dmenu), a 'source' property and a
// 'start' method are generated and added to each dmenu object created in
// the previous rounds.
//
// (This initialization is driven by the 'main' module.)
//

"use strict";

define ([
    'lib'
], function (
    lib
) {

    return {

        // your app/dmenu should construct dmenu objects like this,
        // and add them to the object returned by this module

        demoMenu: lib.dmenuConstructor({
            'name': 'demoMenu',
            'menuText': 'Demo menu',
            'title': 'Demo menu',
            'aclProfile': 'passerby',
        })
    };

});
