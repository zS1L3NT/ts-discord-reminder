import { CommandInteraction, InteractionReplyOptions, MessagePayload } from "discord.js"
import GuildCache from "../models/GuildCache"
import EmbedResponse from "./EmbedResponse"

export default class InteractionHelper {
	public cache: GuildCache
	public interaction: CommandInteraction
	private responded = false

	public constructor(cache: GuildCache, interaction: CommandInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(options: MessagePayload | InteractionReplyOptions | EmbedResponse) {
		if (this.responded) {
			if (options instanceof EmbedResponse) {
				this.interaction
					.editReply({
						embeds: [options.create()]
					})
					.catch(() => {})
			} else {
				this.interaction.editReply(options).catch(() => {})
			}
		} else {
			if (options instanceof EmbedResponse) {
				this.interaction
					.followUp({
						embeds: [options.create()]
					})
					.catch(() => {})
			} else {
				this.interaction.followUp(options).catch(() => {})
			}
			this.responded = true
		}
	}

	public mentionable(name: string) {
		return this.interaction.options.getMentionable(name)
	}

	public channel(name: string) {
		return this.interaction.options.getChannel(name)
	}

	public role(name: string) {
		return this.interaction.options.getRole(name)
	}

	public user(name: string) {
		return this.interaction.options.getUser(name)
	}

	public string(name: string) {
		return this.interaction.options.getString(name)
	}

	public integer(name: string) {
		return this.interaction.options.getInteger(name)
	}

	public boolean(name: string) {
		return this.interaction.options.getBoolean(name)
	}
}
