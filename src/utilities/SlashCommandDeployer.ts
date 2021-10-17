import { SlashCommandBuilder } from "@discordjs/builders"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"

const config = require("../../config.json")

export default class SlashCommandDeployer {
	private readonly guildId: string
	private commands: SlashCommandBuilder[]

	public constructor(guildId: string) {
		this.commands = []
		this.guildId = guildId
	}

	public addCommand(command: SlashCommandBuilder) {
		this.commands.push(command)
	}

	public async deploy() {
		const rest = new REST({ version: "9" }).setToken(config.discord.token)
		await rest.put(Routes.applicationGuildCommands(config.discord.bot_id, this.guildId), {
			body: this.commands.map(command => command.toJSON())
		})
	}
}
