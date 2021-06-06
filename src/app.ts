import { Client } from "discord.js"
import {
	__create,
	__date,
	__delete,
	__discard,
	__done,
	__edit,
	__info,
	__modify_here,
	__name,
	__notify_here,
	__subject,
	BotCache,
	commandParams,
	updateChannels
} from "./all"

const config = require("../config.json")

const bot = new Client()
const botCache = new BotCache()

bot.login(config.discord).then()
bot.on("ready", () => {
	console.log("Logged in as Assignment Bot#2744")
	let debugCount = 0

	bot.guilds.cache.forEach(async guild => {
		const cache = await botCache.getGuildCache(guild.id)
		console.log(`Restored state for Guild(${guild.name})`)
		await updateChannels(guild, cache, debugCount)
	})
	setInterval(() => {
		debugCount++
		bot.guilds.cache.forEach(async guild => {
			const cache = await botCache.getGuildCache(guild.id)
			await updateChannels(guild, cache, debugCount)
		})
	}, 30 * 1000)
})

// Handle the modify channel
bot.on("message", async message => {
	const cache = await botCache.getGuildCache(message.guild!.id)
	if (message.author.bot) return

	const parameters = commandParams(cache, message)
	let dips: string[] = []
	let dip = dips.push.bind(dips)

	await __notify_here(dip, ...parameters)
	await __modify_here(dip, ...parameters)
	await __create(dip, ...parameters)
	await __edit(dip, ...parameters)
	await __delete(dip, ...parameters)
	await __discard(dip, ...parameters)
	await __name(dip, ...parameters)
	await __subject(dip, ...parameters)
	await __date(dip, ...parameters)
	await __info(dip, ...parameters)
	await __done(dip, ...parameters)

	const [, , , clear, sendMessage] = parameters

	if (
		message.channel.id === cache.getModifyChannelId() &&
		dips.length === 0
	) {
		clear(3000)
		await sendMessage("Invalid command", 4000)
	}

	if (dips.length > 1) {
		console.error("Dipped more than once!!!")
		console.log(dips)
		process.exit()
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
