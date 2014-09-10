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
use Mason;
use Params::Validate qw( :all );



=head1 NAME

App::MFILE::WWW - generic web front-end with demo app




=head1 VERSION

Version 0.079

=cut

our $VERSION = '0.079';




=head1 LICENSE

This software is distributed under the "BSD 3-Clause" license, the text of
which can be found in the file named C<COPYING> in the top-level distro
directory. The license text is also reprodued at the top of each source file.





=head1 DESCRIPTION

This distro contains a generic framework for developing web front-ends to 
REST resources. The framework includes a web server (based on Plack and
L<Web::Machine>), CSS and HTML for the "frame" where the application
displays its screens, and "widgets" for defining the application's login
dialog, menus, forms, and actions. 

For illustration, the distro contains a demo app that works with
L<App::Dochazka::REST>.


=head1 INTRODUCTION

The full stack, of which L<App::MFILE::WWW> is a part, consists of the
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

The WWW frontend, based on this distro, is a web server that serves HTML,
CSS, and JavaScript code to users for a menu-driven "browser experience" of
the application.

=back

Conceptually, the clients act as proxies between the user and the REST
server. Taking this one step further, the REST server itself is a proxy between
the client and the database engine.

The philosophy behind this design is that you, the user, have the freedom and
the flexibility to write your own client, on any platform, in any language --
however you see fit. 


=head1 MAJOR COMPONENTS

The web frontend is implemented using the following technologies:

=over

=item * B<Perl> - server-side code

=item * B<nginx> - reverse proxy (optional)

=item * L<HTTP::Server::PSGI>, L<Starman>, or other PSGI-compatible HTTP server

=item * L<Plack> - interface with HTTP server 

=item * L<Web::Machine> - HTTP request/response cycle

=item * L<App::MFILE::WWW::Resource> - overlays L<Web::Machine::Resource>

=item * HTML and CSS code served to the user's browser

=item * L<JavaScript> code served to and running in the user's browser

=item * AJAX calls from the JavaScript code back to the web server, which
forwards them to the REST server and sends the results back to the
JavaScript side - see the next section for details

=back


=head2 Request-response cycle

A more detailed description of the request-response cycle implemented by
L<App::MFILE::WWW>:

=over

=item * B<nginx> listens for incoming connections on port 80/443 of the server

=item * When a connection comes in, B<nginx> decrypts it and forwards it to a
high-numbered port where Starman is listening

=item * Starman takes the connection and passes it to the Plack middleware

=item * the key middleware component is L<Plack::Middleware::Session>, which
assigns an ID to the session, maintains whatever data the server-side
code needs to associate with the session, links the session to the user's
browser via a cookie, and provides the application a hook (in the Plack
environment that is included in the HTTP request) to access the session data

=item * if the connection is asking for static content (defined as anything in
C<images/>, C<css/>, or C<js/>), Plack and Starman serve that content
immediately and the request doesn't even make it into our code

=item * any other path is considered dynamic content and is passed to
L<Web::Machine> for processing -- L<Web::Machine> implements the HTTP standard
as a state machine

=item * the L<Web::Machine> state machine takes the incoming request and runs
it through several functions that are implemented in
L<App::MFILE::WWW::Resource> -- for example, 'malformed_request' examines
the request body, if any, and if it is not valid JSON, the HTTP server returns
'400 Malformed Request'

=item * as part of the state machine, all incoming requests are subject to
"authorization" (in the HTTP sense), which actually means authentication.
First, the session data is examined to determine if the request belongs to an
authorized session. If it doesn't, the request is treated as a login/logout
attempt.

=item * once an authorized session is established, there are two types of
requests: GET and POST

=item * incoming GET requests can happen when the page is reloaded -
in an authorized session, this causes the main menu to be displayed. JavaScript
form buffers and other data structures are reset to their default values. Note
that L<App::MFILE::WWW> pays no attention to the URI - if the user enters
a path (e.g. http://mfile.site/some/bogus/path), this will be treated like
any other page reload.

=item * if the session is expired or invalid, any incoming GET request will
cause the login dialog to be displayed.

=item * well-formed POST requests are assumed to be AJAX calls and are
processed by the C<process_post> routine. First, the request body is examined.
The request body of all AJAX calls must adhere to a simple structure:

    { method: "GET", path: "employee/current", body: { ... } }

where 'method' is either GET or POST, 'path' is the path to the REST server
resource being requested, and 'body' is the request body to be forwarded 
to the REST server. Provided the request is properly authorized and the
body is well-formed, the request is forwarded to the REST server and the 
REST server's response is sent back to the user's browser, where it is
processed by the JavaScript code.

=item * under ordinary operation, the user will spend 99% of her time
interacting with the JavaScript code running in her browser, which will
communicate asynchronously with the REST server via AJAX calls as described
above.

=back


=head2 Development notes

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

Initialization routine - runs when the server is started. Loads configuration
files from the distro and site configuration directories, and sets up logging.

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
