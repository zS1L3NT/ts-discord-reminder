import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { GuildMember, Role } from "discord.js"
import admin from "firebase-admin"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("ping-remove")
		.setDescription("Remove a member/role to ping when the time comes")
		.addMentionableOption(option =>
			option
				.setName("member-or-role")
				.setDescription("Member/Role to ping")
				.setRequired(true)
		),
	execute: async helper => {
		const draft = helper.cache.draft
		if (!draft) {
			return helper.respond("❌ No draft to edit")
		}

		const member_or_role = helper.mentionable("member-or-role") as Role | GuildMember
		const id = member_or_role.id
		if (member_or_role instanceof Role) {
			if (!draft.value.pings.roles.includes(id)) {
				return helper.respond("❌ Role not being pinged!")
			}

			draft.value.pings.roles = draft.value.pings.roles.filter(r => r !== id)
			await helper.cache
				.getDraftDoc()
				.set({
					pings: {
						roles: admin.firestore.FieldValue.arrayRemove(id)
					}
				}, { merge: true })

			helper.respond("✅ Role removed from ping list")
		}

		if (member_or_role instanceof GuildMember) {
			if (!draft.value.pings.members.includes(id)) {
				return helper.respond("❌ Member not being pinged!")
			}

			draft.value.pings.members = draft.value.pings.members.filter(m => m !== id)
			await helper.cache
				.getDraftDoc()
				.set({
					pings: {
						members: admin.firestore.FieldValue.arrayRemove(id)
					}
				}, { merge: true })

			helper.respond("✅ Member removed from ping list")
		}
	}
} as iInteractionSubcommandFile