import { Assignment, Draft, GuildCache } from "../all"

export const toAssignments = (
	docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
	getAssignmentRef: (
		id: string
	) => FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
) => {
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

export const toDraft = (
	docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
	this_: GuildCache
) => {
	for (let i = 0, il = docs.length; i < il; i++) {
		const doc = docs[i]
		const { id, name, subject, date, details } = doc.data()
		if (doc.id === "draft")
			return new Draft(this_, id, name, subject, date, details)
	}
}
