import { useTry } from "no-try"
import { BaseModal, DateHelper, ModalHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import logger from "../../logger"

export default class extends BaseModal<Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ModalHelper<Entry, GuildCache>) {
		const footerText = helper.message!.embeds[0]!.footer!.text!

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
			let oldDueDate = -1
			if (footerText === "Draft") {
				oldDueDate = helper.cache.draft!.due_date
				helper.cache.draft!.due_date = dueDate
				await helper.cache.getDraftDoc().update({ due_date: dueDate })
			} else {
				const reminderId = footerText.slice(4)
				oldDueDate = helper.cache.reminders.find(rm => rm.id === reminderId)!.due_date
				await helper.cache.getReminderDoc(reminderId).update({ due_date: dueDate })
			}

			await helper.update({
				embeds: [
					ResponseBuilder.good(
						`${footerText === "Draft" ? "Draft" : "Reminder"} due date updated`
					).build()
				],
				components: []
			})
			helper.cache.logger.log({
				member: helper.member,
				title: `Due Date Updated`,
				description: [
					`<@${helper.member.id}> changed the due date of a Reminder`,
					`**Reminder ID**: ${footerText === "Draft" ? footerText : footerText.slice(4)}`,
					`**Old Due Date**: ${new DateHelper(oldDueDate).getDate()}`,
					`**New Due Date**: ${new DateHelper(dueDate).getDate()}`
				].join("\n"),
				command: "due-date",
				color: "YELLOW"
			})
		}

		if (helper.message!.type !== "APPLICATION_COMMAND") {
			setTimeout(
				() =>
					helper
						.message!.delete()
						.catch(err => logger.log("Failed to delete message", err)),
				5000
			)
		}
	}
}
