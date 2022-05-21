import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description:
			"Changes how often the bot will ping users about a Reminder before the due date",
		options: [
			{
				name: "priority",
				description:
					"Can either be HIGH(7d, 1d, 12h, 2h, 1h, 30m), MEDIUM(1d, 2h) or LOW priority",
				type: "number" as const,
				requirements: "Valid Priority",
				required: true,
				choices: [
					{
						name: "LOW",
						value: 0
					},
					{
						name: "MEDIUM",
						value: 1
					},
					{
						name: "HIGH",
						value: 2
					}
				]
			},
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
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const priorities = ["low", "medium", "high"]
		const priorityStr = helper.args().at(0)?.toLowerCase() || ""
		return {
			priority: priorities.includes(priorityStr) ? priorities.indexOf(priorityStr) : null
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const priority = helper.integer("priority") as 0 | 1 | 2 | null

		if (!priority) {
			return helper.respond(
				ResponseBuilder.bad('Invalid priority, must be either "low", "medium" or "high"')
			)
		}

		if (reminderId) {
			await helper.cache.getReminderDoc(reminderId).update({ priority })

			helper.respond(ResponseBuilder.good("Reminder priority updated"))
		} else {
			const draft = helper.cache.draft!

			draft.priority = priority
			await helper.cache.getDraftDoc().update({ priority })

			helper.respond({
				embeds: [
					ResponseBuilder.good(`Draft priority updated`).build(),
					Reminder.toDraftMessageEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}
