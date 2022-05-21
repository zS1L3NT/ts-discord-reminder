import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import Reminder from "../../data/Reminder"
import HasDraftMiddleware from "../../middleware/HasDraftMiddleware"
import IsReminderIdValidMiddleware from "../../middleware/IsReminderIdValidMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		name: "title",
		description: "Changes the title of a Reminder",
		options: [
			{
				name: "title",
				description: "The title of a Reminder",
				type: "string" as const,
				requirements: "Text",
				required: true
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

	override middleware = [new IsReminderIdValidMiddleware(), new HasDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const text = helper.args()
		const hasFirebaseId = !!text[0]?.match(/^[A-Za-z0-9]{20}$/)
		return {
			"reminder-id": hasFirebaseId ? text[0] : null,
			title: hasFirebaseId ? text.slice(1).join(" ") : text.join(" ")
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const title = helper.string("title")!

		if (reminderId) {
			await helper.cache.getReminderDoc(reminderId).update({ title })

			helper.respond(ResponseBuilder.good("Reminder title updated"))
		} else {
			const draft = helper.cache.draft!

			await helper.cache.getDraftDoc().update({ title })

			helper.respond({
				embeds: [
					ResponseBuilder.good("Draft title updated").build(),
					Reminder.toDraftMessageEmbed(draft, helper.cache.guild)
				]
			})
		}
	}
}
