export interface iDocument {
	modify_channel_id: string
	modify_message_id: string
	notify_channel_id: string
	notify_message_ids: string[]
	ping_channel_id: string
	colors: { [subject_name: string]: string }
}

export default class Document {
	public value: iDocument

	public constructor(value: iDocument) {
		this.value = value
	}

	public static getEmpty(): Document {
		return new Document({
			modify_channel_id: "",
			modify_message_id: "",
			notify_channel_id: "",
			notify_message_ids: [],
			ping_channel_id: "",
			colors: {}
		})
	}
}
