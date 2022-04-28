import admin from "firebase-admin"
import Entry from "../../../data/Entry"
import GuildCache from "../../../data/GuildCache"
import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "post",
		description: {
			slash: "Upload the existing draft to a Reminder",
			help: "Convert a draft into an actual Reminder, then clears the draft"
		}
	},
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to post"))
		}

		if (draft.value.due_date < Date.now()) {
			return helper.respond(
				new ResponseBuilder(
					Emoji.BAD,
					"Existing draft due date is invalid, please set it again"
				)
			)
		}

		if (draft.value.title === "") {
			return helper.respond(new ResponseBuilder(Emoji.BAD, "Existing draft has no title"))
		}

		const doc = helper.cache.getReminderDoc()
		draft.value.id = doc.id
		await helper.cache.ref.set(
			{
				// @ts-ignore
				reminder_message_ids: admin.firestore.FieldValue.arrayUnion("")
			},
			{ merge: true }
		)
		await doc.set(draft.value)
		delete helper.cache.draft
		await helper.cache.getDraftDoc().delete()

		helper.respond(new ResponseBuilder(Emoji.GOOD, "Posted draft to Reminder"))
	}
}

export default file
