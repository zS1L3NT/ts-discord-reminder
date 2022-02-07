import Reminder, { iReminder } from "../data/Reminder"

export default class FirestoreParser {
	private docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]

	public constructor(
		docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
	) {
		this.docs = docs
	}

	public getReminders(): Reminder[] {
		return this.docs
			.filter(doc => doc.id !== "draft")
			.map(doc => new Reminder(doc.data() as iReminder))
	}

	public getDraft(): Reminder | undefined {
		const data = this.docs.find(doc => doc.id === "draft")
		if (data) {
			return new Reminder(data.data() as iReminder)
		}
		return undefined
	}
}
