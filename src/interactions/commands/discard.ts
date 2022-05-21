import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Discards a draft Reminder if it exists"
	}

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(false)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const embed = helper.cache.draft?.toMessageEmbed(helper.cache.guild)!

		delete helper.cache.draft
		await helper.cache.getDraftDoc().delete()

		helper.respond(ResponseBuilder.good("Draft discarded"))
		helper.cache.logger.log({
			member: helper.member,
			title: `Draft Discarded`,
			description: `<@${helper.member.id}> discarded the draft`,
			command: "discard",
			color: "RED",
			embeds: [embed.setColor("#000000")]
		})
	}
}
