import { Assignment, formatDueDate, GuildCache } from "../all"
import { MessageEmbed } from "discord.js"

export default class Draft extends Assignment {
	public constructor(
		cache: GuildCache,
		id: string,
		message_id: string,
		name: string,
		subject: string,
		date: number,
		details: string[]
	) {
		super(
			cache.getAssignmentRef("draft"),
			id,
			message_id,
			name,
			subject,
			date,
			details
		)
	}

	/**
	 * Formats draft into a string
	 * @returns {string} Formatted draft
	 */
	public static getFormatted(draft: Draft | undefined) {
		const embed = new MessageEmbed()
			.setColor("#ED4245")
			.setTitle(draft ? "Draft" : "No draft")

		if (draft) {
			embed.addField("Name", draft.getName() || "\u200B")
			embed.addField("Subject", draft.getSubject() || "\u200B")
			embed.addField("Date", formatDueDate(draft.getDate()))
			embed.addField("Details", draft.getDetails().join("\n") || "\u200B")
		}

		embed.addField("\u200B", "\u200B")
		embed.addField("Create new task", "`--create`")
		embed.addField("Edit task by id", "`--edit <task id>`")
		embed.addField("Delete task by id", "`--delete <task id>`")
		embed.addField("Discard draft task", "`--discard`")
		embed.addField("Edit draft name", "`--name <task name>`")
		embed.addField("Edit draft subject", `\`--subject <subject name>\``)
		embed.addField("Edit draft date", "`--date <DD>/<MM>/<YYYY> <hh>:<mm>`")
		embed.addField("Add to draft info", "`--info ++ <information to add>`")
		embed.addField(
			"Remove from draft info",
			"`--info -- <index to remove>`"
		)
		embed.addField("Finish draft", "`--done`")

		return embed
	}

	public async saveToFirestore() {
		await this.ref.set({
			id: this.id,
			message_id: this.message_id,
			name: this.name,
			subject: this.subject,
			date: this.date,
			details: this.details
		})
	}

	public async setMessageId(message_id: string) {
		this.message_id = message_id
		await this.ref.update({ message_id })
	}

	public async setName(name: string) {
		this.name = name
		await this.ref.update({ name })
	}

	public async setSubject(subject: string) {
		this.subject = subject
		await this.ref.update({ subject })
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
}
