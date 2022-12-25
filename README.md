# Reminder Bot

![License](https://img.shields.io/github/license/zS1L3NT/ts-discord-reminder?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-discord-reminder?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-discord-reminder?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-discord-reminder?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-discord-reminder?style=for-the-badge)

Reminder Bot is a Discord bot that can store reminders you want to keep, in the server that you add it too. Reminder bot needs a dedicated text channel to place all reminders into. For every reminder, Reminder bot will update the `Due in` on the embed to let you know how soon the reminder is due in. Reminder Bot was the first bot among all my Discord Bots to make use of a Bot Cache and Guild Cache system, which lead to the creation of [Nova Bot](https://github.com/zS1L3NT/ts-npm-nova-bot)

This is an example of a reminder that Reminder bot stores<br>
![Example](https://i.ibb.co/rtB0DMx/reminer.png)

## Motivation

I build this bot because I wanted my whole class to be able to see all upcoming assignments due from Discord.
Furthermore, only one person needs to add and edit reminders so everyone can see the most up-to-date assignment specifications.

## Features

-   Discord Commands (Interactivity)
    -   Reminders
        -   `/create` - Create a draft
        -   `/show` - Show the current Reminder draft
        -   `/delete` - Delete a Reminder or draft
        -   `/discard` - Discard the Reminder draft
        -   `/post` - Convert a Reminder draft to a Reminder that appears in the reminders channel
        -   `/title` - Change a title of a Reminder or draft
        -   `/ping-add` - Add the users to ping when the reminder is due soon to either a Reminder or draft
        -   `/ping-remove` - Remove the users to ping when the reminder is due soon to either a Reminder or draft
        -   `/priority` - Change the priority (how often the bot pings the users in `pinging`) of a Reminder or draft
        -   `/due-date` - Change the due date of a Reminder or draft
        -   `/detail-add` - Add a line of details to a Reminder or draft
        -   `/detail-remove` - Remove a line of details from a Reminder or draft
    -   Admin
        -   `/set ping-channel` - Set the channel where Reminder bot will ping users about reminders
        -   `/set reminders-channel` - Set the dedicated channel for Reminder bot to post reminders in
        -   `/refresh reminders-channel` - Refresh the reminders channel
-   Reminders and Drafts
    -   Add reminders by creating a Reminder draft first, which is a Reminder but with in need of modification.
    -   Edit the draft with commands until you're satisfied and use `/post` to convert the draft to a full Reminder
-   Reminders Channel
    -   Reminder bot needs a dedicated text channel to post reminders in. Reminder bot will automatically remove any messages that are irrelevant.
-   Ping Channel
    -   Reminder bot will ping users in the ping channel, which can be set with `/set ping-channel`. Depending on the priority of the reminder, Reminer bot will ping users at different times. These are the times reminder bot will ping about a reminder:
        -   High Priority
            -   7 days before the reminer is due
            -   1 day before the reminer is due
            -   12 hours before the reminer is due
            -   2 hours before the reminer is due
            -   1 hour before the reminer is due
            -   30 minutes before the reminer is due
            -   The moment the reminer is due
        -   Medium Priority
            -   1 day before the reminer is due
            -   2 hours before the reminer is due
            -   The moment the reminer is due
        -   Low Priority
            -   The moment the reminer is due
-   Message Commands
    -   Other than Using slash commands, all commands above can also be triggered by messages, where `/` is replaced by the defined prefix in the server.
    -   This defined prefix can only be changed with the `/set-prefix` command
    -   e.g. If the prefix is defined as `.`, `.post` will do the same thing as `/post`
    -   Aliases can be set for all message commands to make using message commands easier. `.post` can have the alias `.p`

## Usage

Copy the `.env.example` file to `.env` then fill in the file with the correct project credentials.

```
$ npm i
$ npm run dev
```

## Built with

-   NodeJS
    -   TypeScript
        -   [![@types/deep-equal](https://img.shields.io/badge/%40types%2Fdeep--equal-%5E1.0.1-red?style=flat-square)](https://npmjs.com/package/@types/deep-equal/v/1.0.1)
        -   [![@types/luxon](https://img.shields.io/badge/%40types%2Fluxon-%5E3.0.1-red?style=flat-square)](https://npmjs.com/package/@types/luxon/v/3.0.1)
        -   [![@types/node](https://img.shields.io/badge/%40types%2Fnode-latest-red?style=flat-square)](https://npmjs.com/package/@types/node/v/latest)
        -   [![ts-node](https://img.shields.io/badge/ts--node-latest-red?style=flat-square)](https://npmjs.com/package/ts-node/v/latest)
        -   [![typescript](https://img.shields.io/badge/typescript-latest-red?style=flat-square)](https://npmjs.com/package/typescript/v/latest)
    -   DiscordJS
        -   [![discord.js](https://img.shields.io/badge/discord.js-%5E14.3.0-red?style=flat-square)](https://npmjs.com/package/discord.js/v/14.3.0)
    -   Prisma
        -   [![@prisma/client](https://img.shields.io/badge/%40prisma%2Fclient-%5E4.3.1-red?style=flat-square)](https://npmjs.com/package/@prisma/client/v/4.3.1)
        -   [![prisma](https://img.shields.io/badge/prisma-%5E4.3.1-red?style=flat-square)](https://npmjs.com/package/prisma/v/4.3.1)
    -   Miscellaneous
        -   [![after-every](https://img.shields.io/badge/after--every-%5E1.0.4-red?style=flat-square)](https://npmjs.com/package/after-every/v/1.0.4)
        -   [![colors](https://img.shields.io/badge/colors-%5E1.4.0-red?style=flat-square)](https://npmjs.com/package/colors/v/1.4.0)
        -   [![deep-equal](https://img.shields.io/badge/deep--equal-%5E2.0.5-red?style=flat-square)](https://npmjs.com/package/deep-equal/v/2.0.5)
        -   [![dotenv](https://img.shields.io/badge/dotenv-%5E16.0.2-red?style=flat-square)](https://npmjs.com/package/dotenv/v/16.0.2)
        -   [![luxon](https://img.shields.io/badge/luxon-%5E3.0.3-red?style=flat-square)](https://npmjs.com/package/luxon/v/3.0.3)
        -   [![no-try](https://img.shields.io/badge/no--try-%5E3.1.0-red?style=flat-square)](https://npmjs.com/package/no-try/v/3.1.0)
        -   [![nova-bot](https://img.shields.io/badge/nova--bot-%5E3.0.0-red?style=flat-square)](https://npmjs.com/package/nova-bot/v/3.0.0)
        -   [![tracer](https://img.shields.io/badge/tracer-%5E1.1.6-red?style=flat-square)](https://npmjs.com/package/tracer/v/1.1.6)
