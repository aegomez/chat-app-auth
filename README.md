# chat-app auth

This is the auth service for the chat application. Source written in **TypeScript** (3.6). Runs on **Node.js**.

## npm scripts

This project was originally configured to use [`pnpm`](https://pnpm.js.org/) as package manager. You are free to use `npm`/`yarn` instead, just notice that there are no `package-lock.json` nor `yarn.lock` files provided (yet).

```sh
# Install pnpm as a global dependency (optional)
npm install -g pnpm@">=4.0.2"
```

> IMPORTANT: Some environment variables must be provided before running the application ([read more](#Environment%20variables)).

```sh
# Replace for 'npm' or 'yarn' as needed

# Install all dependencies
pnpm install

# Transpile all .ts files to .js
# Using tsc, but can be replaced for babel, ...
pnpm run build

# Run the server in DEVELOPMENT mode, 
# (provide an .env file to be used by env-cmd)
pnpm run dev

# Run the server in PRODUCTION mode, 
# (remember to provide the required env variables)
pnpm start

# Run test suite (pending...)
pnpm run test
```

## Environment variables

The following variables must be defined before running the application:
- `MONGODB_URI`: its a [MongoDB Connection String](https://docs.mongodb.com/manual/reference/connection-string/) that includes the username, password (if any), host, port and database name.
- `JWT_SECRET`: the secret string to be used when signing the jwt tokens.
- `PORT`: this is automatically assigned by some services (Heroku), so be careful before setting it (default 2000).

When running the server with the `pnpm run dev` script, the variables are looked from an `.env` file located at root, thanks to then [`env-cmd` library](https://github.com/toddbluhm/env-cmd).

## Technologies

### Authentication

After the user has succesfully registered and signed it, they receive a [JSON Web Token](https://github.com/auth0/node-jsonwebtoken), that can be used as authentication mechanism to gain access to some of the app's protected data.

### Database

An external database service is needed to save the data.
The default configuration uses MongoDB via [`mongoose`](https://mongoosejs.com/), but you can replace it with a different database/library editing the files in `src/database/`.

#### Environment variables

#### Included Docker configuration

An example [`docker-compose`](https://docs.docker.com/compose/) file is provided in the `docker/` directory to start a [MongoDB](https://hub.docker.com/_/mongo) service as container.

You will also need to [set up some environment variables](https://docs.docker.com/compose/environment-variables/) for credentials in the Docker containers. Personally, I used an `.env` file and variable substitution during testing, but this may not work if using Docker Swarm or Kubernetes.

### Server

Running a simple `express` server. May change it in the future.

### Security

- `bcryptjs` to hash data
- `express-validator` for server side validation

### ESLint

The following libraries and plugins are included as devDependencies:
- eslint
- prettier: prettier, config, plugin
- @typescript-eslint: plugin, parser
- typescript + relevant @types packages

See [`.eslintrc.js`](.eslintrc.js) and [`.prettierrc`](.prettierrc) for linter configuration (using recommended *mostly*). Missing a lint script in package.json or pre-commit hook (I'm using an IDE plugin).

## Author

Adrian Gomez

## License

[MIT](LICENSE)