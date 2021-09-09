export interface iDocument {
	reminders_channel_id: string
	reminders_message_ids: string[]
	ping_channel_id: string
}

export default class Document {
	public value: iDocument

	public constructor(value: iDocument) {
		this.value = value
	}

	public static getEmpty(): Document {
		return new Document({
			reminders_channel_id: "",
			reminders_message_ids: [],
			ping_channel_id: ""
		})
	}
}
