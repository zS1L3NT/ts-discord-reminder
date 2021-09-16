import { CommandInteraction, InteractionReplyOptions, MessagePayload } from "discord.js"
import GuildCache from "../models/GuildCache"
import EmbedResponse from "./EmbedResponse"

export default class InteractionHelper {
	public cache: GuildCache
	public interaction: CommandInteraction

	public constructor(cache: GuildCache, interaction: CommandInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(options: MessagePayload | InteractionReplyOptions | EmbedResponse) {
		if (options instanceof EmbedResponse) {
			this.interaction.followUp({
				embeds: [options.create()]
			}).catch()
		}
		else {
			this.interaction.followUp(options).catch()
		}
	}

	public mentionable(name: string, required?: boolean) {
		return this.interaction.options.getMentionable(name, required)
	}

	public channel(name: string, required?: boolean) {
		return this.interaction.options.getChannel(name, required)
	}

	public role(name: string, required?: boolean) {
		return this.interaction.options.getRole(name, required)
	}

	public user(name: string, required?: boolean) {
		return this.interaction.options.getUser(name, required)
	}

	public string(name: string, required?: boolean) {
		return this.interaction.options.getString(name, required)
	}

	public integer(name: string, required?: boolean) {
		return this.interaction.options.getInteger(name, required)
	}

	public boolean(name: string, required?: boolean) {
		return this.interaction.options.getBoolean(name, required)
	}
}
