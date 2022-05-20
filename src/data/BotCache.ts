import { BaseBotCache } from "nova-bot"

import Entry from "./Entry"
import GuildCache from "./GuildCache"

export default class BotCache extends BaseBotCache<Entry, GuildCache> {
	public onConstruct(): void {}
	public onSetGuildCache(cache: GuildCache): void {}

	public async registerGuildCache(guildId: string): Promise<void> {
		const doc = await this.ref.doc(guildId).get()
		if (!doc.exists) {
			await this.ref.doc(guildId).set(this.getEmptyEntry())
		}
	}

	public async eraseGuildCache(guildId: string): Promise<void> {
		const promises: Promise<any>[] = []

		const doc = await this.ref.doc(guildId).get()
		if (doc.exists) {
			const doc = this.ref.doc(guildId)
			;(await doc.collection("reminders").get()).forEach(snap => {
				promises.push(doc.collection("reminders").doc(snap.id).delete())
			})
			promises.push(doc.delete())

			await Promise.allSettled(promises)
		}
	}

	public getEmptyEntry(): Entry {
		return {
			prefix: "",
			aliases: {},
			log_channel_id: "",
			reminders_channel_id: "",
			reminder_message_ids: [],
			ping_channel_id: ""
		}
	}
}
