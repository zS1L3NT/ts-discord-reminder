import { BaseModal, ModalHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"

export default class extends BaseModal<Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ModalHelper<Entry, GuildCache>) {
		const title = helper.text("title")!

		const footerText = helper.message!.embeds[0]!.footer!.text!

		let oldTitle = ""
		if (footerText === "Draft") {
			oldTitle = helper.cache.draft!.title
			helper.cache.draft!.title = title
			await helper.cache.getDraftDoc().update({ title })
		} else {
			const reminderId = footerText.slice(4)
			oldTitle = helper.cache.reminders.find(rm => rm.id === reminderId)!.title
			await helper.cache.getReminderDoc(reminderId).update({ title })
		}

		await helper.update({
			embeds: [ResponseBuilder.good("Draft title updated").build()],
			components: []
		})
		helper.cache.logger.log({
			member: helper.member,
			title: `Title Updated`,
			description: [
				`<@${helper.member.id}> changed the title of a Reminder`,
				`**Reminder ID**: ${footerText === "Draft" ? footerText : footerText.slice(4)}`,
				`**Old Title**: ${oldTitle}`,
				`**New Title**: ${title}`
			].join("\n"),
			command: "title",
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
