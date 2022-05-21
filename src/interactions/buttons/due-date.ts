import { Message, MessageActionRow, Modal, TextInputComponent } from "discord.js"
import { DateTime } from "luxon"
import { BaseButton, ButtonHelper, DateHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

export default class extends BaseButton<Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ButtonHelper<Entry, GuildCache>) {
		const message = helper.interaction.message as Message
		const reminderId = message.embeds[0]!.footer!.text!.slice(4)
		const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
		const draft = helper.cache.draft

		const date = DateTime.fromMillis((reminder || draft)!.due_date).setZone("Asia/Singapore")

		await helper.interaction.showModal(
			new Modal()
				.setCustomId("due-date")
				.setTitle("Edit Due Date")
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId("day")
							.setLabel("Day")
							.setStyle("SHORT")
							.setPlaceholder("Day of the month (1 ~ 31)")
							.setRequired(true)
							.setMinLength(1)
							.setMaxLength(2)
							.setValue(`${date.day}`)
					)
				)
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId("month")
							.setLabel("Month")
							.setStyle("SHORT")
							.setPlaceholder("Month of the year")
							.setRequired(true)
							.setMinLength(3)
							.setMaxLength(9)
							.setValue(DateHelper.nameOfMonths[date.month - 1]!)
					)
				)
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId("year")
							.setLabel("Year")
							.setStyle("SHORT")
							.setPlaceholder("Year")
							.setRequired(true)
							.setMinLength(4)
							.setMaxLength(4)
							.setValue(`${date.year}`)
					)
				)
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId("hour")
							.setLabel("Hour")
							.setStyle("SHORT")
							.setPlaceholder("Hour of the day (0 ~ 23)")
							.setRequired(true)
							.setMinLength(1)
							.setMaxLength(2)
							.setValue(`${date.hour}`)
					)
				)
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId("minute")
							.setLabel("Minute")
							.setStyle("SHORT")
							.setPlaceholder("Minute of the hour (0 ~ 59)")
							.setRequired(true)
							.setMinLength(1)
							.setMaxLength(2)
							.setValue(`${date.minute}`)
					)
				)
		)
	}
}
