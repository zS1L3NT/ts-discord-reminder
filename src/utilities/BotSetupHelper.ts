import { Client, Collection, Guild } from "discord.js"
import BotCache from "../models/BotCache"
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders"
import InteractionHelper from "./InteractionHelper"
import MessageHelper from "./MessageHelper"
import ButtonHelper from "./ButtonHelper"
import MenuHelper from "./MenuHelper"
import fs from "fs"
import path from "path"
import SlashCommandDeployer from "./SlashCommandDeployer"

export default class BotSetupHelper {
	public cache: BotCache
	public interactionFiles: Collection<string, iInteractionFile | iInteractionFolder>
	public buttonFiles: Collection<string, iButtonFile>
	public menuFiles: Collection<string, iMenuFile>
	private readonly bot: Client
	private readonly messageFiles: iMessageFile[]

	constructor(bot: Client) {
		this.bot = bot
		this.cache = new BotCache(this.bot)
		this.messageFiles = []
		this.interactionFiles = new Collection<string, iInteractionFile | iInteractionFolder>()
		this.buttonFiles = new Collection<string, iButtonFile>()
		this.menuFiles = new Collection<string, iMenuFile>()

		this.setupMessageCommands()
		this.setupInteractionCommands()
		this.setupButtonCommands()
		this.setupMenuCommands()

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

			if (interaction.isButton()) {
				await interaction.deferReply({ ephemeral: true })
				const buttonFile = this.buttonFiles.get(interaction.customId)
				if (!buttonFile) return

				const helper = new ButtonHelper(cache, interaction)
				try {
					await buttonFile.execute(helper)
				} catch (error) {
					console.error(error)
					await interaction.followUp(
						"There was an error while executing this button!"
					)
				}
			}

			if (interaction.isSelectMenu()) {
				await interaction.deferReply({ ephemeral: true })
				const menuFile = this.menuFiles.get(interaction.customId)
				if (!menuFile) return

				const helper = new MenuHelper(cache, interaction)
				try {
					await menuFile.execute(helper)
				} catch (error) {
					console.error(error)
					await interaction.followUp(
						"There was an error while executing this menu item!"
					)
				}
			}
		})

		this.bot.on("guildCreate", async guild => {
			console.log(`Added to Guild(${guild.name})`)
			await this.cache.createGuildCache(guild)
			await this.deploySlashCommands(guild)
		})

		this.bot.on("guildDelete", async guild => {
			console.log(`Removed from Guild(${guild.name})`)
			await this.cache.deleteGuildCache(guild.id)
		})
	}

	private static isFile(file: string): boolean {
		return file.endsWith(".ts") || file.endsWith(".js")
	}

	public async deploySlashCommands(guild: Guild) {
		const deployer = new SlashCommandDeployer(guild.id)
		this.interactionFiles.forEach(command =>
			deployer.addCommand(command.data)
		)
		try {
			await deployer.deploy()
		} catch (err) {
			// @ts-ignore
			console.error(`Failed to deploy slash commands for Guild(${guild.name}): ${err.message}`)
		}
	}

	private setupMessageCommands() {
		let fileNames: string[]

		try {
			fileNames = fs
				.readdirSync(path.join(__dirname, "../messages"))
				.filter(f => BotSetupHelper.isFile(f))
		} catch {
			return
		}

		for (const messageFileName of fileNames) {
			const file = require(`../messages/${messageFileName}`) as iMessageFile
			this.messageFiles.push(file)
		}
	}

	private setupInteractionCommands() {
		let units: string[]

		try {
			units = fs.readdirSync(path.join(__dirname, "../commands"))
		} catch {
			return
		}

		// Slash subcommands
		for (const interactionFolderName of units
			.filter(f => !BotSetupHelper.isFile(f))) {
			const interactionFileNames = fs.readdirSync(
				path.join(__dirname, `../commands/${interactionFolderName}`)
			)
			const command = new SlashCommandBuilder()
				.setName(interactionFolderName)
				.setDescription(`Commands for ${interactionFolderName}`)

			const files: Collection<string, iInteractionSubcommandFile> =
				new Collection()
			for (const commandFile of interactionFileNames.filter(f =>
				BotSetupHelper.isFile(f)
			)) {
				const file =
					require(`../commands/${interactionFolderName}/${commandFile}`) as iInteractionSubcommandFile
				files.set(file.data.name, file)
				command.addSubcommand(file.data)
			}

			this.interactionFiles.set(interactionFolderName, {
				data: command,
				files
			})
		}

		// Slash commands
		for (const interactionFileNames of units
			.filter(f => BotSetupHelper.isFile(f))) {
			const iInteractionFile =
				require(`../commands/${interactionFileNames}`) as iInteractionFile
			this.interactionFiles.set(iInteractionFile.data.name, iInteractionFile)
		}
	}

	private setupButtonCommands() {
		let fileNames: string[]

		try {
			fileNames = fs
				.readdirSync(path.join(__dirname, "../buttons"))
				.filter(f => BotSetupHelper.isFile(f))
		} catch {
			return
		}

		for (const buttonFileName of fileNames) {
			const buttonFile = require(`../buttons/${buttonFileName}`) as iButtonFile
			this.buttonFiles.set(buttonFile.id, buttonFile)
		}
	}

	private setupMenuCommands() {
		let fileNames: string[]

		try {
			fileNames = fs
				.readdirSync(path.join(__dirname, "../menus"))
				.filter(f => BotSetupHelper.isFile(f))
		} catch {
			return
		}

		for (const menuFileName of fileNames) {
			const menuFile = require(`../menus/${menuFileName}`) as iMenuFile
			this.menuFiles.set(menuFile.id, menuFile)
		}
	}
}

export interface iMessageFile {
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

export interface iButtonFile {
	id: string
	execute: (helper: ButtonHelper) => Promise<any>
}

export interface iMenuFile {
	id: string
	execute: (helper: MenuHelper) => Promise<any>
}