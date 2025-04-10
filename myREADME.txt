```sh
export UID; docker compose up db
docker logs starter-db-1
# export UID; yarn docker setup
export UID; yarn setup
n ./.env
n ./docker/.env

sd 'connectionString' 'connectionString.replace("6543", "5432")' @app/db/scripts/dump-db.js

yarn workspace @app/server build
yarn workspace @app/server schema:export:node
yarn workspace @app/server start

tsc -b --watch --preserveWatchOutput
yarn workspaces foreach --verbose --parallel --interlaced --exclude ROOT --exclude docker-helpers run watch
yarn workspaces foreach --verbose --parallel --interlaced --exclude ROOT --exclude docker-helpers run dev
yarn test:watch --delay 10

NODE_OPTIONS="" yarn workspace "@app/client" run dev
```
