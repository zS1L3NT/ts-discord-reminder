import { Draft, formatDate, GuildCache } from "../all"

export default class Assignment {
	protected ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	protected id: string
	protected message_id: string
	protected name: string
	protected date: number
	protected details: string[]

	public constructor(
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		id: string,
		message_id: string,
		name: string,
		date: number,
		details: string[]
	) {
		this.ref = ref
		this.id = id
		this.message_id = message_id
		this.name = name
		this.date = date
		this.details = details
	}

	public async toDraft(cache: GuildCache) {
		await cache.removeAssignment(this.id)
		return new Draft(cache, this.id, this.message_id, this.name, this.date, this.details)
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

	public getDate() {
		return this.date
	}

	public getDetails() {
		return this.details
	}

	public getFormatted() {
		const lines: string[] = []
		lines.push(`**${this.getName()}**`)
		lines.push(`Due: **${formatDate(this.getDate())}**`)
		lines.push(`ID: \`${this.getId()}\``)
		if (this.getDetails().length > 0) {
			lines.push(`Information:`)
			this.getDetails().forEach((detail, i) => lines.push(`(${i + 1}) ${detail}`))
		}
		return lines.join("\n")
	}

	public async delete() {
		await this.ref.delete()
	}
}
