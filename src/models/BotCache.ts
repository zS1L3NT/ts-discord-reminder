import admin from "firebase-admin"
import { Client, Guild } from "discord.js"
import GuildCache from "./GuildCache"
import Document from "./Document"

const config = require("../../config.json")

export default class BotCache {
	public bot: Client
	private ref: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
	private guilds: {
		[guildId: string]: GuildCache
	} = {}

	public constructor(bot: Client) {
		admin.initializeApp({
			credential: admin.credential.cert(config.firebase.service_account),
			databaseURL: config.firebase.database_url
		})
		this.bot = bot
		this.ref = admin.firestore().collection("ts-assignmentbot")
	}

	public getGuildCache(guild: Guild): Promise<GuildCache> {
		return new Promise<GuildCache>(resolve => {
			if (!this.guilds[guild.id]) {
				this.guilds[guild.id] = new GuildCache(
					this.bot,
					guild,
					this.ref.doc(guild.id),
					resolve
				)
			} else {
				resolve(this.guilds[guild.id])
			}
		})
	}

	public async createGuildCache(guild: Guild) {
		const doc = await this.ref.doc(guild.id).get()
		if (!doc.exists) {
			await this.ref.doc(guild.id).set(Document.getEmpty())
		}
		await this.getGuildCache(guild)
	}

	public async deleteGuildCache(guildId: string) {
		const doc = await this.ref.doc(guildId).get()
		if (doc.exists) {
			await this.ref.doc(guildId).delete()
		}
	}
}
