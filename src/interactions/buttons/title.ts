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
				.setCustomId("title")
				.setTitle("Edit Title")
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId("title")
							.setLabel("Title")
							.setStyle("SHORT")
							.setPlaceholder("Name the Reminder")
							.setRequired(true)
							.setMinLength(5)
							.setMaxLength(100)
							.setValue((reminder || draft)!.title)
					)
				)
		)
	}
}
