import { BaseCommand, CommandHelper, CommandType, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Edit the priority of a Reminder",
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

	override only = CommandType.Slash

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const index = helper.integer("priority") as 0 | 1 | 2 | null

		if (index === null) {
			return helper.respond(
				ResponseBuilder.bad('Invalid priority, must be either "low", "medium" or "high"')
			)
		}

		let oldIndex = -1
		if (reminderId) {
			oldIndex = helper.cache.reminders.find(rm => rm.id === reminderId)!.priority
			await helper.cache.getReminderDoc(reminderId).update({ priority: index })
		} else {
			oldIndex = helper.cache.draft!.priority
			helper.cache.draft!.priority = index
			await helper.cache.getDraftDoc().update({ priority: index })
		}

		await helper.respond({
			embeds: [
				ResponseBuilder.good(
					`${reminderId ? "Reminder" : "Draft"} priority updated`
				).build()
			],
			components: []
		})

		const priorities = ["LOW", "MEDIUM", "HIGH"]
		helper.cache.logger.log({
			member: helper.member,
			title: `Priority Updated`,
			description: [
				`<@${helper.member.id}> changed the priority of a Reminder`,
				`**Reminder ID**: ${reminderId ?? "Draft"}`,
				`**Old Priority**: ${priorities[oldIndex]}`,
				`**New Priority**: ${priorities[index]}`
			].join("\n"),
			command: "priority",
			color: "YELLOW"
		})
	}
}
