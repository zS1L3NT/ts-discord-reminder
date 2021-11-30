import AfterEvery from "after-every"
import BotCache from "./models/BotCache"
import Document from "./models/Document"
import GuildCache from "./models/GuildCache"
import NovaBot from "discordjs-nova"
import Reminder from "./models/Reminder"
import { Intents } from "discord.js"

const config = require("../config.json")

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

new NovaBot({
	intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
	name: "Reminder#2744",
	cwd: __dirname,
	config,
	updatesMinutely: true,

	Document: Document,
	GuildCache: GuildCache,
	BotCache: BotCache,

	onSetup: async botCache => {
		const approximately = (diff: number, actual: number) => {
			const high = actual + 30000
			const low = actual - 30000
			return diff >= low && diff <= high
		}

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
