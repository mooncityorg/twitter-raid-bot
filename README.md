# telegram-raid-bot

> Telegram raid bot written in TypeScript

If you haven't written TypeScript before, don't be scared of it.
It is nearly the same as JavaScript.
But it provides more helpful information before something goes wrong during the runtime.

I learned a lot about JavaScript itself when I started diving into TypeScript.

## Install

```bash
npm install
yarn
```

## Start the bot

### Local development

Write to the @BotFather on Telegram and create your bot.
You will get a token that looks like this: `123:abc`.
Use it as an environment variable (for example via `.env` file or `export BOT_TOKEN=123:abc`).
Tip: When you create a separate bot for your development you can use production and development in parallel.

The bot stores persistent data within the `persist` folder.
So also create this folder before starting it for the first time.

```bash
mkdir persist
```

Then go ahead and start the bot

```bash
npm start
```

### Production

See the Dockerfile.
You can build a container using it.
But this repo isn't about containers.
For more information about them, take a look elsewhere.

The container is meant to be used with an environment variable named `BOT_TOKEN`.

The container has one volume (`/app/persist`) which will contain persistent data your bot creates.
Make sure to explicitly use that volume (for example, make sure it's synced or tied to the host in a multi-node setup).

## Basic Folder structure example

- `source` contains your TypeScript source files. Subfolders contain specifics about your implementation
  - `bot` may contain files relevant for the telegram bot
    - `menu` may contain specifics about the bot, the menu that is shown on /start
  - `magic` may contain something relevant for doing magic. It is not relevant to the bot directly, but it is used by it.
- `locales` contains translation strings for your bot. That way it can speak multiple languages.
- `dist` will contain transpiled JavaScript files.
- `persist` will contain persistent data your bot uses. Make sure to keep that data persistent (Backups for example).

## Improve

Do you think something is missing?
Feel free to add it.
Then everyone can learn that even easier than before
