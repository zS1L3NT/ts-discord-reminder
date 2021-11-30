import { BaseBotCache } from "discordjs-nova"
import Document, { iValue } from "./Document"
import GuildCache from "./GuildCache"

export default class BotCache extends BaseBotCache<iValue, Document, GuildCache> {
	public async registerGuildCache(guildId: string): Promise<void> {
		const doc = await this.ref.doc(guildId).get()
		if (!doc.exists) {
			await this.ref.doc(guildId).set(new Document().getEmpty().value)
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
		this.guilds.delete(guildId)
	}
}
