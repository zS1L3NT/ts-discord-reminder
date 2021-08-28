import { Client, Collection, Guild } from "discord.js"
import BotCache from "../models/BotCache"
import {
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder
} from "@discordjs/builders"
import InteractionHelper from "./InteractionHelper"
import MessageHelper from "./MessageHelper"
import fs from "fs"
import path from "path"
import SlashCommandDeployer from "./SlashCommandDeployer"

export default class BotSetupHelper {
	private readonly bot: Client
	public cache: BotCache

	private readonly messageFiles: iMessageFile[]
	public interactionFiles: Collection<
		string,
		iInteractionFile | iInteractionFolder
	>

	constructor(bot: Client) {
		this.bot = bot
		this.cache = new BotCache(this.bot)
		this.messageFiles = []
		this.interactionFiles = new Collection<
			string,
			iInteractionFile | iInteractionFolder
		>()

		this.setupMessageCommands()
		this.setupInteractionCommands()

		this.bot.on("messageCreate", async message => {
			if (message.author.bot) return
			if (!message.guild) return
			const cache = await this.cache.getGuildCache(message.guild!)

			const helper = new MessageHelper(cache, message)
			try {
				for (const messageFile of this.messageFiles) {
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

		this.bot.on("interactionCreate", async interaction => {
			if (!interaction.guild) return

			const cache = await this.cache.getGuildCache(interaction.guild!)
			if (interaction.isCommand()) {
				await interaction.deferReply({ ephemeral: true })
				const interactionFile = this.interactionFiles.get(
					interaction.commandName
				)
				if (!interactionFile) return

				const helper = new InteractionHelper(cache, interaction)
				try {
					const file = interactionFile as iInteractionFile
					if (file.execute) {
						await file.execute(helper)
					}

					const folder = interactionFile as iInteractionFolder
					if (folder.files) {
						const subcommand =
							interaction.options.getSubcommand(true)
						const file = folder.files.get(subcommand)
						if (!file) return

						await file.execute(helper)
					}
				} catch (error) {
					console.error(error)
					await interaction.followUp(
						"There was an error while executing this command!"
					)
				}
			}
		})

		this.bot.on("guildCreate", async guild => {
			console.log(`Added to Guild(${guild.name})`)
			await this.cache.createGuildCache(guild)
		})

		this.bot.on("guildDelete", async guild => {
			console.log(`Removed from Guild(${guild.name})`)
			await this.cache.deleteGuildCache(guild.id)
		})
	}

	public async deploySlashCommands(guild: Guild) {
		const deployer = new SlashCommandDeployer(guild.id)
		this.interactionFiles.forEach(command =>
			deployer.addCommand(command.data)
		)
		try {
			await deployer.deploy()
		} catch (err) {
			console.error(
				`Failed to deploy slash commands for Guild(${guild.name}): ${err.message}`
			)
		}
	}

	private static isFile(file: string): boolean {
		return file.endsWith(".ts") || file.endsWith(".js")
	}

	private setupMessageFolder(location: string) {
		const units = fs.readdirSync(path.join(__dirname, location))

		for (const commandFolder of units.filter(
			f => !BotSetupHelper.isFile(f)
		)) {
			this.setupMessageFolder(`${location}/${commandFolder}`)
		}

		for (const commandFile of units.filter(f => BotSetupHelper.isFile(f))) {
			const file = require(`${location}/${commandFile}`) as iMessageFile
			this.messageFiles.push(file)
		}
	}

	private setupMessageCommands() {
		this.setupMessageFolder("../messages")
	}

	private setupInteractionCommands() {
		const files = fs.readdirSync(path.join(__dirname, "../commands"))

		// Slash subcommands
		for (const interactionFolder of files.filter(
			f => !BotSetupHelper.isFile(f)
		)) {
			const interactionFiles = fs.readdirSync(
				path.join(__dirname, `../commands/${interactionFolder}`)
			)
			const command = new SlashCommandBuilder()
				.setName(interactionFolder)
				.setDescription(`Commands for ${interactionFolder}`)

			const files: Collection<string, iInteractionSubcommandFile> =
				new Collection()
			for (const commandFile of interactionFiles.filter(f =>
				BotSetupHelper.isFile(f)
			)) {
				const file =
					require(`../commands/${interactionFolder}/${commandFile}`) as iInteractionSubcommandFile
				files.set(file.data.name, file)
				command.addSubcommand(file.data)
			}

			this.interactionFiles.set(interactionFolder, {
				data: command,
				files
			})
		}

		// Slash commands
		for (const commandFile of files.filter(f => BotSetupHelper.isFile(f))) {
			const file =
				require(`../commands/${commandFile}`) as iInteractionFile
			this.interactionFiles.set(file.data.name, file)
		}
	}
}

export interface iMessageFile {
	data: string
	condition: (helper: MessageHelper) => boolean
	execute: (helper: MessageHelper) => Promise<void>
}

export interface iInteractionFile {
	data: SlashCommandBuilder
	execute: (helper: InteractionHelper) => Promise<any>
}

export interface iInteractionSubcommandFile {
	data: SlashCommandSubcommandBuilder
	execute: (helper: InteractionHelper) => Promise<any>
}

export interface iInteractionFolder {
	data: SlashCommandBuilder
	files: Collection<string, iInteractionSubcommandFile>
}
