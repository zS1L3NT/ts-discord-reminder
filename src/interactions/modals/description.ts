import { GuildMember, Message } from "discord.js"
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

		const message = helper.interaction.message as Message
		const member = helper.interaction.member as GuildMember
		const reminderId = message.embeds[0]!.footer!.text!

		let oldDescription = ""
		if (reminderId === "Draft") {
			oldDescription = helper.cache.draft!.description
			helper.cache.draft!.description = description
			await helper.cache.getDraftDoc().update({ description })
		} else {
			oldDescription = helper.cache.reminders.find(rm => rm.id === reminderId)!.description
			await helper.cache.getReminderDoc(reminderId.slice(4)).update({ description })
		}

		await helper.update({
			embeds: [ResponseBuilder.good("Draft description updated").build()],
			components: []
		})
		helper.cache.logger.log({
			member,
			title: `Description Changed`,
			description: [
				`<@${member.id}> changed the description of a Reminder`,
				`**Reminder ID**: ${reminderId === "Draft" ? reminderId : reminderId.slice(4)}`,
				`**Old Description**:`,
				`${oldDescription}`,
				`**New Description**:`,
				`${description}`
			].join("\n"),
			command: "description",
			color: "YELLOW"
		})

		if (message.type !== "APPLICATION_COMMAND") {
			setTimeout(
				() => message.delete().catch(err => logger.log("Failed to delete message", err)),
				5000
			)
		}
	}
}
