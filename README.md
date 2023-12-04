# Essentials API

This repository contains (or will) various APIs used by the Elastos Essentials wallet.
For instance:

- Check if there is a newer app version
- Get user assets
- Get dapps list
- Get tokens price

# Initial setup
- Install mogodb

  TODO
- `npm i -D --legacy-peer-deps`
- Clone `./src/config/env-secret.template` to `./src/config/env-secret.ts`
- Start the API:
  - `npm run start`
- Test API

  http://localhost:3060/api/v1/updates/checkversion?version=3.0.8&platform=android