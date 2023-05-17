import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from "discord.js"
import { BaseCommand, CommandHelper } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Edit the description of a Reminder",
		options: [
			{
				name: "reminder-id",
				description: "This is the ID of the Reminder to edit",
				type: "string" as const,
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			}
		]
	}

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(null)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const [reminderId] = helper.args()
		return {
			"reminder-id": reminderId
		}
	}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const reminder = helper.cache.reminders.find(r => r.id === reminderId)
		const draft = helper.cache.draft

		helper.respond(
			{
				embeds: [
					new EmbedBuilder()
						.setColor(Colors.DarkGreen)
						.setTitle("Edit Description")
						.setDescription((reminder || draft)!.description || null)
						.setFooter({
							text: reminderId ? "ID: " + reminderId : "Draft"
						})
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId("description")
							.setLabel("Click to edit")
							.setStyle(ButtonStyle.Success)
					)
				]
			},
			null
		)
	}
}
