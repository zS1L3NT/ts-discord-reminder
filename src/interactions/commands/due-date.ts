import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { BaseCommand, CommandHelper, DateHelper } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Edit the due date of a Reminder",
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

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(null)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const [reminderId] = helper.args()
		return {
			"reminder-id": reminderId
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
		const draft = helper.cache.draft

		helper.respond(
			{
				embeds: [
					new MessageEmbed()
						.setColor("DARK_GREEN")
						.setTitle("Edit Due Date")
						.setDescription(new DateHelper((reminder || draft)!.due_date).getDate())
						.setFooter({
							text: reminderId ? "ID: " + reminderId : "Draft"
						})
				],
				components: [
					new MessageActionRow().addComponents(
						new MessageButton()
							.setCustomId("due-date")
							.setLabel("Click to edit")
							.setStyle("SUCCESS")
					)
				]
			},
			null
		)
	}
}
