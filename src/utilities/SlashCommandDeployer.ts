import { SlashCommandBuilder } from "@discordjs/builders"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { Collection } from "discord.js"
import { iInteractionFile, iInteractionFolder } from "./BotSetupHelper"

const config = require("../../config.json")

export default class SlashCommandDeployer {
	private readonly guildId: string
	private commands: SlashCommandBuilder[]

	public constructor(guildId: string, interactionFiles: Collection<string, iInteractionFile | iInteractionFolder>) {
		this.commands = interactionFiles.map(file => file.data)
		this.guildId = guildId
	}

	public async deploy() {
		const rest = new REST({ version: "9" }).setToken(config.discord.token)
		await rest.put(
			Routes.applicationGuildCommands(config.discord.bot_id, this.guildId),
			{
				body: this.commands.map(command => command.toJSON())
			}
		)
	}
}
