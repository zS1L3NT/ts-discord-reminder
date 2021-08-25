import { Client, Collection, CommandInteraction, Intents } from "discord.js"
import AfterEvery from "after-every"
import path from "path"
import fs from "fs"
import {
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder
} from "@discordjs/builders"
import SlashCommandDeployer from "./utilities/SlashCommandDeployer"
import BotCache from "./models/BotCache"
import DateFunctions from "./utilities/DateFunctions"
import __notify_here from "./messages/__notify_here"
import __modify_here from "./messages/__modify_here"
import __ping_here from "./messages/__ping_here"
import drafts__create from "./messages/drafts/__create"
import drafts__edit from "./messages/drafts/__edit"
import drafts__delete from "./messages/drafts/__delete"
import drafts__name from "./messages/drafts/__name"
import drafts__discard from "./messages/drafts/__discard"
import drafts__subject from "./messages/drafts/__subject"
import drafts__date from "./messages/drafts/__date"
import drafts__info from "./messages/drafts/__info"
import drafts__done from "./messages/drafts/__done"
import subjects__create from "./messages/subjects/__create"
import subjects__edit from "./messages/subjects/__edit"
import subjects__delete from "./messages/subjects/__delete"
import { MessageParameters } from "./utilities/MessageParameters"

const config = require("../config.json")

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

// region Initialize bot
const bot = new Client({
	intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]
})
const botCache = new BotCache(bot)
// endregion

// region Import slash commands
export interface iInteractionFile {
	data: SlashCommandBuilder
	execute: (interaction: CommandInteraction) => Promise<any>
}

export interface iInteractionSubcommandFile {
	data: SlashCommandSubcommandBuilder
	execute: (interaction: CommandInteraction) => Promise<any>
}

interface iInteractionFolder {
	data: SlashCommandBuilder
	files: Collection<string, iInteractionSubcommandFile>
}

const commands = new Collection<string, iInteractionFile | iInteractionFolder>()
const units = fs.readdirSync(path.join(__dirname, "./commands"))

// Slash subcommands
for (const commandFolder of units.filter(f => !f.endsWith(".ts"))) {
	const commandFiles = fs.readdirSync(
		path.join(__dirname, `./commands/${commandFolder}`)
	)
	const command = new SlashCommandBuilder()
		.setName(commandFolder)
		.setDescription(`Commands for ${commandFolder}`)

	const files: Collection<string, iInteractionSubcommandFile> =
		new Collection()
	for (const commandFile of commandFiles.filter(f => f.endsWith(".ts"))) {
		const file =
			require(`./commands/${commandFolder}/${commandFile}`) as iInteractionSubcommandFile
		files.set(file.data.name, file)
		command.addSubcommand(file.data)
	}

	commands.set(commandFolder, {
		data: command,
		files
	})
}

// Slash commands
for (const commandFile of units.filter(f => f.endsWith(".ts"))) {
	const file = require(`./commands/${commandFile}`) as iInteractionFile
	commands.set(file.data.name, file)
}
// endregion

void bot.login(config.discord.token)
bot.on("ready", () => {
	console.log("Logged in as Assignment Bot#2744")

	bot.guilds.cache.forEach(async guild => {
		const cache = await botCache.getGuildCache(guild)

		// region Deploy slash commands in server
		const deployer = new SlashCommandDeployer(guild.id)
		commands.forEach(command => deployer.addCommand(command.data))
		try {
			await deployer.deploy()
		} catch (err) {
			console.error(
				`Failed to deploy slash commands for Guild(${guild.name}): ${err.message}`
			)
		}
		// endregion

		console.log(`Restored cache for Guild(${guild.name})`)
		let debugCount = 0

		cache.updateMinutely(debugCount).then()
		AfterEvery(1).minutes(() => {
			const assignments = cache.getAssignments()
			for (let i = 0; i < assignments.length; i++) {
				const assignment = assignments[i]
				const timeDiff = assignment.getDate() - new Date().getTime()
				if (
					new DateFunctions(timeDiff).isBetweenRange(
						7 * ONE_DAY,
						30 * ONE_SECOND
					) ||
					new DateFunctions(timeDiff).isBetweenRange(
						ONE_DAY,
						30 * ONE_SECOND
					) ||
					new DateFunctions(timeDiff).isBetweenRange(
						12 * ONE_HOUR,
						30 * ONE_SECOND
					) ||
					new DateFunctions(timeDiff).isBetweenRange(
						2 * ONE_HOUR,
						30 * ONE_SECOND
					) ||
					new DateFunctions(timeDiff).isBetweenRange(
						ONE_HOUR,
						30 * ONE_SECOND
					) ||
					new DateFunctions(timeDiff).isBetweenRange(
						30 * ONE_MINUTE,
						30 * ONE_SECOND
					)
				) {
					cache.updatePingChannel(assignment)
				}
			}

			cache.updateMinutely(++debugCount).then()
		})
	})
})

// Handle the modify channel
bot.on("message", async message => {
	if (message.author.bot) return
	if (!message.guild) return
	const cache = await botCache.getGuildCache(message.guild!)
	const promises: Promise<void>[] = []

	let dips: string[] = []
	let dip = (tag: string) => {
		message.react("⌛").then()
		dips.push(tag)
	}

	const parameters = MessageParameters(cache, message, dip)

	promises.push(__notify_here(parameters))
	promises.push(__modify_here(parameters))
	promises.push(__ping_here(parameters))
	if (cache.getMenuState() === "drafts") {
		promises.push(drafts__create(parameters))
		promises.push(drafts__edit(parameters))
		promises.push(drafts__delete(parameters))
		promises.push(drafts__discard(parameters))
		promises.push(drafts__name(parameters))
		promises.push(drafts__subject(parameters))
		promises.push(drafts__date(parameters))
		promises.push(drafts__info(parameters))
		promises.push(drafts__done(parameters))
	} else {
		promises.push(subjects__create(parameters))
		promises.push(subjects__edit(parameters))
		promises.push(subjects__delete(parameters))
	}

	await Promise.all(promises)

	const { Clear, Respond } = parameters
	if (
		message.channel.id === cache.getModifyChannelId() &&
		dips.length === 0
	) {
		Clear(3000)
		Respond("Invalid command", 4000)
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
			await cache.updateModifyChannel(button.channel)
			break
		case "enable_subjects":
			cache.setMenuState("subjects")
			await cache.updateModifyChannel(button.channel)
			break
		default:
			break
	}
})

bot.on("guildCreate", async guild => {
	console.log(`Added to Guild(${guild.name})`)
	await botCache.createGuildCache(guild)
})

bot.on("guildDelete", async guild => {
	console.log(`Removed from Guild(${guild.name})`)
	await botCache.deleteGuildCache(guild.id)
})

bot.on("interactionCreate", async interaction => {
	if (interaction.isCommand()) {
		const command = commands.get(interaction.commandName)
		if (!command) return

		try {
			const commandFile = command as iInteractionFile
			if (commandFile.execute) {
				await commandFile.execute(interaction)
			}

			const commandFolder = command as iInteractionFolder
			if (commandFolder.files) {
				const subcommand = interaction.options.getSubcommand(true)
				const command = commandFolder.files.get(subcommand)
				if (!command) return

				await command.execute(interaction)
			}
		} catch (error) {
			console.error(error)
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true
			})
		}
	}
})
