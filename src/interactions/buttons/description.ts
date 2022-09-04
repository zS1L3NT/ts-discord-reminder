import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { BaseButton, ButtonHelper } from "nova-bot"

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

		await helper.interaction.showModal(
			new ModalBuilder()
				.setCustomId("description")
				.setTitle("Edit Description")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("description")
							.setLabel("Description")
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder("Describe the Reminder")
							.setMaxLength(400)
							.setValue((reminder || draft)!.description)
					)
				)
		)
	}
}
