import { Client, Intents } from "discord.js"
import AfterEvery from "after-every"
import BotSetupHelper from "./utilities/BotSetupHelper"
import GuildCache from "./models/GuildCache"
import { Reminder } from "./models/Reminder"
import DateFunctions from "./utilities/DateFunctions"

const config = require("../config.json")

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

// region Initialize bot
const bot = new Client({
	intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]
})
const botSetupHelper = new BotSetupHelper(bot)
const { cache: botCache } = botSetupHelper
// endregion

void bot.login(config.discord.token)
bot.on("ready", async () => {
	console.log("Logged in as Reminder Bot#2744")

	let debugCount = 0

	let i = 0
	let count = bot.guilds.cache.size
	for (const guild of bot.guilds.cache.toJSON()) {
		const tag = `${(++i).toString().padStart(count.toString().length, "0")}/${count}`
		let cache: GuildCache | undefined
		try {
			cache = await botCache.getGuildCache(guild)
		} catch (err) {
			console.error(`${tag} ❌ Couldn't find a Firebase Document for Guild(${guild.name})`)
			guild.leave()
			continue
		}

		try {
			await botSetupHelper.deploySlashCommands(guild)
		} catch (err) {
			console.error(`${tag} ❌ Couldn't get Slash Command permission for Guild(${guild.name})`)
			guild.leave()
			continue
		}

		cache.updateMinutely(debugCount).then()
		AfterEvery(1).minutes(() => {
			// region Check if reminder is due soon
			const reminders = cache!.getReminders()
			for (const reminder of reminders) {
				const timeDiff = reminder.date - Date.now()

				if (reminder.priority === Reminder.PRIORITY_LOW) {
					if (
						new DateFunctions(timeDiff).plusMinus(ONE_DAY) ||
						new DateFunctions(timeDiff).plusMinus(6 * ONE_HOUR)
					) {
						cache!.updatePingChannel(reminder)
					}
				}

				if (reminder.priority === Reminder.PRIORITY_HIGH) {
					if (
						new DateFunctions(timeDiff).plusMinus(7 * ONE_DAY) ||
						new DateFunctions(timeDiff).plusMinus(ONE_DAY) ||
						new DateFunctions(timeDiff).plusMinus(12 * ONE_HOUR) ||
						new DateFunctions(timeDiff).plusMinus(2 * ONE_HOUR) ||
						new DateFunctions(timeDiff).plusMinus(ONE_HOUR) ||
						new DateFunctions(timeDiff).plusMinus(30 * ONE_MINUTE)
					) {
						cache!.updatePingChannel(reminder)
					}
				}
			}
			// endregion
		})

		console.log(`${tag} ✅ Restored cache for Guild(${guild.name})`)
	}
	console.log(`✅ All bot cache restored`)
	console.log("|")

	AfterEvery(1).minutes(async () => {
		debugCount++
		for (const guild of bot.guilds.cache.toJSON()) {
			const cache = await botCache.getGuildCache(guild)
			cache.updateMinutely(debugCount).then()
		}

		console.log("|")
	})
})
