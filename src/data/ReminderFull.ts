import { EmbedBuilder, Guild } from "discord.js"
import { DateHelper } from "nova-bot"

import { Ping, PingType, Priority, Reminder } from "@prisma/client"

export default class ReminderFull implements Reminder {
	constructor(
		public guild_id: string,
		public id: string,
		public title: string,
		public description: string,
		public due_date: Date,
		public priority: Priority,
		public pings: Ping[]
	) {}

	getReminder(): Reminder {
		return {
			guild_id: this.guild_id,
			id: this.id,
			title: this.title,
			description: this.description,
			due_date: this.due_date,
			priority: this.priority
		}
	}

	static getEmpty(): ReminderFull {
		return new ReminderFull("", "", "", "", new Date(), Priority.Low, [])
	}

	static toDraftEmbedBuilder(reminder: ReminderFull | undefined, guild: Guild): EmbedBuilder {
		let color: "#5865F2" | "#00FF00" | "#FFFF00" | "#FF0000" = "#5865F2"
		switch (reminder?.priority ?? -1) {
			case Priority.Low:
				color = "#00FF00"
				break
			case Priority.Medium:
				color = "#FFFF00"
				break
			case Priority.High:
				color = "#FF0000"
				break
		}

		const embed = new EmbedBuilder().setColor(color).setTitle(reminder ? "Draft" : "No draft")

		if (reminder) {
			embed.addFields(
				{ name: "Title", value: reminder.title || "\u200B" },
				{ name: "Priority", value: reminder.priority.toString() },
				{ name: "Pinging", value: reminder.getPingString(guild) },
				{ name: "Date", value: new DateHelper(reminder.due_date.getTime()).getDate() },
				{ name: "Description", value: reminder.description || "\u200B" }
			)
		}

		return embed
	}

	/**
	 * Formats reminder into a string
	 * @returns {string} Formatted reminder
	 */
	toEmbedBuilder(guild: Guild): EmbedBuilder {
		let color: "#FFFFFF" | "#00FF00" | "#FFFF00" | "#FF0000" = "#FFFFFF"
		switch (this.priority) {
			case Priority.Low:
				color = "#00FF00"
				break
			case Priority.Medium:
				color = "#FFFF00"
				break
			case Priority.High:
				color = "#FF0000"
				break
		}

		return new EmbedBuilder()
			.setColor(color)
			.setTitle(this.title)
			.setDescription(this.description)
			.addFields(
				{ name: "Pinging", value: this.getPingString(guild) },
				{ name: "Due date", value: new DateHelper(this.due_date.getTime()).getDate() },
				{ name: "Due in", value: new DateHelper(this.due_date.getTime()).getTimeLeft() }
			)
			.setFooter({ text: this.id })
	}

	getPingString(guild: Guild) {
		return (
			this.pings
				.filter(ping => ping.type === PingType.Role)
				.map(r => (r.reference_id === guild.roles.everyone.id ? "@everyone" : `<@&${r}>`))
				.join("") +
				this.pings
					.filter(ping => ping.type === PingType.Member)
					.map(m => `<@!${m}>`)
					.join("") || "Not pinging anyone"
		)
	}
}
