import { Client } from "discord.js"
import DiscordButtons from "discord-buttons"
import {
	__modify_here,
	__notify_here,
	drafts__create,
	drafts__date,
	drafts__delete,
	drafts__discard,
	drafts__done,
	drafts__edit,
	drafts__info,
	drafts__name,
	drafts__subject,
	subjects__create,
	subjects__edit,
	subjects__delete,
	BotCache,
	commandParams,
	updateChannels,
	updateModifyChannel
} from "./all"

const config = require("../config.json")

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
	})

	setInterval(() => {
		debugCount++
		bot.guilds.cache.forEach(async guild => {
			const cache = await botCache.getGuildCache(guild.id)
			updateChannels(guild, cache, debugCount).then()
		})
	}, 60 * 1000)
})

// Handle the modify channel
bot.on("message", async message => {
	if (message.author.bot) return
	if (!message.guild) return
	const cache = await botCache.getGuildCache(message.guild!.id)
	const promises: Promise<void>[] = []

	const parameters = commandParams(cache, message)
	let dips: string[] = []
	let dip = (tag: string) => {
		message.react("⌛").then()
		dips.push(tag)
	}

	promises.push(__notify_here(dip, ...parameters))
	promises.push(__modify_here(dip, ...parameters))
	if (cache.getMenuState() === "drafts") {
		promises.push(drafts__create(dip, ...parameters))
		promises.push(drafts__edit(dip, ...parameters))
		promises.push(drafts__delete(dip, ...parameters))
		promises.push(drafts__discard(dip, ...parameters))
		promises.push(drafts__name(dip, ...parameters))
		promises.push(drafts__subject(dip, ...parameters))
		promises.push(drafts__date(dip, ...parameters))
		promises.push(drafts__info(dip, ...parameters))
		promises.push(drafts__done(dip, ...parameters))
	} else {
		promises.push(subjects__create(dip, ...parameters))
		promises.push(subjects__edit(dip, ...parameters))
		promises.push(subjects__delete(dip, ...parameters))
	}

	await Promise.all(promises)

	const [, , , clear, sendMessage] = parameters
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
