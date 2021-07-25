import { Client } from "discord.js"
import DiscordButtons from "discord-buttons"
import {
	__modify_here,
	__notify_here,
	__ping_here,
	allParameters,
	BotCache,
	drafts__create,
	drafts__date,
	drafts__delete,
	drafts__discard,
	drafts__done,
	drafts__edit,
	drafts__info,
	drafts__name,
	drafts__subject,
	parameters,
	subjects__create,
	subjects__delete,
	subjects__edit,
	updateChannels,
	updateModifyChannel,
	updatePingChannel,
	betweenRange
} from "./all"
import AfterEvery from "after-every"

const config = require("../config.json")

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

const bot = new Client()
const botCache = new BotCache()
DiscordButtons(bot)

bot.login(config.discord).then()
bot.on("ready", () => {
	console.log("Logged in as Assignment Bot#2744")
	let debugCount = 0

	bot.guilds.cache.forEach(async guild => {
		const cache = await botCache.getGuildCache(guild.id)
		console.log(`Restored cache for Guild(${guild.name})`)
		updateChannels(guild, cache, debugCount).then()

		AfterEvery(1).minutes(() => {
			const assignments = cache.getAssignments()
			for (let i = 0; i < assignments.length; i++) {
				const assignment = assignments[i]
				const timeDiff = assignment.getDate() - new Date().getTime()
				if (
					betweenRange(timeDiff, ONE_DAY, 30 * ONE_SECOND) ||       // 24h +- 30s
					betweenRange(timeDiff, 12 * ONE_HOUR, 30 * ONE_SECOND) || // 12h +- 30s
					betweenRange(timeDiff, 2 * ONE_HOUR, 30 * ONE_SECOND) ||  // 2h +- 30s
					betweenRange(timeDiff, ONE_HOUR, 30 * ONE_SECOND) ||      // 1h +- 30s
					betweenRange(timeDiff, 30 * ONE_MINUTE, 30 * ONE_SECOND)  // 30m +- 30s
				) {
					updatePingChannel(cache, guild, assignment)
				}
			}
		})
	})

	AfterEvery(1).minutes(() => {
		debugCount++
		bot.guilds.cache.forEach(async guild => {
			const cache = await botCache.getGuildCache(guild.id)
			updateChannels(guild, cache, debugCount).then()
		})
	})
})

// Handle the modify channel
bot.on("message", async message => {
	if (message.author.bot) return
	if (!message.guild) return
	const cache = await botCache.getGuildCache(message.guild!.id)
	const promises: Promise<void>[] = []

	let dips: string[] = []
	let dip = (tag: string) => {
		message.react("⌛").then()
		dips.push(tag)
	}

	const allParameters: allParameters = { dip, ...parameters(cache, message) }

	promises.push(__notify_here(allParameters))
	promises.push(__modify_here(allParameters))
	promises.push(__ping_here(allParameters))
	if (cache.getMenuState() === "drafts") {
		promises.push(drafts__create(allParameters))
		promises.push(drafts__edit(allParameters))
		promises.push(drafts__delete(allParameters))
		promises.push(drafts__discard(allParameters))
		promises.push(drafts__name(allParameters))
		promises.push(drafts__subject(allParameters))
		promises.push(drafts__date(allParameters))
		promises.push(drafts__info(allParameters))
		promises.push(drafts__done(allParameters))
	} else {
		promises.push(subjects__create(allParameters))
		promises.push(subjects__edit(allParameters))
		promises.push(subjects__delete(allParameters))
	}

	await Promise.all(promises)

	const { clear, sendMessage } = allParameters
	if (
		message.channel.id === cache.getModifyChannelId() &&
		dips.length === 0
	) {
		clear(3000)
		sendMessage("Invalid command", 4000).then()
	}

	if (dips.length > 1) {
		console.error("Dipped more than once!!!")
		console.log(JSON.stringify(message, null, 2))
		console.log(dips)
		process.exit()
	}
})

bot.on("clickButton", async button => {
	await button.defer()
	const cache = await botCache.getGuildCache(button.guild.id)
	switch (button.id) {
		case "enable_drafts":
			cache.setMenuState("drafts")
			await updateModifyChannel(cache, button.channel)
			break
		case "enable_subjects":
			cache.setMenuState("subjects")
			await updateModifyChannel(cache, button.channel)
			break
		default:
			break
	}
})

bot.on("guildCreate", async guild => {
	console.log(`Added to Guild(${guild.name})`)
	await botCache.createGuildCache(guild.id)
})

bot.on("guildDelete", async guild => {
	console.log(`Removed from Guild(${guild.name})`)
	await botCache.deleteGuildCache(guild.id)
})
