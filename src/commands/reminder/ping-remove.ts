import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { GuildMember, Role } from "discord.js"
import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import ResponseBuilder, { Emoji } from "../../utilities/ResponseBuilder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
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
		const reminder_id = helper.string("reminder-id")
		const member_or_role = helper.mentionable("member-or-role") as Role | GuildMember

		if (reminder_id) {
			const reminder = helper.cache.reminders.find(
				reminder => reminder.value.id === reminder_id
			)
			if (!reminder) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "Reminder doesn't exist"))
			}

			const id = member_or_role.id
			if (member_or_role instanceof Role) {
				if (!reminder.value.pings.roles.includes(id)) {
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Role not being pinged!"))
				}

				await helper.cache
					.getReminderDoc(reminder_id)
					.set(
						{ pings: { roles: admin.firestore.FieldValue.arrayRemove(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Role removed from ping list"))
			}

			if (member_or_role instanceof GuildMember) {
				if (!reminder.value.pings.members.includes(id)) {
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Member not being pinged!"))
				}

				await helper.cache
					.getReminderDoc(reminder_id)
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

			const id = member_or_role.id
			if (member_or_role instanceof Role) {
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

			if (member_or_role instanceof GuildMember) {
				if (!draft.value.pings.members.includes(id)) {
					return helper.respond(new ResponseBuilder(Emoji.BAD, "Member not being pinged!"))
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
} as iInteractionSubcommandFile
