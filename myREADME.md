```sh
export UID; docker compose up db

tsc -b --watch --preserveWatchOutput
yarn workspaces foreach --verbose --parallel --interlaced --exclude ROOT --exclude docker-helpers run watch
yarn workspaces foreach --verbose --parallel --interlaced --exclude ROOT --exclude docker-helpers run dev
yarn test:watch --delay 10
```
