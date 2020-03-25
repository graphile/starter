# @app/lib

Various utilities, mostly React hooks.

## Compilation

Note that these components are compiled to on-disk JS in the same way as the
other packages (except client) so that Next.js can require them as if they were
regular NPM dependencies (thus Next does not need to know about monorepos, or
how to transpile this code).
