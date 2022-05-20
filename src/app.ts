import "dotenv/config"

import AfterEvery from "after-every"
import { Intents } from "discord.js"
import http from "http"
import NovaBot from "nova-bot"
import path from "path"

import BotCache from "./data/BotCache"
import GuildCache from "./data/GuildCache"
import logger from "./logger"

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

process.on("uncaughtException", err => {
	if (err.message !== "The user aborted a request.") {
		logger.error("Uncaught Exception:", { err })
	}
})

new NovaBot({
	name: "Reminder#2744",
	intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
	directory: path.join(__dirname, "interactions"),
	config: {
		firebase: {
			service_account: {
				projectId: process.env.FIREBASE__SERVICE_ACCOUNT__PROJECT_ID,
				privateKey: process.env.FIREBASE__SERVICE_ACCOUNT__PRIVATE_KEY,
				clientEmail: process.env.FIREBASE__SERVICE_ACCOUNT__CLIENT_EMAIL
			},
			collection: process.env.FIREBASE__COLLECTION
		},
		discord: {
			token: process.env.DISCORD__TOKEN,
			bot_id: process.env.DISCORD__BOT_ID,
			dev_id: process.env.DISCORD__DEV_ID
		}
	},
	updatesMinutely: true,
	//@ts-ignore
	logger: global.logger,

	help: {
		message: cache =>
			[
				"Welcome to Reminder!",
				"Reminder is like a Calendar but for Discord servers",
				"Message commands are currently not supported by Reminder",
				"",
				"**Make sure to set the Reminder channel with the **`set reminders-channel`** command to see Reminders in a specific channel**",
				"Use `reminder create` to create a Reminder",
				"Use `reminder post` to send your Reminder draft to the Reminders channel",
				"Reminders are all editable, just make sure to copy the ID",
				"Have fun exploring Reminder!"
			].join("\n"),
		icon: "https://cdn.discordapp.com/avatars/848441372666888232/a856fd9303a063ddfca4d50fe780ec1c.webp?size=128"
	},

	GuildCache,
	BotCache,

	onSetup: async botCache => {
		const approximately = (diff: number, actual: number) => {
			const high = actual + 45_000
			const low = actual - 45_000
			return diff >= low && diff <= high
		}

		botCache.bot.user!.setPresence({
			activities: [
				{
					name: "/help",
					type: "LISTENING"
				}
			]
		})

		for (const guild of botCache.bot.guilds.cache.toJSON()) {
			const cache = await botCache.getGuildCache(guild)

			AfterEvery(1).minutes(() => {
				for (const reminder of cache.reminders) {
					const timeDiff = reminder.due_date - Date.now()

					if (reminder.priority === 0) {
						if (approximately(timeDiff, 0)) {
							cache.updatePingChannel(reminder)
						}
					}

					if (reminder.priority === 1) {
						if (
							approximately(timeDiff, ONE_DAY) ||
							approximately(timeDiff, 2 * ONE_HOUR) ||
							approximately(timeDiff, 0)
						) {
							cache.updatePingChannel(reminder)
						}
					}

					if (reminder.priority === 2) {
						if (
							approximately(timeDiff, 7 * ONE_DAY) ||
							approximately(timeDiff, ONE_DAY) ||
							approximately(timeDiff, 12 * ONE_HOUR) ||
							approximately(timeDiff, 2 * ONE_HOUR) ||
							approximately(timeDiff, ONE_HOUR) ||
							approximately(timeDiff, 30 * ONE_MINUTE) ||
							approximately(timeDiff, 0)
						) {
							cache.updatePingChannel(reminder)
						}
					}
				}
			})
		}
	}
})

const PORT = process.env.PORT || 8080
http.createServer((_, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" })
	res.write("Reminder running!")
	res.end()
}).listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
