import {
	ButtonInteraction,
	InteractionReplyOptions,
	MessagePayload
} from "discord.js"
import GuildCache from "../models/GuildCache"
import EmbedResponse from "./EmbedResponse"

export default class ButtonHelper {
	public cache: GuildCache
	public interaction: ButtonInteraction

	constructor(cache: GuildCache, interaction: ButtonInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(
		options: MessagePayload | InteractionReplyOptions | EmbedResponse
	) {
		if (options instanceof EmbedResponse) {
			this.interaction
				.followUp({
					embeds: [options.create()]
				})
				.catch(() => {})
		} else {
			this.interaction.followUp(options).catch(() => {})
		}
	}
}
