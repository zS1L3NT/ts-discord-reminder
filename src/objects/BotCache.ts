import {GuildCache} from "../all"
import admin from "firebase-admin"
const config = require("../../config.json")

export default class BotCache {
	private ref: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
	private guilds: {
		[guildId: string]: GuildCache
	} = {}

	public constructor() {
		admin.initializeApp({
			credential: admin.credential.cert(config.firebase.service_account),
			databaseURL: config.firebase.database_url
		})
		this.ref = admin.firestore().collection("ts-assignmentbot")
	}

	/**
	 * Gets the cache from the bot of a Guild
	 * @param guildId Guild ID
	 * @returns {GuildCache} Guild Cache
	 */
	public getGuildCache(guildId: string): Promise<GuildCache> {
		return new Promise<GuildCache>(resolve => {
			if (!this.guilds[guildId]) {
				this.guilds[guildId] = new GuildCache(this.ref.doc(guildId), resolve)
			} else {
				resolve(this.guilds[guildId])
			}
		})
	}

	public async createGuildCache(guildId: string) {
		const doc = await this.ref.doc(guildId).get()
		if (!doc.exists) {
			await this.ref.doc(guildId).set({
				modify_channel_id: "",
				modify_message_id: "",
				notify_channel_id: ""
			})
		}
		await this.getGuildCache(guildId)
	}

	public async deleteGuildCache(guildId: string) {
		const doc = await this.ref.doc(guildId).get()
		if (doc.exists) {
			await this.ref.doc(guildId).delete()
		}
	}
}
