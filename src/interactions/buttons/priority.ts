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
				.setCustomId("priority")
				.setTitle("Edit Priority")
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId("priority")
							.setLabel("Priority")
							.setStyle("SHORT")
							.setPlaceholder(
								'How important is the reminder? "low", "medium" or "high"'
							)
							.setRequired(true)
							.setMinLength(3)
							.setMaxLength(6)
							.setValue((reminder || draft)!.getPriorityString().toLowerCase())
					)
				)
		)
	}
}
