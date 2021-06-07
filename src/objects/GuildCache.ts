import { Assignment, Draft } from "../all"

interface GlobalGuildCache {
	modify_channel_id: string
	modify_message_id: string
	notify_channel_id: string
	notify_message_ids: string[]
	colors: { [subject_name: string]: string }
}

export default class GuildCache {
	private ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	private assignments: Assignment[] = []
	private draft: Draft | undefined

	private modify_channel_id = ""
	private modify_message_id = ""
	private notify_channel_id = ""
	private notify_message_ids: string[] = []
	private colors: { [subject_name: string]: string } = {}
	private init: number = 0

	public constructor(
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		resolve: (localCache: GuildCache) => void
	) {
		this.ref = ref
		this.ref.onSnapshot(snap => {
			if (snap.exists) {
				// Set the cache from Firestore
				const assignment = snap.data() as GlobalGuildCache
				this.modify_channel_id = assignment.modify_channel_id
				this.modify_message_id = assignment.modify_message_id
				this.notify_channel_id = assignment.notify_channel_id
				this.notify_message_ids = assignment.notify_message_ids
				this.colors = assignment.colors

				if (this.init < 3) this.init++
				if (this.init === 2) resolve(this)
			}
		})
		this.ref.collection("assignments").onSnapshot(snap => {
			// Set the cache from Firestore
			this.assignments = this.docsToAssignments(snap.docs)
			this.draft = this.docsToDraft(snap.docs)

			if (this.init < 3) this.init++
			if (this.init === 2) resolve(this)
		})
	}

	/**
	 * Get the reference to the object in Firestore
	 * @param id Assignment ID
	 * @returns Reference to object in Firestore
	 */
	public getAssignmentRef(id: string) {
		return this.ref.collection("assignments").doc(id)
	}

	public getModifyChannelId() {
		return this.modify_channel_id
	}

	public async setModifyChannelId(modify_channel_id: string) {
		this.modify_channel_id = modify_channel_id
		await this.ref.update({ modify_channel_id })
	}

	public getModifyMessageId() {
		return this.modify_message_id
	}

	public async setModifyMessageId(modify_message_id: string) {
		this.modify_message_id = modify_message_id
		await this.ref.update({ modify_message_id })
	}

	public getNotifyChannelId() {
		return this.notify_channel_id
	}

	public async setNotifyChannelId(notify_channel_id: string) {
		this.notify_channel_id = notify_channel_id
		await this.ref.update({ notify_channel_id })
	}

	public getNotifyMessageIds() {
		return this.notify_message_ids
	}

	public async setNotifyMessageIds(notify_message_ids: string[]) {
		this.notify_message_ids = notify_message_ids
		await this.ref.update({ notify_message_ids })
	}

	public async pushNotifyMessageId(notify_message_id: string) {
		this.notify_message_ids.push(notify_message_id)
		await this.ref.update({ notify_message_ids: this.notify_message_ids })
	}

	public async removeNotifyMessageId(notify_message_id: string) {
		this.notify_message_ids = this.notify_message_ids.filter(
			id => id !== notify_message_id
		)
		await this.ref.update({ notify_message_ids: this.notify_message_ids })
	}

	public generateAssignmentId() {
		return this.ref.collection("assignments").doc().id
	}

	public getAssignment(id: string): Assignment | undefined {
		return this.getAssignments().filter(a => a.getId() === id)[0]
	}

	public getAssignments() {
		return this.assignments
	}

	/**
	 * @async Creates a new Assignment in the Guild Cache
	 * @param assignment Assignment to add to Firestore
	 */
	public async pushAssignment(assignment: Assignment) {
		this.assignments.push(assignment)
		await this.ref.collection("assignments").doc(assignment.getId()).set({
			id: assignment.getId(),
			name: assignment.getName(),
			subject: assignment.getSubject(),
			date: assignment.getDate(),
			details: assignment.getDetails()
		})
	}

	public async removeAssignment(id: string) {
		this.assignments = this.assignments.filter(a => a.getId() !== id)
		await this.ref.collection("assignments").doc(id).delete()
	}

	public getDraft() {
		return this.draft
	}

	public setDraft(draft: Draft) {
		this.draft = draft
	}

	public async removeDraft() {
		if (this.draft) {
			await this.draft.delete()
			this.draft = undefined
		}
	}

	public getColors() {
		return this.colors
	}

	public getSubjects() {
		return Object.keys(this.colors)
	}

	/**
	 * Filter all assignments in snapshot documents
	 * @param docs Snapshot documents
	 * @returns Assignments without the Draft object
	 */
	private docsToAssignments(
		docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
	) {
		const items: Assignment[] = []
		for (let i = 0, il = docs.length; i < il; i++) {
			const doc = docs[i]
			const { id, name, subject, date, details } = doc.data()
			if (doc.id === "draft") continue

			if (date < new Date().getTime()) {
				this.ref.collection("assignments").doc(doc.id).delete().then()
				continue
			}

			items.push(
				new Assignment(
					this.getAssignmentRef(id),
					id,
					name,
					subject,
					date,
					details
				)
			)
		}

		return items
	}

	/**
	 * Filter the Draft object in snapshot documents
	 * @param docs Snapshot documents
	 * @returns Draft object
	 */
	private docsToDraft(
		docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
	) {
		for (let i = 0, il = docs.length; i < il; i++) {
			const doc = docs[i]
			const { id, name, subject, date, details } = doc.data()
			if (doc.id === "draft")
				return new Draft(this, id, name, subject, date, details)
		}
	}
}
