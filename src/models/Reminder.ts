import { Guild, MessageEmbed } from "discord.js"
import DateHelper from "../utilities/DateHelper"

export interface iReminder {
	id: string
	title: string
	due_date: number
	details: string[]
	priority: 0 | 1 | 2
	pings: {
		members: string[]
		roles: string[]
	}
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
			due_date: Date.now(),
			details: [],
			priority: 1,
			pings: {
				members: [],
				roles: []
			}
		})
	}

	public static getDraftEmbed(reminder: Reminder | undefined, guild: Guild) {
		let color: "#5865F2" | "#00FF00" | "#FFFF00" | "#FF0000" = "#5865F2"
		switch (reminder?.value?.priority ?? -1) {
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

		const embed = new MessageEmbed().setColor(color).setTitle(reminder ? "Draft" : "No draft")

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
			embed.addField("Pinging", reminder.getPingString(guild))
			embed.addField("Date", new DateHelper(reminder.value.due_date).getDate())
			embed.addField("Details", reminder.value.details.join("\n") || "\u200B")
		}

		return embed
	}

	/**
	 * Formats reminder into a string
	 * @returns {string} Formatted reminder
	 */
	public getEmbed(guild: Guild) {
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
			.addField("Pinging", this.getPingString(guild))
			.addField("Due date", new DateHelper(this.value.due_date).getDate())
			.addField("Due in", new DateHelper(this.value.due_date).getTimeLeft())
	}

	public getPingString(guild: Guild) {
		let string = ""
		this.value.pings.roles.forEach(role => {
			if (role === guild.roles.everyone.id) {
				string += `@everyone`
			} else {
				string += `<@&${role}>`
			}
		})
		this.value.pings.members.forEach(member => {
			string += `<@!${member}>`
		})
		return string || "Not pinging anyone"
	}
}
