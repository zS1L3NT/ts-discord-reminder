import admin from "firebase-admin"
import { Client, Collection, Guild } from "discord.js"
import GuildCache from "./GuildCache"
import Document from "./Document"

const config = require("../../config.json")

export default class BotCache {
	public bot: Client
	private ref: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
	private guilds: Collection<string, GuildCache>

	public constructor(bot: Client) {
		admin.initializeApp({
			credential: admin.credential.cert(config.firebase.service_account),
			databaseURL: config.firebase.database_url
		})
		this.bot = bot
		this.ref = admin.firestore().collection(config.firebase.collection)
		this.guilds = new Collection<string, GuildCache>()
	}

	public getGuildCache(guild: Guild): Promise<GuildCache> {
		return new Promise<GuildCache>((resolve, reject) => {
			const cache = this.guilds.get(guild.id)
			if (!cache) {
				this.guilds.set(
					guild.id,
					new GuildCache(
						this.bot,
						guild,
						this.ref.doc(guild.id),
						resolve
					)
				)

				this.ref
					.doc(guild.id)
					.get()
					.then(snap => {
						if (!snap.exists) reject()
					})
			}
			else {
				resolve(cache)
			}
		})
	}

	public async createGuildCache(guild: Guild) {
		const doc = await this.ref.doc(guild.id).get()
		if (!doc.exists) {
			await this.ref.doc(guild.id).set(Document.getEmpty().value)
		}
		await this.getGuildCache(guild)
	}

	public async deleteGuildCache(guildId: string) {
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
