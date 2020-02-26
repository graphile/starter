# Docker mode

If you're not using Docker for development you can delete this folder.

## Docker development notes

If you don't `export UID` then Docker on Linux may create the files and folders
as root. We strongly advise you `export UID`.

PostgreSQL logs from Docker on stdout can be overwhelming, so we recommend to
only start the `db` services in detached mode: `docker-compose up -d db`.

To see logs on your `stdout` you can use: `docker-compose logs db` anytime.

We've enabled `log_truncate_on_rotation` but you may need to prune these
periodically. See
[log file maintenance](https://www.postgresql.org/docs/current/logfile-maintenance.html).

Our Docker setup seems to trigger more watch events than the local one, so it
seems to do more redundant work/produce more output. A PR to fix this would be
welcome!

## Using and developing with included `docker-compose` setup

This feature was the result of a herculean effort from @JoeSchr.

### Explanation:

The docker environment (`docker-compose.yml`) is set up so you can almost work
with this repo like you would directly.

There is a `server` docker-compose service which has `node` and `yarn` already
installed. Once you have everything setup you can simply start it via
`docker-compose up`, or use the the alias `yarn docker start`, which does some
more useful stuff as well. The `yarn docker` commands are provided by
`docker/package.json`.

You also could start the service in detached mode, then attach into the running
service to work from inside the container like you would locally. If you want,
you can do this with the `dev` service instead of the `server` service. The
`dev` service provides a few more developer tools (like `git`, `tmux`, ...)
which are helpful for developing, but it is not appropriate for production usage
and may make it harder to reproduce issues.

**NOTE (for Windows)**: For _hot-reloading_ to work, you may need to install and
run
[docker-volume-watcher](https://github.com/merofeev/docker-windows-volume-watcher)

#### DB tool:

To connect to the container database with psql or another database tool, use
port 6543 on localhost and populate the `DATABASE_NAME`, `DATABASE_OWNER` and
`DATABASE_OWNER_PASSWORD` from your `.env` file:

```bash
$ psql "postgres://$DATABASE_OWNER:$DATABASE_OWNER_PASSWORD@localhost:6543/$DATABASE_NAME"
```

#### Use Case Example:

> Attach to `dev`, run `yarn db commit` to commit the latest migration, then
> keep on developing on your React client with hot reloading:

```sh
# make sure everything is ready to start and no ports are blocked
$ docker-compose down
# start dev (and linked db) service in detached mode (so we can continue typing)
$ docker-compose up -d dev
# attach to dev container shell
$ docker-compose exec dev bash
# commit migration from inside container
@dev $ yarn db commit
# develop on client with hot reloading
@dev $ yarn start
# when it prompts you to do so, open `http://localhost:5678` in your browser
```

> Compact alias for above:

```sh
# make sure everything is ready to start and no ports are blocked
# start dev (and linked db) service in detached mode (so we can continue typing)
# attach to dev container shell
$ yarn docker dev
# commit migration from inside container
@dev $ yarn db commit
# develop on client with hot reloading
@dev $ yarn start
# when it prompts you to do so, open `http://localhost:5678` in your browser
```

### About `dev` docker-compose service

There is another "secret" service, `dev`, inside `docker-compose.yml` which
extends `server`, our normal `node.js` server service container.

This decision was made to separate the docker services, one for minimal setup
and for comfortable development.

The `server` service is for starting the Node.js server with React and Next.js,
and will keep running until `yarn start` stops or crashes. This is similar to a
production deployment environment except hot reload, environment variables, and
similar things are tuned for active development (and are not production ready).
See:
[Building the production docker image](#building_the_production_docker_image),
on how to optimize your `Dockerfile` for production.

The `dev` service is for attaching to a Docker container's `bash` shell and
developing actively from inside. It has several developer tools and configs (for
example git, vim, ...) already installed.

**Aliases** for quickly using `dev` container (without VSCode):

#### Attach to shell, inside `dev` container:

```
yarn docker dev
```

#### Run `yarn start` inside `dev` container:

```
yarn docker dev:start
```

See `docker/package.json` to learn about more aliases.

### About VSCode with Remote Container Extension

A `.devcontainer` folder is also provided, which enables the
`Visual Studio Code Remote - Containers` extension (install with ctrl+p, then
`ext install ms-vscode-remote.vscode-remote-extensionpack`) to develop from
inside the container.

> The Visual Studio Code Remote - Containers extension lets you use a Docker
> container as a full-featured development environment. It allows you to open
> any folder inside (or mounted into) a container and take advantage of Visual
> Studio Code's full feature set. A `devcontainer.json` file in your project
> tells VS Code how to access (or create) a development container with a
> well-defined tool and runtime stack. This container can be used to run an
> application or to sandbox tools, libraries, or runtimes needed for working
> with a codebase.

> Workspace files are mounted from the local file system or copied or cloned
> into the container. Extensions are installed and run inside the container,
> where they have full access to the tools, platform, and file system. This
> means that you can seamlessly switch your entire development environment just
> by connecting to a different container.

> This lets VS Code provide a local-quality development experience — including
> full IntelliSense (completions), code navigation, and debugging — regardless
> of where your tools (or code) are located.

See
[Developing inside a Container](https://code.visualstudio.com/docs/remote/containers)
for more.

Once one-time setup is complete, you can open this container in VSCode whenever
you like.

This feels like developing locally, whilst having the advantages of a
pre-configured Docker environment.

#### If you want to use your local configs e.g. `gitconfig` your `ssh` creds.

Uncomment `postCreateCommand` in `devcontainer.json` and the appropriate volume
mounts at service `dev` in `docker-compose.yml`

**BE AWARE:** on Windows your whole `$HOME` folder will be copied over,
including all your `ssh` creds.

### Using VSCode with Remote Container Extension

### Open project in VSCode and start developing

- Install vscode-extension:
  [ms-vscode-remote.remote-container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Press `Ctrl+Shift+P`
- Type `>Remote-Containers: Reopen in Container`
- Develop as if you were developing locally
- e.g. Use VSCode File Explorer
- e.g. Run extensions only inside this environment
- e.g. Use bash inside container directly: `yarn start`
  - Try: `Ctrl+Shift+~`, if shell panel is hidden

## Troubleshooting

If you run `docker-compose run server` (rather than `docker-compose up server`)
the ports won't be exposed, so you cannot view your server.
