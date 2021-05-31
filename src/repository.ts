import admin from "firebase-admin"

export interface Assignment {
	id: string
	name: string
	date: number
	details: string[]
}

export interface GlobalGuildCache {
	builder: Assignment
	modify: string
	shout: string
}
export class LocalGuildCache {
	private ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	private assignments: Assignment[]
	private timer: NodeJS.Timeout | undefined
	private builder: Assignment | null

	private init: number

	public constructor(
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		resolve: (localCache: LocalGuildCache) => void
	) {
		this.init = 0
		this.ref = ref
		this.assignments = []
		this.builder = null

		this.ref.onSnapshot(snap => {
			if (snap.exists) {
				const assignment = snap.data() as GlobalGuildCache
				this.builder = assignment.builder

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

	public generateAssignmentId() {
		return this.ref.collection("assignments").doc().id
	}

	public getAssignment(id: string): Assignment | undefined {
		return this.getAssignments().filter(a => a.id === id)[0]
	}

	public getAssignments() {
		return this.assignments
	}

	public setAssignment(assignment: Assignment) {
		this.assignments.push(assignment)
		this.ref.collection("assignments").doc(assignment.id).set(assignment)
	}

	public removeAssignment(id: string) {
		this.assignments = this.assignments.filter(a => a.id !== id)
		this.ref.collection("assignments").doc(id).delete()
	}

	public getTimer() {
		return this.timer
	}

	public setTimer(timer: NodeJS.Timeout) {
		if (this.timer) clearInterval(this.timer)
		this.timer = timer
	}

	public getBuilder() {
		return this.builder
	}

	public setBuilder(assignment: Assignment) {
		this.builder = assignment
		this.ref.update({
			builder: assignment
		})
	}

	public removeBuilder() {
		this.builder = null
		this.ref.update({
			builder: null
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
