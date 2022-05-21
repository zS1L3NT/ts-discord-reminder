import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Deletes a Reminder",
		options: [
			{
				name: "reminder-id",
				description: "This is the ID of the Reminder to edit",
				type: "string" as const,
				requirements: "Valid Reminder ID",
				required: true
			}
		]
	}

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>): boolean | void {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const [reminderId] = helper.args()
		return {
			"reminder-id": reminderId || ""
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")!
		const reminder = helper.cache.reminders.find(rm => rm.id === reminderId)!

		helper.cache.reminders = helper.cache.reminders.filter(rm => rm.id !== reminderId)
		await helper.cache.getReminderDoc(reminderId).delete()

		helper.cache.updateMinutely()
		helper.respond(ResponseBuilder.good(`Reminder deleted`))
		helper.cache.logger.log({
			member: helper.member,
			title: `Reminder deleted`,
			description: `<@${helper.member.id}> deleted a reminder`,
			command: "delete",
			color: "RED",
			embeds: [reminder.toMessageEmbed(helper.cache.guild).setColor("#000000")]
		})
	}
}
