import { BaseModal, ModalHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"

export default class extends BaseModal<Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ModalHelper<Entry, GuildCache>) {
		const description = helper.text("description")!

		const footerText = helper.message!.embeds[0]!.footer!.text!

		let oldDescription = ""
		if (footerText === "Draft") {
			oldDescription = helper.cache.draft!.description
			helper.cache.draft!.description = description
			await helper.cache.getDraftDoc().update({ description })
		} else {
			const reminderId = footerText.slice(4)
			oldDescription = helper.cache.reminders.find(rm => rm.id === reminderId)!.description
			await helper.cache.getReminderDoc(reminderId).update({ description })
		}

		await helper.update({
			embeds: [
				ResponseBuilder.good(
					`${footerText === "Draft" ? "Draft" : "Reminder"} description updated`
				).build()
			],
			components: []
		})
		helper.cache.logger.log({
			member: helper.member,
			title: `Description Changed`,
			description: [
				`<@${helper.member.id}> changed the description of a Reminder`,
				`**Reminder ID**: ${footerText === "Draft" ? footerText : footerText.slice(4)}`,
				`**Old Description**:`,
				`${oldDescription}`,
				`**New Description**:`,
				`${description}`
			].join("\n"),
			command: "description",
			color: "YELLOW"
		})

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
