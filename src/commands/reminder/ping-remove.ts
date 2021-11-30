import admin from "firebase-admin"
import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember, Role } from "discord.js"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: "Remove a member to the list of members/roles to be pinged",
		params: [
			{
				name: "member-or-role",
				description: "The member or role to remove",
				requirements: "Valid Member or Role",
				required: true
			},
			{
				name: "reminder-id",
				description: "If this parameter is not given, edits the Draft instead",
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			}
		]
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("ping-remove")
		.setDescription("Remove a member/role to ping when the time comes")
		.addMentionableOption(option =>
			option.setName("member-or-role").setDescription("Member/Role to ping").setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription(
					"ID of the reminder to edit. If not provided, edits the draft instead"
				)
				.setRequired(false)
		),
	execute: async helper => {
		const reminderId = helper.string("reminder-id")
		const memberOrRole = helper.mentionable("member-or-role") as Role | GuildMember

		if (reminderId) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminderId
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			const id = memberOrRole.id
			if (memberOrRole instanceof Role) {
				if (!reminder.value.pings.roles.includes(id)) {
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Role not being pinged!"))
				}

				await helper.cache
					.getReminderDoc(reminderId)
					.set(
						{ pings: { roles: admin.firestore.FieldValue.arrayRemove(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Role removed from ping list"))
			}

			if (memberOrRole instanceof GuildMember) {
				if (!reminder.value.pings.members.includes(id)) {
					return helper.respond(
						new ResponseBuilder(Emoji.BAD, "Member not being pinged!")
					)
				}

				await helper.cache
					.getReminderDoc(reminderId)
					.set(
						{ pings: { members: admin.firestore.FieldValue.arrayRemove(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Member removed from ping list"))
			}
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			const id = memberOrRole.id
			if (memberOrRole instanceof Role) {
				if (!draft.value.pings.roles.includes(id)) {
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Role not being pinged!"))
				}

				draft.value.pings.roles = draft.value.pings.roles.filter(r => r !== id)
				await helper.cache
					.getDraftDoc()
					.set(
						{ pings: { roles: admin.firestore.FieldValue.arrayRemove(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Role removed from ping list"))
			}

			if (memberOrRole instanceof GuildMember) {
				if (!draft.value.pings.members.includes(id)) {
					return helper.respond(
						new ResponseBuilder(Emoji.BAD, "Member not being pinged!")
					)
				}

				draft.value.pings.members = draft.value.pings.members.filter(m => m !== id)
				await helper.cache
					.getDraftDoc()
					.set(
						{ pings: { members: admin.firestore.FieldValue.arrayRemove(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Member removed from ping list"))
			}
		}
	}
}

export default file
