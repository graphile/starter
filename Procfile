web: node backend/dist/server/index.js
worker: cd backend/dist/worker && graphile-worker
release: yarn db:wipe_if_demo && graphile-migrate
