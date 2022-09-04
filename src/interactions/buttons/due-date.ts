import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { DateTime } from "luxon"
import { BaseButton, ButtonHelper, DateHelper } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import prisma from "../../prisma"

export default class extends BaseButton<typeof prisma, Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ButtonHelper<typeof prisma, Entry, GuildCache>) {
		const reminderId = helper.message.embeds[0]!.footer!.text!.slice(4)
		const reminder = helper.cache.reminders.find(r => r.id === reminderId)
		const draft = helper.cache.draft

		const date = DateTime.fromMillis((reminder || draft)!.due_date.getTime()).setZone(
			"Asia/Singapore"
		)

		await helper.interaction.showModal(
			new ModalBuilder()
				.setCustomId("due-date")
				.setTitle("Edit Due Date")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("day")
							.setLabel("Day")
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Day of the month (1 ~ 31)")
							.setRequired(true)
							.setMinLength(1)
							.setMaxLength(2)
							.setValue(`${date.day}`)
					)
				)
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("month")
							.setLabel("Month")
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Month of the year")
							.setRequired(true)
							.setMinLength(3)
							.setMaxLength(9)
							.setValue(DateHelper.nameOfMonths[date.month - 1]!)
					)
				)
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("year")
							.setLabel("Year")
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Year")
							.setRequired(true)
							.setMinLength(4)
							.setMaxLength(4)
							.setValue(`${date.year}`)
					)
				)
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("hour")
							.setLabel("Hour")
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Hour of the day (0 ~ 23)")
							.setRequired(true)
							.setMinLength(1)
							.setMaxLength(2)
							.setValue(`${date.hour}`)
					)
				)
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("minute")
							.setLabel("Minute")
							.setStyle(TextInputStyle.Short)
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
