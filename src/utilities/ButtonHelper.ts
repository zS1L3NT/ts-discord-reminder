import GuildCache from "../models/GuildCache"
import {ButtonInteraction, InteractionReplyOptions, MessagePayload} from "discord.js"

export default class ButtonHelper {
	public cache: GuildCache
	public interaction: ButtonInteraction

	constructor(cache: GuildCache, interaction: ButtonInteraction) {
		this.cache = cache
		this.interaction = interaction
	}

	public respond(options: string | MessagePayload | InteractionReplyOptions) {
		this.interaction.followUp(options).catch()
	}
}