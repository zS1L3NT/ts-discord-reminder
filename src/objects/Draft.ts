import {Assignment, GuildCache} from "../all"

export default class Draft extends Assignment {
	public constructor(
		cache: GuildCache,
		id: string,
		message_id: string,
		name: string,
		date: number,
		details: string[]
	) {
		super(cache.getAssignmentRef("draft"), id, message_id, name, date, details)
	}

	/**
	 * Formats draft into a string
	 * @returns {string} Formatted draft
	 */
	public static getFormatted(draft: Draft | undefined) {
		const lines: string[] = []
		if (draft) {
			lines.push("**Draft:**")
			lines.push(draft.getFormatted())
		} else {
			lines.push("**No draft**")
		}

		lines.push("\n")
		lines.push("`--create <task name>`")
		lines.push("`--edit <task id>`")
		lines.push("`--delete <task id>`")
		lines.push("`--discard`")
		lines.push("`--name <task name>`")
		lines.push("`--date <DD>/<MM>/<YYYY> <hh>:<mm>`")
		lines.push("`--info ++ <information to add>`")
		lines.push("`--info -- <index to remove>`")
		lines.push("`--done`")

		return lines.join("\n")
	}

	public async saveToFirestore() {
		await this.ref.set({
			id: this.id,
			message_id: this.message_id,
			name: this.name,
			date: this.date,
			details: this.details
		})
	}

	public async setMessageId(message_id: string) {
		this.message_id = message_id
		await this.ref.update({message_id})
	}

	public async setName(name: string) {
		this.name = name
		await this.ref.update({name})
	}

	public async setDate(date: number) {
		this.date = date
		await this.ref.update({date})
	}

	public async pushDetail(detail: string) {
		this.details.push(detail)
		await this.ref.update({details: this.details})
	}

	public async removeDetail(index: number) {
		this.details.splice(index, 1)
		await this.ref.update({details: this.details})
	}
}
