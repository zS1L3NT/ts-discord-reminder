import { Client, Collection, Intents } from "discord.js"
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
import MessageHelper from "./utilities/MessageHelper"
import InteractionHelper from "./utilities/InteractionHelper"

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

// region Register message commands
export interface iMessageFile {
	data: string
	condition: (helper: MessageHelper) => boolean
	execute: (helper: MessageHelper) => Promise<void>
}

const messageFiles: iMessageFile[] = []
const readFolder = (location: string) => {
	const units = fs.readdirSync(path.join(__dirname, location))

	for (const commandFolder of units.filter(f => !f.endsWith(".ts"))) {
		readFolder(`${location}/${commandFolder}`)
	}

	for (const commandFile of units.filter(f => f.endsWith(".ts"))) {
		const file = require(`${location}/${commandFile}`) as iMessageFile
		messageFiles.push(file)
	}
}

readFolder("./messages")
// endregion

// region Import slash commands
export interface iInteractionFile {
	data: SlashCommandBuilder
	execute: (helper: InteractionHelper) => Promise<any>
}

export interface iInteractionSubcommandFile {
	data: SlashCommandSubcommandBuilder
	execute: (helper: InteractionHelper) => Promise<any>
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
			// region Check if assignment is due soon
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
			// endregion

			cache.updateMinutely(++debugCount).then()
		})
	})
})

bot.on("messageCreate", async message => {
	if (message.author.bot) return
	if (!message.guild) return
	const cache = await botCache.getGuildCache(message.guild!)

	const helper = new MessageHelper(cache, message)
	try {
		for (const messageFile of messageFiles) {
			if (messageFile.condition(helper)) {
				message.react("⌛").then()
				await messageFile.execute(helper)
				break
			}
		}
	} catch (error) {
		console.error(error)
	}
})

bot.on("interactionCreate", async interaction => {
	if (!interaction.guild) return

	const cache = await botCache.getGuildCache(interaction.guild!)
	if (interaction.isCommand()) {
		await interaction.deferReply({ ephemeral: true })
		const command = commands.get(interaction.commandName)
		if (!command) return

		const helper = new InteractionHelper(cache, interaction)
		try {
			const commandFile = command as iInteractionFile
			if (commandFile.execute) {
				await commandFile.execute(helper)
			}

			const commandFolder = command as iInteractionFolder
			if (commandFolder.files) {
				const subcommand = interaction.options.getSubcommand(true)
				const command = commandFolder.files.get(subcommand)
				if (!command) return

				await command.execute(helper)
			}
		} catch (error) {
			console.error(error)
			await interaction.followUp(
				"There was an error while executing this command!"
			)
		}
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
