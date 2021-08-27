import {
	CommandInteraction,
	InteractionReplyOptions,
	MessagePayload
} from "discord.js"
import GuildCache from "../models/GuildCache"

export default class InteractionHelper {
	public cache: GuildCache
	public interaction: CommandInteraction

	public constructor(cache: GuildCache, interaction: CommandInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(options: string | MessagePayload | InteractionReplyOptions) {
		this.interaction.followUp(options).catch()
	}

	public channel(name: string, required?: boolean) {
		return this.interaction.options.getChannel(name, required)
	}

	public string(name: string, required?: boolean) {
		return this.interaction.options.getString(name, required)
	}

	public integer(name: string, required?: boolean) {
		return this.interaction.options.getInteger(name, required)
	}
}
