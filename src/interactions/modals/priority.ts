import { BaseModal, ModalHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"

export default class extends BaseModal<Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ModalHelper<Entry, GuildCache>) {
		const priority = helper.text("priority")!

		const priorities = ["low", "medium", "high"]
		const reminderId = helper.message!.embeds[0]!.footer!.text!

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
			let oldIndex = -1
			if (reminderId === "Draft") {
				oldIndex = helper.cache.draft!.priority
				helper.cache.draft!.priority = index
				await helper.cache.getDraftDoc().update({ priority: index })
			} else {
				oldIndex = helper.cache.reminders.find(rm => rm.id === reminderId)!.priority
				await helper.cache.getReminderDoc(reminderId.slice(4)).update({ priority: index })
			}

			await helper.update({
				embeds: [ResponseBuilder.good("Draft priority updated").build()],
				components: []
			})
			helper.cache.logger.log({
				member: helper.member,
				title: `Priority Updated`,
				description: [
					`<@${helper.member.id}> changed the priority of a Reminder`,
					`**Reminder ID**: ${reminderId === "Draft" ? reminderId : reminderId.slice(4)}`,
					`**Old Priority**: ${priorities[oldIndex]}`,
					`**New Priority**: ${priorities[index]}`
				].join("\n"),
				command: "priority",
				color: "YELLOW"
			})
		}

		if (helper.message!.type !== "APPLICATION_COMMAND") {
			setTimeout(
				() =>
					helper
						.message!.delete()
						.catch(err => logger.log("Failed to delete message", err)),
				5000
			)
		}
	}
}
