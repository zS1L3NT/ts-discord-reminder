import admin, { database } from "firebase-admin"

export interface Assignment {
	name: string
	date: number
	details?: string[]
}

export interface GlobalCache {
	assignments: {
		[name: string]: Assignment
	}
	builders: {
		[channelId: string]: Assignment
	}
}
export class LocalCache {
	private init: boolean
	private ref: database.Reference
	private assignments: Assignment[]
	private timer: NodeJS.Timeout | undefined
	private builders: {
		[channelId: string]: Assignment
	}

	public constructor(ref: database.Reference, resolve: (localCache: LocalCache) => void) {
		this.init = false
		this.ref = ref
		this.assignments = []
		this.builders = {}

		this.ref.on("value", async snap => {
			if (snap.exists()) {
				const cache = snap.val() as GlobalCache
				this.assignments = Object.values(cache.assignments || {})
				this.builders = cache.builders || {}
				if (!this.init) {
					resolve(this)
					this.init = true
				}
			} else {
				this.assignments = []
				this.builders = {}
			}
		})
	}

	public getAssignment(name: string): Assignment | undefined {
		return this.getAssignments().filter(a => a.name === name)[0]
	}

	public getAssignments() {
		return this.assignments
	}

	public setAssignment(assignment: Assignment) {
		this.assignments.push(assignment)
		this.ref.child("assignments").child(assignment.name).set(assignment)
	}

	public removeAssignment(name: string) {
		this.assignments = this.assignments.filter(a => a.name !== name)
		this.ref.child("assignments").child(name).remove()
	}

	public getTimer() {
		return this.timer
	}

	public setTimer(timer: NodeJS.Timeout) {
		if (this.timer) clearInterval(this.timer)
		this.timer = timer
	}

	public getBuilder(channelId: string) {
		return this.builders[channelId]
	}

	public setBuilder(channelId: string, assignment: Assignment) {
		this.builders[channelId] = assignment
		this.ref.child("builders").child(channelId).set(assignment)
	}

	public removeBuilder(channelId: string) {
		delete this.builders[channelId]
		this.ref.child("builders").child(channelId).remove()
	}
}

export default class LocalStorage {
	private ref: database.Reference
	private guilds: {
		[guildId: string]: LocalCache
	} = {}

	public constructor() {
		admin.initializeApp({
			credential: admin.credential.cert(require("../serviceAccountKey.json")),
			databaseURL: "https://zectan-projects-default-rtdb.firebaseio.com"
		})
		this.ref = admin.database().ref("ts-assignmentbot")
	}

	public getLocalCache(guildId: string): Promise<LocalCache> {
		return new Promise<LocalCache>(resolve => {
			if (!this.guilds[guildId]) {
				this.guilds[guildId] = new LocalCache(this.ref.child(guildId), resolve)
			} else {
				resolve(this.guilds[guildId])
			}
		})
	}
}
