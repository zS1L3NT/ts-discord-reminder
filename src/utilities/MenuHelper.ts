import { InteractionReplyOptions, MessagePayload, SelectMenuInteraction } from "discord.js"
import GuildCache from "../models/GuildCache"

export default class MenuHelper {
	public cache: GuildCache
	public interaction: SelectMenuInteraction

	constructor(cache: GuildCache, interaction: SelectMenuInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(options: string | MessagePayload | InteractionReplyOptions) {
		this.interaction.followUp(options).catch()
	}

	public value(): string | undefined {
		return this.interaction.values[0]
	}
}