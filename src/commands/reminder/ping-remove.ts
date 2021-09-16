import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { GuildMember, Role } from "discord.js"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("ping-remove")
		.setDescription("Remove a member/role to ping when the time comes")
		.addStringOption(option =>
			option
				.setName("reminder-id")
				.setDescription("ID of the reminder to edit. Can be found in every reminder")
				.setRequired(true)
		)
		.addMentionableOption(option =>
			option
				.setName("member-or-role")
				.setDescription("Member/Role to ping")
				.setRequired(true)
		),
	execute: async helper => {
		const reminder_id = helper.string("reminder-id", true)!
		const reminder = helper.cache.reminders.find(reminder => reminder.value.id === reminder_id)
		if (!reminder) {
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"Reminder doesn't exist"
			))
		}

		const member_or_role = helper.mentionable("member-or-role") as Role | GuildMember
		const id = member_or_role.id
		if (member_or_role instanceof Role) {
			if (!reminder.value.pings.roles.includes(id)) {
				return helper.respond(new EmbedResponse(
					Emoji.BAD,
					"Role not being pinged!"
				))
			}

			await helper.cache
				.getReminderDoc(reminder_id)
				.set({
					pings: {
						roles: admin.firestore.FieldValue.arrayRemove(id)
					}
				}, { merge: true })

			helper.respond(new EmbedResponse(
				Emoji.GOOD,
				"Role removed from ping list"
			))
		}

		if (member_or_role instanceof GuildMember) {
			if (!reminder.value.pings.members.includes(id)) {
				return helper.respond(new EmbedResponse(
					Emoji.BAD,
					"Member not being pinged!"
				))
			}

			await helper.cache
				.getReminderDoc(reminder_id)
				.set({
					pings: {
						members: admin.firestore.FieldValue.arrayRemove(id)
					}
				}, { merge: true })

			helper.respond(new EmbedResponse(
				Emoji.GOOD,
				"Member removed from ping list"
			))
		}
	}
} as iInteractionSubcommandFile