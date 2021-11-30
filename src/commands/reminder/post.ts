import admin from "firebase-admin"
import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Convert a draft into an actual reminder, then clears the draft",
		params: []
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("post")
		.setDescription("Upload the existing draft to a reminder"),
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
				reminders_message_ids: admin.firestore.FieldValue.arrayUnion("")
			},
			{ merge: true }
		)
		await doc.set(draft.value)
		delete helper.cache.draft
		await helper.cache.getDraftDoc().delete()

		helper.respond(new ResponseBuilder(Emoji.GOOD, "Posted draft to reminder"))
	}
}

export default file
