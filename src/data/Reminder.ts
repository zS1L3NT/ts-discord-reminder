import { Guild, MessageEmbed } from "discord.js"
import { FirestoreDataConverter } from "firebase-admin/firestore"
import { DateHelper } from "nova-bot"

export default class Reminder {
	public constructor(
		public id: string,
		public title: string,
		public description: string,
		public due_date: number,
		public priority: 0 | 1 | 2,
		public pings: {
			members: string[]
			roles: string[]
		}
	) {}

	public static getEmpty(): Reminder {
		return new Reminder("", "", "", Date.now(), 0, { members: [], roles: [] })
	}

	public static toDraftMessageEmbed(reminder: Reminder | undefined, guild: Guild): MessageEmbed {
		let color: "#5865F2" | "#00FF00" | "#FFFF00" | "#FF0000" = "#5865F2"
		switch (reminder?.priority ?? -1) {
			case 0:
				color = "#00FF00"
				break
			case 1:
				color = "#FFFF00"
				break
			case 2:
				color = "#FF0000"
				break
		}

		const embed = new MessageEmbed().setColor(color).setTitle(reminder ? "Draft" : "No draft")

		if (reminder) {
			let priority = "?"
			switch (reminder.priority) {
				case 0:
					priority = "LOW"
					break
				case 1:
					priority = "MEDIUM"
					break
				case 2:
					priority = "HIGH"
					break
			}

			embed.addField("Title", reminder.title || "\u200B")
			embed.addField("Priority", priority)
			embed.addField("Pinging", reminder.getPingString(guild))
			embed.addField("Date", new DateHelper(reminder.due_date).getDate())
			embed.addField("Description", reminder.description || "\u200B")
		}

		return embed
	}

	/**
	 * Formats reminder into a string
	 * @returns {string} Formatted reminder
	 */
	public toMessageEmbed(guild: Guild): MessageEmbed {
		let color: "#FFFFFF" | "#00FF00" | "#FFFF00" | "#FF0000" = "#FFFFFF"
		switch (this.priority) {
			case 0:
				color = "#00FF00"
				break
			case 1:
				color = "#FFFF00"
				break
			case 2:
				color = "#FF0000"
				break
		}

		return new MessageEmbed()
			.setColor(color)
			.setTitle(this.title)
			.setDescription(this.description)
			.addField("ID", this.id)
			.addField("Pinging", this.getPingString(guild))
			.addField("Due date", new DateHelper(this.due_date).getDate())
			.addField("Due in", new DateHelper(this.due_date).getTimeLeft())
	}

	public getPingString(guild: Guild) {
		return (
			this.pings.roles
				.map(r => (r === guild.roles.everyone.id ? "@everyone" : `<@&${r}>`))
				.join("") + this.pings.members.map(m => `<@!${m}>`).join("") || "Not pinging anyone"
		)
	}
}

export class ReminderConverter implements FirestoreDataConverter<Reminder> {
	toFirestore(
		reminder: Reminder,
		options?: FirebaseFirestore.SetOptions
	): FirebaseFirestore.DocumentData {
		return {
			id: reminder.id,
			title: reminder.title,
			due_date: reminder.due_date,
			description: reminder.description,
			priority: reminder.priority,
			pings: reminder.pings
		}
	}

	fromFirestore(
		snap: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
	): Reminder {
		const data = snap.data()
		return new Reminder(
			data.id,
			data.title,
			data.description,
			data.due_date,
			data.priority,
			data.pings
		)
	}
}
