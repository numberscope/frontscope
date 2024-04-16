# Server administration

This page serves as a guide for Numberscope maintainers concerning the
structure and deployment of the frontscope front end on a production server,
currently numberscope.colorado.edu.

## Organization

On the server machine, there is a dedicated Numberscope user (currently
`scope`). In the home directory of that user, there is a subdirectory `repos`
which contains a clone of the `frontscope` repository.

The nginx `numberscope.conf` file maintained and installed by the
[backscope repository](https://github.com/numberscope/backscope) configures
the production web server to (by default) serve files directly from the `dist`
subdirectory of the frontscope clone in the location described by the previous
paragraph.

Hence, when administering the server, be wary that changes to the dist
subdirectory of the frontscope clone go live instantly.

## How to deploy a new version of frontscope

1. Log into the numberscope server and `cd ~scope/repos/frontscope`.
2. Execute `sudo -u scope git pull`.
3. Execute `sudo -u scope npm install`.
4. Execute `sudo -u scope npm run build`.
5. Check that the numberscope front end at the primary server URL is working
   and serving the updated version of Numberscope.
