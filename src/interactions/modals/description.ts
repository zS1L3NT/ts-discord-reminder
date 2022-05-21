import { Message } from "discord.js"
import { BaseModal, ModalHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"

export default class extends BaseModal<Entry, GuildCache> {
	override defer = false
	override ephemeral = true

	override middleware = []

	override async execute(helper: ModalHelper<Entry, GuildCache>) {
		const description = helper.text("description")!

		const message = helper.interaction.message! as Message
		const reminderId = message.embeds[0]!.footer!.text!

		if (reminderId === "Draft") {
			helper.cache.draft!.description = description
			await helper.cache.getDraftDoc().update({ description })
		} else {
			await helper.cache.getReminderDoc(reminderId.slice(4)).update({ description })
		}

		await helper.update({
			embeds: [ResponseBuilder.good("Draft description updated").build()],
			components: []
		})

		if (message.type !== "APPLICATION_COMMAND") {
			setTimeout(
				() => message.delete().catch(err => logger.log("Failed to delete message", err)),
				5000
			)
		}
	}
}
