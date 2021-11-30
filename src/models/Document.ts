import { BaseDocument, iBaseValue } from "discordjs-nova"

export interface iValue extends iBaseValue {
	reminders_channel_id: string
	reminders_message_ids: string[]
	ping_channel_id: string
}

export default class Document extends BaseDocument<iValue, Document> {
	getEmpty(): Document {
		return new Document({
			reminders_channel_id: "",
			reminders_message_ids: [],
			ping_channel_id: ""
		})
	}
}
