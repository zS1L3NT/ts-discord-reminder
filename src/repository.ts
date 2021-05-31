import admin from "firebase-admin"

export interface Assignment {
	id: string
	name: string
	date: number
	details: string[]
}

export interface GlobalGuildCache {
	draft: Assignment
	modify: string
	shout: string
}
export class LocalGuildCache {
	private ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	private assignments: Assignment[]
	private modify_timer: NodeJS.Timeout | undefined
	private notify_timer: NodeJS.Timeout | undefined
	private draft: Assignment | null

	private modify: string
	private init: number

	public constructor(
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		resolve: (localCache: LocalGuildCache) => void
	) {
		this.init = 0
		this.ref = ref
		this.assignments = []
		this.draft = null
		this.modify = ""

		this.ref.onSnapshot(snap => {
			if (snap.exists) {
				const assignment = snap.data() as GlobalGuildCache
				this.draft = assignment.draft
				this.modify = assignment.modify

				if (this.init < 3) this.init++
				if (this.init === 2) resolve(this)
			}
		})
		this.ref.collection("assignments").onSnapshot(snap => {
			const assignments = snap.docs.map(doc => doc.data() as Assignment)
			this.assignments = assignments

			if (this.init < 3) this.init++
			if (this.init === 2) resolve(this)
		})
	}

	public getModifyChannelId() {
		return this.modify
	}

	public async setModifyChannelId(modify: string) {
		this.modify = modify
		await this.ref.update({ modify })
	}

	public generateAssignmentId() {
		return this.ref.collection("assignments").doc().id
	}

	public getAssignment(id: string): Assignment | undefined {
		return this.getAssignments().filter(a => a.id === id)[0]
	}

	public getAssignments() {
		return this.assignments
	}

	public async setAssignment(assignment: Assignment) {
		this.assignments.push(assignment)
		await this.ref.collection("assignments").doc(assignment.id).set(assignment)
	}

	public async removeAssignment(id: string) {
		this.assignments = this.assignments.filter(a => a.id !== id)
		await this.ref.collection("assignments").doc(id).delete()
	}

	public getModifyTimer() {
		return this.modify_timer
	}

	public setModifyTimer(modify_timer: NodeJS.Timeout) {
		if (this.modify_timer) clearInterval(this.modify_timer)
		this.modify_timer = modify_timer
	}

	public getNotifyTimer() {
		return this.notify_timer
	}

	public setNotifyTimer(notify_timer: NodeJS.Timeout) {
		if (this.notify_timer) clearInterval(this.notify_timer)
		this.notify_timer = notify_timer
	}

	public getDraft() {
		return this.draft
	}

	public async setDraft(assignment: Assignment) {
		this.draft = assignment
		await this.ref.update({
			draft: assignment
		})
	}

	public async removeDraft() {
		this.draft = null
		await this.ref.update({
			draft: null
		})
	}
}

export default class LocalStorage {
	private ref: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
	private guilds: {
		[guildId: string]: LocalGuildCache
	} = {}

	public constructor() {
		admin.initializeApp({
			credential: admin.credential.cert(require("../serviceAccountKey.json")),
			databaseURL: "https://zectan-projects-default-rtdb.firebaseio.com"
		})
		this.ref = admin.firestore().collection("ts-assignmentbot")
	}

	public getLocalCache(guildId: string): Promise<LocalGuildCache> {
		return new Promise<LocalGuildCache>(resolve => {
			if (!this.guilds[guildId]) {
				this.guilds[guildId] = new LocalGuildCache(this.ref.doc(guildId), resolve)
			} else {
				resolve(this.guilds[guildId])
			}
		})
	}
}
