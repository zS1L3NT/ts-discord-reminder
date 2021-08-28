import { Draft, Reminder } from "../models/Reminder"
import GuildCache from "../models/GuildCache"

export default class DocumentConverter {
	public static toReminders(
		docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
		getReminderRef: (
			id: string
		) => FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	) {
		const items: Reminder[] = []
		for (const doc of docs) {
			const { id, name, subject, date, details } = doc.data()
			if (doc.id === "draft") continue

			items.push(
				new Reminder(
					getReminderRef(id),
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
		cache: GuildCache
	) {
		for (const doc of docs) {
			const { id, name, subject, date, details } = doc.data()
			if (doc.id === "draft")
				return new Draft(cache, id, name, subject, date, details)
		}
	}
}
