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

We presume that we are only going to install the current version of the `main`
branch from the standard repository onto the production machine. This version
has the advantages of having undergone code review and automated unit and
end-to-end tests. Nevertheless, before installing any version, you should
manually make sure it seems to be working properly, one last time:

1. Make sure you have the latest version of `main` from the standard
   repository pulled and checked out on your own machine (or in any case, a
   non-production computer).
2. Execute `npm run test:e2e`.
3. Assuming all passes, execute `npm run preview`.
4. Connect to the provided URL, and try a few things with the resulting
   Numberscope instance that you've never tried before, and a couple that you
   have done many times, to make sure that all seems to be operating.

When you've done all that, it's OK to install that version on the official
numberscope server.

1. Log into the numberscope server and `cd ~scope/repos/frontscope`.
2. Execute `sudo -u scope git pull`.
3. Execute `sudo -u scope npm install`.
4. Execute `sudo -u scope npm run build`.
5. Execute `sudo systemctl restart numberscope`. Note that this step is may
   generally be unnecessary for the service to update to the new version, but
   is good hygeine for the server in any case.
6. Execture `sudo systemctl status numberscope` to verify that the server
   believes the service is running.
7. Check that the numberscope front end at the primary server URL is working
   and serving the updated version of Numberscope (by browsing to that URL and
   again trying some tasks, especially ones that exercise any new features in
   the version you have just installed).
