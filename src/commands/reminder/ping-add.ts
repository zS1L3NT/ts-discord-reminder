import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { GuildMember, Role } from "discord.js"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("ping-add")
		.setDescription("Add a member/role to ping when the time comes")
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
			return helper.respond("❌ Reminder doesn't exist")
		}

		const member_or_role = helper.mentionable("member-or-role") as Role | GuildMember
		const id = member_or_role.id
		if (member_or_role instanceof Role) {
			if (reminder.value.pings.roles.includes(id)) {
				return helper.respond("❌ Role already being pinged!")
			}

			await helper.cache
				.getReminderDoc(reminder_id)
				.set({
					pings: {
						roles: admin.firestore.FieldValue.arrayUnion(id)
					}
				}, { merge: true })

			helper.respond("✅ Role added to ping list")
		}

		if (member_or_role instanceof GuildMember) {
			if (reminder.value.pings.roles.includes(id)) {
				return helper.respond("❌ Member already being pinged!")
			}

			await helper.cache
				.getReminderDoc(reminder_id)
				.set({
					pings: {
						members: admin.firestore.FieldValue.arrayUnion(id)
					}
				}, { merge: true })

			helper.respond("✅ Member added to ping list")
		}
	}
} as iInteractionSubcommandFile