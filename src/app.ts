import "dotenv/config"

import AfterEvery from "after-every"
import { ActivityType, GatewayIntentBits } from "discord.js"
import http from "http"
import NovaBot from "nova-bot"
import path from "path"

import { Entry, Priority } from "@prisma/client"

import BotCache from "./data/BotCache"
import GuildCache from "./data/GuildCache"
import logger from "./logger"
import prisma from "./prisma"

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

process.on("uncaughtException", err => {
	if (err.message !== "The user aborted a request.") {
		logger.error("Uncaught Exception:", { err })
	}
})

class ReminderBot extends NovaBot<typeof prisma, Entry, GuildCache, BotCache> {
	override name = "Reminder#2744"
	override icon =
		"https://cdn.discordapp.com/avatars/848441372666888232/a856fd9303a063ddfca4d50fe780ec1c.webp?size=128"
	override directory = path.join(__dirname, "interactions")
	override intents = [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds]

	override helpMessage = (cache: GuildCache) =>
		[
			"Welcome to Reminder!",
			"Reminder is like a Calendar but for Discord servers",
			"Message commands are currently not supported by Reminder",
			"",
			"**Make sure to set the Reminder channel with the **`set reminders-channel`** command to see Reminders in a specific channel**",
			"Use `reminder create` to create a Reminder",
			"Use `reminder post` to send your Reminder draft to the Reminders channel",
			"Reminders are all editable, just make sure to copy the ID",
			"Have fun exploring Reminder!",
			cache.prefix
				? `My prefix for message commands is \`${cache.prefix}\``
				: `No message command prefix for this server`
		].join("\n")

	override GuildCache = GuildCache
	override BotCache = BotCache

	//@ts-ignore
	override logger = logger

	override prisma = prisma

	override async onSetup(botCache: BotCache) {
		const approximately = (diff: number, actual: number) => {
			const high = actual + 45_000
			const low = actual - 45_000
			return diff >= low && diff <= high
		}

		botCache.bot.user!.setPresence({
			activities: [
				{
					name: "/help",
					type: ActivityType.Listening
				}
			]
		})

		for (const guild of botCache.bot.guilds.cache.toJSON()) {
			const cache = await botCache.getGuildCache(guild)

			AfterEvery(1).minutes(() => {
				for (const reminder of cache.reminders) {
					const timeDiff = reminder.due_date.getTime() - Date.now()

					if (reminder.priority === Priority.Low) {
						if (approximately(timeDiff, 0)) {
							cache.updatePingChannel(reminder)
						}
					}

					if (reminder.priority === Priority.Medium) {
						if (
							approximately(timeDiff, ONE_DAY) ||
							approximately(timeDiff, 2 * ONE_HOUR) ||
							approximately(timeDiff, 0)
						) {
							cache.updatePingChannel(reminder)
						}
					}

					if (reminder.priority === Priority.High) {
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
}

new ReminderBot().start()

const PORT = process.env.PORT || 80
http.createServer((_, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" })
	res.write("Reminder running!")
	res.end()
}).listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
