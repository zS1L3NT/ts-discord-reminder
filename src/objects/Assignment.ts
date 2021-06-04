import {Draft, formatDueDate, formatDueIn, GuildCache} from "../all"
import {MessageEmbed} from "discord.js";

export default class Assignment {
	protected ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	protected id: string
	protected message_id: string
	protected name: string
	protected subject: string
	protected date: number
	protected details: string[]

	public constructor(
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		id: string,
		message_id: string,
		name: string,
		subject: string,
		date: number,
		details: string[]
	) {
		this.ref = ref
		this.id = id
		this.message_id = message_id
		this.name = name
		this.subject = subject
		this.date = date
		this.details = details
	}

	/**
	 * @async Convert this Assignment to the Draft object which is a editable assignment
	 * @param cache Current cache object
	 * @returns {Draft} Converted Draft object
	 */
	public async toDraft(cache: GuildCache) {
		await cache.removeAssignment(this.id)
		return new Draft(cache, this.id, this.message_id, this.name, this.subject, this.date, this.details)
	}

	public async setMessageId(message_id: string) {
		this.message_id = message_id
		await this.ref.update({
			message_id
		})
	}

	public getId() {
		return this.id
	}

	public getMessageId() {
		return this.message_id
	}

	public getName() {
		return this.name
	}

	public getSubject() {
		return this.subject;
	}

	public getDate() {
		return this.date
	}

	public getDetails() {
		return this.details
	}

	/**
	 * Formats assignment into a string
	 * @returns {string} Formatted assignment
	 */
	public getFormatted(colors: { [subject_name: string]: string }) {
		return new MessageEmbed()
			.setColor(colors[this.getSubject()] || "#FFFFFF")
			.setTitle(this.getSubject() + " " + this.getName())
			.setDescription(this.getDetails().join("\n"))
			.addField("ID", this.getId())
			.addField("Due date", formatDueDate(this.getDate()))
			.addField("Due in", formatDueIn(this.getDate()))
	}

	public async delete() {
		await this.ref.delete()
	}
}
