import { MessageEmbed } from "discord.js"
import DateHelper from "../utilities/DateHelper"

export interface iReminder {
	id: string
	title: string
	due_date: number
	details: string[]
	priority: 0 | 1 | 2
}

export default class Reminder {
	public static PRIORITY_LOW = 0
	public static PRIORITY_MEDIUM = 1
	public static PRIORITY_HIGH = 2
	public value: iReminder

	public constructor(value: iReminder) {
		this.value = value
	}

	public static getEmpty(): Reminder {
		return new Reminder({
			id: "",
			title: "",
			due_date: 0,
			details: [],
			priority: 1
		})
	}

	public static getDraftEmbed(reminder: Reminder | undefined) {
		const embed = new MessageEmbed()
			.setColor("#5865F2")
			.setTitle(reminder ? "Draft" : "No draft")

		if (reminder) {
			let priority = "?"
			switch (reminder.value.priority) {
				case this.PRIORITY_LOW:
					priority = "LOW"
					break
				case this.PRIORITY_MEDIUM:
					priority = "MEDIUM"
					break
				case this.PRIORITY_HIGH:
					priority = "HIGH"
					break
			}

			embed.addField("Title", reminder.value.title || "\u200B")
			embed.addField("Priority", priority)
			embed.addField("Date", new DateHelper(reminder.value.due_date).getDueDate())
			embed.addField("Details", reminder.value.details.join("\n") || "\u200B")
		}

		return embed
	}

	/**
	 * Formats reminder into a string
	 * @returns {string} Formatted reminder
	 */
	public getEmbed() {
		let color: "#FFFFFF" | "#00FF00" | "#FFFF00" | "#FF0000" = "#FFFFFF"
		switch (this.value.priority) {
			case Reminder.PRIORITY_LOW:
				color = "#00FF00"
				break
			case Reminder.PRIORITY_MEDIUM:
				color = "#FFFF00"
				break
			case Reminder.PRIORITY_HIGH:
				color = "#FF0000"
				break
		}

		return new MessageEmbed()
			.setColor(color)
			.setTitle(this.value.title)
			.setDescription(this.value.details.join("\n"))
			.addField("ID", this.value.id)
			.addField("Due date", new DateHelper(this.value.due_date).getDueDate())
			.addField("Due in", new DateHelper(this.value.due_date).getDueIn())
	}
}