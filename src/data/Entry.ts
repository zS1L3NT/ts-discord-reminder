import { BaseEntry } from "nova-bot"

export default interface Entry extends BaseEntry {
	reminders_channel_id: string
	reminder_message_ids: string[]
	ping_channel_id: string
}
