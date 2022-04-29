import { GuildMember, Role } from "discord.js"
import admin from "firebase-admin"
import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"

const file: iSlashSubFile<Entry, GuildCache> = {
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
			const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			const id = memberOrRole.id
			if (memberOrRole instanceof Role) {
				if (!reminder.pings.roles.includes(id)) {
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Role not being pinged!"))
				}

				await helper.cache
					.getReminderDoc(reminderId)
					.update({ "pings.roles": admin.firestore.FieldValue.arrayRemove(id) })

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Role removed from ping list"))
			}

			if (memberOrRole instanceof GuildMember) {
				if (!reminder.pings.members.includes(id)) {
					return helper.respond(
						new ResponseBuilder(Emoji.BAD, "Member not being pinged!")
					)
				}

				await helper.cache
					.getReminderDoc(reminderId)
					.update({ "pings.members": admin.firestore.FieldValue.arrayRemove(id) })

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Member removed from ping list"))
			}
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			const id = memberOrRole.id
			if (memberOrRole instanceof Role) {
				if (!draft.pings.roles.includes(id)) {
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Role not being pinged!"))
				}

				draft.pings.roles = draft.pings.roles.filter(r => r !== id)
				await helper.cache
					.getDraftDoc()
					.update({ "pings.roles": admin.firestore.FieldValue.arrayRemove(id) })

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Role removed from ping list"))
			}

			if (memberOrRole instanceof GuildMember) {
				if (!draft.pings.members.includes(id)) {
					return helper.respond(
						new ResponseBuilder(Emoji.BAD, "Member not being pinged!")
					)
				}

				draft.pings.members = draft.pings.members.filter(m => m !== id)
				await helper.cache
					.getDraftDoc()
					.update({ "pings.members": admin.firestore.FieldValue.arrayRemove(id) })

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Member removed from ping list"))
			}
		}
	}
}

export default file
