# Reminder Bot

![License](https://img.shields.io/github/license/zS1L3NT/ts-discord-reminder?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-discord-reminder?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-discord-reminder?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-discord-reminder?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-discord-reminder?style=for-the-badge)

Reminder Bot is a Discord bot that can store reminders you want to keep, in the server that you add it too. Reminder bot needs a dedicated text channel to place all reminders into. For every reminder, Reminder bot will update the `Due in` on the embed to let you know how soon the reminder is due in. Reminder Bot was the first bot among all my Discord Bots to make use of a Bot Cache and Guild Cache system, which lead to the creation of [Nova Bot](https://github.com/zS1L3NT/ts-npm-nova-bot)

You can add it to your own server using [this](https://reminder-bot.zectan.com) link, just make sure to give it admin permissions. Reminder Bot is built on top of the [Nova Bot](https://github.com/zS1L3NT/ts-npm-nova-bot) Discord bot framework.

This is an example of a reminder that Reminder bot stores<br>
![Example](https://i.ibb.co/rtB0DMx/reminer.png)

## Motivation

I build this bot because I wanted my whole class to be able to see all upcoming assignments due from Discord.
Furthermore, only one person needs to add and edit reminders so everyone can see the most up-to-date assignment specifications.

## Features

-   Reminders and Drafts
    -   Add reminders by creating a Reminder draft first, which is a Reminder but with in need of modification.
    -   Edit the draft with commands until you're satisfied and use `/reminder post` to convert the draft to a full Reminder
-   Reminders Channel
    -   Reminder bot needs a dedicated text channel to post reminders in. Reminder bot will automatically remove any messages that are irrelevant.
-   Ping Channel
    -   Reminder bot will ping users in the ping channel, which can be set with `/set ping-channel`. Depending on the priority of the reminder, Reminer bot will ping users at different times. These are the times reminder bot will ping about a reminder:
        -   HIGH Priority
            -   7 days before the reminer is due
            -   1 day before the reminer is due
            -   12 hours before the reminer is due
            -   2 hours before the reminer is due
            -   1 hour before the reminer is due
            -   30 minutes before the reminer is due
            -   The moment the reminer is due
        -   MEDIUM Priority
            -   1 day before the reminer is due
            -   2 hours before the reminer is due
            -   The moment the reminer is due
        -   LOW Priority
            -   The moment the reminer is due
-   Discord Commands (Interactivity)
    -   Reminders
        -   `/reminder create` - Create a draft
        -   `/reminder show` - Show the current Reminder draft
        -   `/reminder delete` - Delete a Reminder or draft
        -   `/reminder discard` - Discard the Reminder draft
        -   `/reminder post` - Convert a Reminder draft to a Reminder that appears in the reminders channel
        -   `/reminder title` - Change a title of a Reminder or draft
        -   `/reminder ping-add` - Add the users to ping when the reminder is due soon to either a Reminder or draft
        -   `/reminder ping-remove` - Remove the users to ping when the reminder is due soon to either a Reminder or draft
        -   `/reminder priority` - Change the priority (how often the bot pings the users in `pinging`) of a Reminder or draft
        -   `/reminder due-date` - Change the due date of a Reminder or draft
        -   `/reminder detail-add` - Add a line of details to a Reminder or draft
        -   `/reminder detail-remove` - Remove a line of details from a Reminder or draft
    -   Admin
        -   `/set ping-channel` - Set the channel where Reminder bot will ping users about reminders
        -   `/set reminders-channel` - Set the dedicated channel for Reminder bot to post reminders in
        -   `/refresh reminders-channel` - Refresh the reminders channel

## Usage

Copy the `.env.example` file to `.env` then fill in the file with the correct project credentials.

With `yarn`

```
$ yarn
$ yarn dev
```

With `npm`

```
$ npm i
$ npm run dev
```

## Built with

-   TypeScript
    -   [![@types/deep-equal](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/dev/@types/deep-equal?style=flat-square)](https://npmjs.com/package/@types/deep-equal)
    -   [![@types/dotenv](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/dev/@types/dotenv?style=flat-square)](https://npmjs.com/package/@types/dotenv)
    -   [![@types/luxon](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/dev/@types/luxon?style=flat-square)](https://npmjs.com/package/@types/luxon)
    -   [![@types/node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/dev/@types/node?style=flat-square)](https://npmjs.com/package/@types/node)
    -   [![typescript](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/dev/typescript?style=flat-square)](https://npmjs.com/package/typescript)
-   DiscordJS
    -   [![discord.js](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/discord.js?style=flat-square)](https://npmjs.com/package/discord.js)
-   Miscellaneous
    -   [![after-every](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/after-every?style=flat-square)](https://npmjs.com/package/after-every)
    -   [![colors](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/colors?style=flat-square)](https://npmjs.com/package/colors)
    -   [![deep-equal](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/deep-equal?style=flat-square)](https://npmjs.com/package/deep-equal)
    -   [![dotenv](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/dotenv?style=flat-square)](https://npmjs.com/package/dotenv)
    -   [![firebase-admin](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/firebase-admin?style=flat-square)](https://npmjs.com/package/firebase-admin)
    -   [![luxon](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/luxon?style=flat-square)](https://npmjs.com/package/luxon)
    -   [![no-try](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/no-try?style=flat-square)](https://npmjs.com/package/no-try)
    -   [![nova-bot](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/nova-bot?style=flat-square)](https://npmjs.com/package/nova-bot)
    -   [![tracer](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-reminder/tracer?style=flat-square)](https://npmjs.com/package/tracer)
