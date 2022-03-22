import AfterEvery from "after-every"
import BotCache from "./data/BotCache"
import colors from "colors"
import dotenv from "dotenv"
import GuildCache from "./data/GuildCache"
import NovaBot from "nova-bot"
import path from "path"
import Reminder from "./data/Reminder"
import Tracer from "tracer"
import { Intents } from "discord.js"

dotenv.config()

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

global.logger = Tracer.colorConsole({
	level: process.env.LOG_LEVEL || "log",
	format: [
		"[{{timestamp}}] <{{path}}> {{message}}",
		{
			//@ts-ignore
			alert: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			warn: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			error: "[{{timestamp}}] <{{path}}, Line {{line}} at {{pos}}> {{message}}"
		}
	],
	methods: ["log", "discord", "debug", "info", "alert", "warn", "error"],
	dateformat: "dd mmm yyyy, hh:MM:sstt",
	filters: {
		log: colors.grey,
		//@ts-ignore
		discord: colors.cyan,
		debug: colors.blue,
		info: colors.green,
		//@ts-ignore
		alert: colors.yellow,
		warn: colors.yellow.bold.italic,
		error: colors.red.bold.italic
	},
	preprocess: data => {
		data.path = data.path
			.split("nova-bot")
			.at(-1)!
			.replace(/^(\/|\\)dist/, "nova-bot")
			.replaceAll("\\", "/")
		data.path = data.path
			.split("ts-discord-reminder")
			.at(-1)!
			.replace(/^(\/|\\)(dist|src)/, "src")
			.replaceAll("\\", "/")
	}
})

process.on("uncaughtException", err => {
	if (err.message !== "The user aborted a request.") {
		logger.error("Uncaught Exception:", { err })
	}
})

new NovaBot({
	name: "Reminder#2744",
	intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
	directory: path.join(__dirname, "interactivity"),
	config: {
		firebase: {
			service_account: {
				projectId: process.env.FIREBASE__SERVICE_ACCOUNT__PROJECT_ID,
				privateKey: process.env.FIREBASE__SERVICE_ACCOUNT__PRIVATE_KEY,
				clientEmail: process.env.FIREBASE__SERVICE_ACCOUNT__CLIENT_EMAIL
			},
			collection: process.env.FIREBASE__COLLECTION,
			database_url: process.env.FIREBASE__DATABASE_URL,
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
					const timeDiff = reminder.value.due_date - Date.now()

					if (reminder.value.priority === Reminder.PRIORITY_LOW) {
						if (approximately(timeDiff, 0)) {
							cache.updatePingChannel(reminder)
						}
					}

					if (reminder.value.priority === Reminder.PRIORITY_MEDIUM) {
						if (
							approximately(timeDiff, ONE_DAY) ||
							approximately(timeDiff, 2 * ONE_HOUR) ||
							approximately(timeDiff, 0)
						) {
							cache.updatePingChannel(reminder)
						}
					}

					if (reminder.value.priority === Reminder.PRIORITY_HIGH) {
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
