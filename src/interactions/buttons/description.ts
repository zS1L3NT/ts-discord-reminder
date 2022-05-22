import { MessageActionRow, Modal, TextInputComponent } from "discord.js"
import { BaseButton, ButtonHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

export default class extends BaseButton<Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ButtonHelper<Entry, GuildCache>) {
		const reminderId = helper.message.embeds[0]!.footer!.text!.slice(4)
		const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
		const draft = helper.cache.draft

		await helper.interaction.showModal(
			new Modal()
				.setCustomId("description")
				.setTitle("Edit Description")
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId("description")
							.setLabel("Description")
							.setStyle("PARAGRAPH")
							.setPlaceholder("Describe the Reminder")
							.setMaxLength(400)
							.setValue((reminder || draft)!.description)
					)
				)
		)
	}
}
