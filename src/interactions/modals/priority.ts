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
		const priority = helper.text("priority")!

		const priorities = ["low", "medium", "high"]
		const message = helper.interaction.message! as Message
		const reminderId = message.embeds[0]!.footer!.text!.slice(4)

		const index = priorities.indexOf(priority.toLowerCase()) as -1 | 0 | 1 | 2
		if (index === -1) {
			helper.update({
				embeds: [
					ResponseBuilder.bad(
						'Invalid priority, must be "low", "medium" or "high"'
					).build()
				],
				components: []
			})
		} else {
			if (reminderId === "Draft") {
				helper.cache.draft!.priority = index
				await helper.cache.getDraftDoc().update({ priority: index })
			} else {
				await helper.cache.getReminderDoc(reminderId).update({ priority: index })
			}

			await helper.update({
				embeds: [ResponseBuilder.good("Draft priority updated").build()],
				components: []
			})
		}

		if (message.type !== "APPLICATION_COMMAND") {
			setTimeout(
				() => message.delete().catch(err => logger.log("Failed to delete message", err)),
				5000
			)
		}
	}
}
