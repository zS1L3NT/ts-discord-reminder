import admin from "firebase-admin"
import Entry from "../../models/Entry"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember, Role } from "discord.js"

const file: iInteractionSubcommandFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "ping-remove",
		description: {
			slash: "Remove a member/role to ping when the time comes",
			help: "Remove a member to the list of members/roles to be pinged"
		},
		options: [
			{
				name: "member-or-role",
				description: {
					slash: "Member/Role to ping",
					help: "The member or role to remove from the list of pinged members/roles"
				},
				type: "mentionable",
				requirements: "Valid Member or Role",
				required: true
			},
			{
				name: "reminder-id",
				description: {
					slash: "ID of the Reminder",
					help: [
						"This is the ID of the Reminder to edit",
						"Each Reminder ID can be found in the Reminder itself in the Reminders channel"
					].join("\n")
				},
				type: "string",
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			}
		]
	},
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
