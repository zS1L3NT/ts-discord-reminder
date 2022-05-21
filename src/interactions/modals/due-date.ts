import { Message } from "discord.js"
import { useTry } from "no-try"
import { BaseModal, DateHelper, ModalHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"

export default class extends BaseModal<Entry, GuildCache> {
	override defer = false
	override ephemeral = true

	override middleware = []

	override async execute(helper: ModalHelper<Entry, GuildCache>) {
		const message = helper.interaction.message! as Message
		const reminderId = message.embeds[0]!.footer!.text!

		let error = null

		const dayStr = helper.text("day")!
		const monthStr = helper.text("month")!
		const yearStr = helper.text("year")!
		const hourStr = helper.text("hour")!
		const minuteStr = helper.text("minute")!

		const monthIndex = DateHelper.nameOfMonths
			.map(m => m.toLowerCase())
			.indexOf(monthStr.toLowerCase())
		const day = isNaN(+dayStr) ? ((error = "Day must be a number"), -1) : +dayStr
		const month = monthIndex === -1 ? ((error = "Month is not valid"), -1) : monthIndex
		const year = isNaN(+yearStr) ? ((error = "Year must be a number"), -1) : +yearStr
		const hour = isNaN(+hourStr) ? ((error = "Hour must be a number"), -1) : +hourStr
		const minute = isNaN(+minuteStr) ? ((error = "Minute must be a number"), -1) : +minuteStr

		const [err, dueDate] = useTry(() =>
			DateHelper.verify(day, month, year, hour, minute).toMillis()
		)

		if (err) error = err.message

		if (error) {
			helper.update({
				embeds: [ResponseBuilder.bad(error).build()],
				components: []
			})
		} else {
			if (reminderId === "Draft") {
				helper.cache.draft!.due_date = dueDate
				await helper.cache.getDraftDoc().update({ due_date: dueDate })
			} else {
				await helper.cache.getReminderDoc(reminderId.slice(4)).update({ due_date: dueDate })
			}

			await helper.update({
				embeds: [ResponseBuilder.good("Draft due date updated").build()],
				components: []
			})
		}

		if (message.type !== "APPLICATION_COMMAND") {
			setTimeout(
				() => message.delete().catch(err => logger.log("Failed to delete message", err)),
				5000
			)
		}
	}
}
