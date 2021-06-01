import { GuildCache } from "../all"
import admin from "firebase-admin"

export default class BotCache {
	private ref: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
	private guilds: {
		[guildId: string]: GuildCache
	} = {}

	public constructor() {
		admin.initializeApp({
			credential: admin.credential.cert(require("../../serviceAccountKey.json")),
			databaseURL: "https://zectan-projects-default-rtdb.firebaseio.com"
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
}
