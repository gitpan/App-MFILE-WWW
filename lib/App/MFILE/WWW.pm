# ************************************************************************* 
# Copyright (c) 2014, SUSE LLC
# 
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
# 
# 1. Redistributions of source code must retain the above copyright notice,
# this list of conditions and the following disclaimer.
# 
# 2. Redistributions in binary form must reproduce the above copyright
# notice, this list of conditions and the following disclaimer in the
# documentation and/or other materials provided with the distribution.
# 
# 3. Neither the name of SUSE LLC nor the names of its contributors may be
# used to endorse or promote products derived from this software without
# specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
# ************************************************************************* 

# ------------------------
# App::MFILE::WWW top-level module
# ------------------------

package App::MFILE::WWW;

use 5.012;
use strict;
use warnings;

use App::CELL qw( $CELL $log $site $meta );
use Exporter qw( import );
use File::ShareDir;
use File::Spec;
use Log::Any::Adapter;
use Params::Validate qw( :all );



=head1 NAME

App::MFILE::WWW - Generic web front-end with demo app




=head1 VERSION

Version 0.097

=cut

our $VERSION = '0.097';




=head1 LICENSE

This software is distributed under the "BSD 3-Clause" license, the text of
which can be found in the file named C<COPYING> in the top-level distro
directory. The license text is also reprodued at the top of each source file.



=head1 DESCRIPTION

This distro contains a generic framework for developing web front-ends to 
REST resources. The framework consists of a web server based on Plack and
L<Web::Machine>, CSS and HTML for the "app frame" (on-screen area where the
application's "screens" are displayed), and "widgets" for defining the
application's login dialog, menus, forms, and actions. 

For illustration, the distro contains a demo app that authenticates against
L<App::Dochazka::REST> and contains a single menu, a simple form, and a
sample action.




=head1 STACK

The full stack of which L<App::MFILE::WWW> is a part consists of the
following components:

=over

=item * Database engine

For storing application data.

=item * Perl DBI

For interfacing between the Perl code and the database engine.

=item * REST server

A REST server, such as L<App::Dochazka::REST>, implements a data model and
provides a HTTP interface to that model.

=item * optional CLI client/frontend

An optional Command Line Interface (frontend) can provide a command line
interface to the REST server.

=item * WWW client/frontend

The WWW frontend, built based on this distro, is a web server that serves HTML,
CSS, and JavaScript code to users to provide them with a menu-driven "browser
experience" of the application.

=back

Conceptually, the clients (frontends) act as proxies between the user and
the REST server. Taking this one step further, the REST server itself is a
proxy between the client and the database engine.

From a technical perspective, the strict separation between the REST server
and its clients makes the application as a whole more robust.



=head1 DERIVED WWW CLIENTS

The philosophy behind the stack design described above is that you, the
user, have the freedom and the flexibility to write your own client, on any
platform, in any language -- however you see fit. In other words, you are
not forced to use any particular client. Conceivably, you can even
communicate with the REST server without any client at all.

However, writing a client is time- and labor-intensive. Although
L<App::MFILE::WWW> is capable of standalone operation, it is designed as a
"foundation" upon which derived clients can be written. 


=head2 Standalone operation

L<App::MFILE::WWW> can be run as a standalone HTTP server. Authentication
is disabled by default, so no REST server is needed in this scenario.

Before a derived client can be written, the developer must first understand
how L<App::MFILE::WWW> is structured. This is easily understood by
examining how it works in standalone mode.

Assuming L<App::MFILE::WWW> has been installed properly, it can be started
in standalone mode by running C<mfile-www>, as a normal user, with no
arguments or options. Here is a basic description of what happens in this
scenario -- refer to the script source code in C<bin/mfile-www> for better
understanding:

=over

=item * by default (in the absence of the C<--ddist> option), C<$ddist> is
set to the empty string

=item * C<$ddist_dir> is not set

=item * the script calls the C<App::MFILE::WWW::init> routine, which loads
the configuration parameters stored in C<config/WWW_Config.pm> of the
core distro (L<App::MFILE::WWW>) sharedir

=item * since no C<sitedir> option was specified on the command line, no
other configuration files are loaded

=item * the configuration parameters and their core default values can be
seen in C<config/WWW_Config.pm> under the core distro (L<App::MFILE::WWW>)
sharedir

=item * a very important configuration parameter is MFILE_WWW_LOG_FILE,
which is the full path to the log file where the Perl side of
L<App::MFILE::WWW> will write its log messages -- by default, this is set
to '.mfile-www.log' in the user's home directory, and the current setting is
always reported on-screen by the startup script so the user knows where to
look if something goes wrong

=item * the HTTP server is started by calling L<Plack::Runner>, and the
script reports to the user the port number at which it is listening (5001 by
default)

=item * the HTTP server always interprets URL paths it receives relative to
its "root" (called C<HTTP_ROOT> for the purposes of this document), which
is set to the core distro (L<App::MFILE::WWW>) sharedir in this case

=item * JS and CSS files are considered "static content" and will be served
from C<HTTP_ROOT/js> and C<HTTP_ROOT/css>, respectively

=item * when an HTTP 'GET' request comes in on the port where the HTTP
server is listening, and it is not requesting static content, the request
is passed on to the L<Web::Machine> application (effectively,
L<App::MFILE::WWW::Resource>) for processing

=item * POST requests are assumed to be AJAX calls and are handled by the
C<process_post> routine of L<App::MFILE::WWW::Resource>

=item * GET requests are assumed to have originated from a web browser
running on a user's computer -- to handle these, the C<main_html> routine
of C<Resource.pm> generates HTML code which is sent back in the HTTP
response

=item * the HTML so generated contains embedded JavaScript code to start up
L<RequireJS|http://requirejs.org> with the required configuration
and pass control over to "the JavaScript side" of L<App::MFILE::WWW>

=back

The embedded JavaScript code does the following:

=over

=item * sets the C<baseURL> to C<$site->MFILE_WWW_REQUIREJS_BASEURL>, which
is set to C</js> -- in absolute terms, this means C<HTTP_ROOT/js>

=item * sets the "C<app>" path config to C<$site->MFILE_APPNAME> -- for
example, if C<$site->MFILE_APPNAME> is set to 'foobar', the path config for
C<app> will be set to C<foobar> and a RequireJS dependency C<app/bazblat>
on the JavaScript side will translate to C<HTTP_ROOT/js/foobar/bazblat.js>

=item * in this particular case, of course, C<MFILE_APPNAME> is set to
C<mfile-www>

=item * persuades RequireJS via magic incantations to "play nice" together
with jQuery and QUnit

=item * by calling C<requirejs.config>, brings in site configuration
parameters needed on the JavaScript side so they can be accessed via the
C<cf> JS module

=item * passes control to the C<app/main> JS module

=back

What happens on the JavaScript side is described in a different section of
this documentation.


=head2 Derived client operation

In a derived-client scenario, L<App::MFILE::WWW> is basically used as a
library, or framework, upon which the "real" application is built.

The derived-client handling is triggered by providing the C<--ddist>
command-line option, i.e.

    $ mfile-www --ddist=App-Dochazka-WWW

Where 'App-Dochazka-WWW' refers to the Perl module L<App::Dochazka::WWW>,
which is assumed to contain the derived client source code.

So, in the first place it is necessary to create such a Perl module. The
L<App::MFILE::WWW> module can be used as a template. It should have a
sharedir configured and present.

Here is a "play-by-play" description of what happens in this scenario when
the startup script is run. Again, refer to the script source code in
C<bin/mfile-www> for better understanding:

=over

=item * C<$ddist> is set to the string given in the C<--ddist> option, e.g.
C<App-Dochazka-WWW> (or 'App::Dochazka::WWW' in which case it will be converted
to the correct, hyphen-separated format)

=item * C<$ddist_dir> is set to C<File::ShareDir::dist_dir( $ddist )>, i.e.
the derived distro sharedir (extending the above example, the distro sharedir
of L<App::Dochazka::WWW>)

=item * the presence of the C<--ddist> option triggers a special routine
whose purpose is to ensure that the derived distro exists and that its
sharedir is properly set up to work with L<App::MFILE::WWW>:

    =over

    =item * error exit if the distro referred to by the C<--ddist> option
    doesn't exist 

    =item * error exit if the distro lacks a sharedir

    =item * C<css> and C<js/core> need to exist and be symlinks to the same
    directories in the L<App::MFILE::WWW> sharedir. If this is not the
    case, the script displays a message asking the user to re-run the
    script as root

    =item * if already running as root, the symlinks are created and the
    script displays a message asking to be re-run as a normal user

    =item * once the symlinks are in place, the script runs some sanity
    checks (mainly verifying the existence of certain files in their
    expected places)

    =back

=item * the script calls the C<App::MFILE::WWW::init> routine, which loads
the configuration parameters stored in the following places:

    =over

    =item * the L<App::MFILE::WWW> distro sharedir (under C<config/WWW_Config.pm>)

    =item * the derived distro sharedir (also under C<config/WWW_Config.pm>)

    =item * finally and optionally, if a sitedir was specified on the
    command line -- for example C<--sitedir=/etc/dochazka-www> --,
    configuration parameters are loaded from a file C<WWW_SiteConfig.pm> in
    that directory, overriding the defaults

    =back

=item * the derived distro's configuration should override the
MFILE_APPNAME parameter -- in our example, it could be set to 'dochazka-www'

=item * also refer to the previous section to review the explanation of the
MFILE_WWW_LOG_FILE parameter

=item * the HTTP server is started by calling L<Plack::Runner>, and the
script reports to the user at what port number it is listening (5001 by
default)

=item * the HTTP server always interprets URL paths it receives relative to
its "root" (called C<HTTP_ROOT> for the purposes of this document), which
is set to the I<derived distro's sharedir>

=item * the rest of the description is the same as for L<Standalone
operation>

=back




=head1 REQUEST-RESPONSE CYCLE

The HTTP request-response cycle is implemented as follows:

=over

=item * B<nginx> listens for incoming connections on port 80/443 of the server

=item * When a connection comes in, B<nginx> decrypts it and forwards it to a
high-numbered port where a PSGI-compatible HTTP server (such as L<Starman>) is
listening

=item * The HTTP server takes the connection and passes it to the Plack middleware.
The key middleware component is L<Plack::Middleware::Session>, which assigns an
ID to the session, stores whatever data the server-side code needs to associate
with the session, links the session to the user's browser via a cookie, and
provides the application a hook (in the Plack environment stored in the HTTP
request) to access the session data

=item * if the connection is asking for static content (defined as anything in
C<images/>, C<css/>, or C<js/>), that content is served immediately and the
request doesn't even make it into our Perl code

=item * any other path is considered dynamic content and is passed to
L<Web::Machine> for processing -- L<Web::Machine> implements the HTTP standard
as a state machine

=item * the L<Web::Machine> state machine takes the incoming request and runs
it through several functions that are overlayed in L<App::MFILE::WWW::Resource>
- an appropriate HTTP error code is returned if the request doesn't make it
through the state machine. Along the way, log messages are written to the log.

=item * as part of the state machine, all incoming requests are subject to
"authorization" (in the HTTP sense, which actually means authentication).
First, the session data is examined to determine if the request belongs to an
existing authorized session. If it doesn't, the request is treated as a
login/logout attempt -- the session is cleared and control passes to the 
JavaScript side, which, lacking a currentUser object, displays the login
dialog.

=item * once an authorized session is established, there are two types of
requests: GET and POST

=item * incoming GET requests happen whenever the page is reloaded -
in an authorized session, this causes the main menu to be displayed, but all
static content (CSS and JavaScript modules) are reloaded for a "clean slate",
as if the user had just logged in.

=item * Note that L<App::MFILE::WWW> pays no attention to the URI - if the user
enters a path (e.g. http://mfile.site/some/bogus/path), this will be treated
like any other page (re)load and the path is simply ignored.

=item * if the session is expired or invalid, any incoming GET request will
cause the login dialog to be displayed.

=item * well-formed POST requests are assumed to be AJAX calls and are
directed to the C<process_post> routine, which first examines the request body, 
which must adhere to a simple structure:

    { method: "GET", path: "employee/current", body: { ... } }

where 'method' is any HTTP method accepted by the REST server, 'path' is a
valid path to a REST server resource, and 'body' is the content body to be
sent in the HTTP request to the REST server. Provided the request is properly
authorized and the body is well-formed, the request is forwarded to the REST
server via the L<App::MFILE> package's C<rest_req> routine and the REST
server's response is sent back to the user's browser, where it is processed by
the JavaScript code.

=item * under ordinary operation, the user will spend 99% of her time
interacting with the JavaScript code running in her browser, which will
communicate asynchronously as needed with the REST server via AJAX calls.

=back


=head1 DEVELOPMENT NOTES

The L<App::MFILE::WWW> codebase has two parts, or "sides": the "Perl side"
and the "JavaScript side". Control passes from the Perl side to the
JavaScript side

=over

=item * B<synchronously> whenever the user (re)loads the page

=item * B<asynchronously> whenever the user triggers an AJAX call

=back


=head3 JavaScript side

=head4 Modular (RequireJS)

The JavaScript code is modular. Each code module has its own file and
modules are loaded asynchronously by L<RequireJS|http://requirejs.org/>.

=head4 Unit testing (QUnit)

The JavaScript code included in this package is set up for unit testing
using the QUnit L<http://qunitjs.com/> library.



=head3 UTF-8

In conformance with the JSON standard, all data passing to and from the
server are assumed to be encoded in UTF-8. Users who need to use non-ASCII
characters should check their browser's settings.


=head2 Deployment

To minimize latency, L<App::MFILE::WWW> can be deployed on the same server
as the back-end (e.g. L<App::Dochazka::REST>), but this is not required.

=cut



=head1 PACKAGE VARIABLES

For convenience, the following variables are declared with package scope:

=cut

my $dist_dir = File::ShareDir::dist_dir( 'App-MFILE-WWW' );



=head1 FUNCTIONS

=head2 init

Initialization routine - run from C<bin/mfile-www>, the server startup script.
This routine loads configuration parameters from files in the distro and site
configuration directories, and sets up logging.

=cut

sub init {
    my %ARGS = validate( @_, { 
        sitedir => { type => SCALAR, optional => 1 },
        debug_mode => { type => SCALAR, optional => 1 },
    } );

    # * load site configuration
    my $status = _load_config( %ARGS );
    return $status if $status->not_ok;

    # * set up logging
    return $CELL->status_not_ok( "MFILE_APPNAME not set!" ) if not $site->MFILE_APPNAME;
    my $debug_mode;
    if ( exists $ARGS{'debug_mode'} ) {
        $debug_mode = $ARGS{'debug_mode'};
    } else {
        $debug_mode = $site->MFILE_REST_DEBUG_MODE || 0;
    }
    unlink $site->MFILE_WWW_LOG_FILE if $site->MFILE_WWW_LOG_FILE_RESET;
    Log::Any::Adapter->set('File', $site->MFILE_WWW_LOG_FILE );
    $log->init( ident => $site->MFILE_APPNAME, debug_mode => $debug_mode );
    $log->info( "Initializing " . $site->MFILE_APPNAME );

    return $CELL->status_ok;
}

sub _load_config {
    my %ARGS = @_;
    my $status;

    # always load the App::MFILE::WWW distro sharedir
    my $target = File::Spec->catfile( $dist_dir, 'config' );
    $log->debug( "About to load App::MFILE::WWW configuration parameters from $target" );
    $status = $CELL->load( sitedir => $target );
    return $status if $status->not_ok;

    # load additional sitedir if provided by caller in argument list
    if ( $ARGS{sitedir} ) {
        $status = $CELL->load( sitedir => $ARGS{sitedir} );
        return $status if $status->not_ok;
    }

    return $CELL->status_ok;
}


1;
