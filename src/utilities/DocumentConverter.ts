import Assignment from "../models/Assignment"
import GuildCache from "../models/GuildCache"
import Draft from "../models/Draft"

export default class DocumentConverter {
	public static toAssignments(
		docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
		getAssignmentRef: (
			id: string
		) => FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	) {
		const items: Assignment[] = []
		for (let i = 0, il = docs.length; i < il; i++) {
			const doc = docs[i]
			const { id, name, subject, date, details } = doc.data()
			if (doc.id === "draft") continue

			items.push(
				new Assignment(
					getAssignmentRef(id),
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

	public static toDraft(
		docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
		this_: GuildCache
	) {
		for (let i = 0, il = docs.length; i < il; i++) {
			const doc = docs[i]
			const { id, name, subject, date, details } = doc.data()
			if (doc.id === "draft")
				return new Draft(this_, id, name, subject, date, details)
		}
	}
}
