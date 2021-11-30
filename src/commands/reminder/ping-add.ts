import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { GuildMember, Role } from "discord.js"
import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import ResponseBuilder, { Emoji } from "../../utilities/ResponseBuilder"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("ping-add")
		.setDescription("Add a member/role to ping when the time comes")
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
				if (reminder.value.pings.roles.includes(id)) {
					return helper.respond(
						new ResponseBuilder(Emoji.BAD, "Role already being pinged!")
					)
				}

				await helper.cache
					.getReminderDoc(reminder_id)
					.set(
						{ pings: { roles: admin.firestore.FieldValue.arrayUnion(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Role added to ping list"))
			}

			if (member_or_role instanceof GuildMember) {
				if (reminder.value.pings.members.includes(id)) {
					return helper.respond(
						new ResponseBuilder(Emoji.BAD, "Member already being pinged!")
					)
				}

				await helper.cache
					.getReminderDoc(reminder_id)
					.set(
						{ pings: { members: admin.firestore.FieldValue.arrayUnion(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Member added to ping list"))
			}
		} else {
			const draft = helper.cache.draft
			if (!draft) {
				return helper.respond(new ResponseBuilder(Emoji.BAD, "No draft to edit"))
			}

			const id = member_or_role.id
			if (member_or_role instanceof Role) {
				if (draft.value.pings.roles.includes(id)) {
					return helper.respond(
						new ResponseBuilder(Emoji.BAD, "Role already being pinged!")
					)
				}

				draft.value.pings.roles.push(id)
				await helper.cache
					.getDraftDoc()
					.set(
						{ pings: { roles: admin.firestore.FieldValue.arrayUnion(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Role added to ping list"))
			}

			if (member_or_role instanceof GuildMember) {
				if (draft.value.pings.members.includes(id)) {
					return helper.respond(
						new ResponseBuilder(Emoji.BAD, "Member already being pinged!")
					)
				}

				draft.value.pings.members.push(id)
				await helper.cache
					.getDraftDoc()
					.set(
						{ pings: { members: admin.firestore.FieldValue.arrayUnion(id) } },
						{ merge: true }
					)

				helper.respond(new ResponseBuilder(Emoji.GOOD, "Member added to ping list"))
			}
		}
	}
} as iInteractionSubcommandFile
