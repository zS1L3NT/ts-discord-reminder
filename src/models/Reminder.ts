import { MessageEmbed } from "discord.js"
import GuildCache from "./GuildCache"
import DateFunctions from "../utilities/DateFunctions"

export class Reminder {
	public static PRIORITY_LOW = 1
	public static PRIORITY_HIGH = 2

	public id: string
	public name: string
	public date: number
	public details: string[]
	public priority: number
	protected ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>

	public constructor(
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		id: string,
		name: string,
		date: number,
		details: string[],
		priority: number
	) {
		this.ref = ref
		this.id = id
		this.name = name
		this.date = date
		this.details = details
		this.priority = priority
	}

	/**
	 * @async Convert this Reminder to the Draft object which is a editable reminder
	 * @param cache Current cache object
	 * @returns {Draft} Converted Draft object
	 */
	public async toDraft(cache: GuildCache) {
		await cache.removeReminder(this.id)
		return new Draft(
			cache,
			this.id,
			this.name,
			this.date,
			this.details,
			this.priority
		)
	}

	/**
	 * Formats reminder into a string
	 * @returns {string} Formatted reminder
	 */
	public getFormatted() {
		let color: "#FFFFFF" | "#00FF00" | "#FF0000" = "#FFFFFF"
		switch (this.priority) {
			case Reminder.PRIORITY_LOW:
				color = "#00FF00"
				break
			case Reminder.PRIORITY_HIGH:
				color = "#FF0000"
				break
		}

		return new MessageEmbed()
			.setColor(color)
			.setTitle(this.name)
			.setDescription(this.details.join("\n"))
			.addField("ID", this.id)
			.addField("Due date", new DateFunctions(this.date).getDueDate())
			.addField("Due in", new DateFunctions(this.date).getDueIn())
	}

	public async delete() {
		await this.ref.delete()
	}
}

export class Draft extends Reminder {
	public constructor(
		cache: GuildCache,
		id: string,
		name: string,
		date: number,
		details: string[],
		priority: number
	) {
		super(cache.getReminderRef("draft"), id, name, date, details, priority)
	}

	/**
	 * Formats draft into a string
	 * @returns {string} Formatted draft
	 */
	public static getFormatted(draft: Draft | undefined) {
		const embed = new MessageEmbed()
			.setColor("#5865F2")
			.setTitle(draft ? "Draft" : "No draft")

		if (draft) {
			let priority = "?"
			switch (draft.priority) {
				case this.PRIORITY_LOW:
					priority = "LOW"
					break
				case this.PRIORITY_HIGH:
					priority = "HIGH"
					break
			}

			embed.addField("Name", draft.name || "\u200B")
			embed.addField("Priority", priority)
			embed.addField("Date", new DateFunctions(draft.date).getDueDate())
			embed.addField("Details", draft.details.join("\n") || "\u200B")
		}

		return embed
	}

	public async saveToFirestore() {
		await this.ref.set({
			id: this.id,
			name: this.name,
			date: this.date,
			details: this.details,
			priority: this.priority
		})
	}

	public async setName(name: string) {
		this.name = name
		await this.ref.update({ name })
	}

	public async setDate(date: number) {
		this.date = date
		await this.ref.update({ date })
	}

	public async pushDetail(detail: string) {
		this.details.push(detail)
		await this.ref.update({ details: this.details })
	}

	public async removeDetail(index: number) {
		this.details.splice(index, 1)
		await this.ref.update({ details: this.details })
	}

	public async setPriority(priority: number) {
		this.priority = priority
		await this.ref.update({ priority })
	}
}
