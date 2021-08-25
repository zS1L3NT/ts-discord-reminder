import { MessageEmbed } from "discord.js"
import GuildCache from "./GuildCache"
import Draft from "./Draft"
import DateFunctions from "../utilities/DateFunctions"

export default class Assignment {
	protected ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	protected id: string
	protected name: string
	protected subject: string
	protected date: number
	protected details: string[]

	public constructor(
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		id: string,
		name: string,
		subject: string,
		date: number,
		details: string[]
	) {
		this.ref = ref
		this.id = id
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
		return new Draft(
			cache,
			this.id,
			this.name,
			this.subject,
			this.date,
			this.details
		)
	}

	public getId() {
		return this.id
	}

	public getName() {
		return this.name
	}

	public getSubject() {
		return this.subject
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
		return (
			new MessageEmbed()
				// @ts-ignore
				.setColor(colors[this.getSubject()] || "#FFFFFF")
				.setTitle(this.getSubject() + " " + this.getName())
				.setDescription(this.getDetails().join("\n"))
				.addField("ID", this.getId())
				.addField(
					"Due date",
					new DateFunctions(this.getDate()).getDueDate()
				)
				.addField(
					"Due in",
					new DateFunctions(this.getDate()).getDueIn()
				)
		)
	}

	public async delete() {
		await this.ref.delete()
	}
}