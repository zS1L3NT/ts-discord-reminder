import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { GuildMember, Role } from "discord.js"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

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
			return helper.respond(new EmbedResponse(
				Emoji.BAD,
				"No draft to edit"
			))
		}

		const member_or_role = helper.mentionable("member-or-role") as Role | GuildMember
		const id = member_or_role.id
		if (member_or_role instanceof Role) {
			if (!draft.value.pings.roles.includes(id)) {
				return helper.respond(new EmbedResponse(
					Emoji.BAD,
					"Role not being pinged!"
				))
			}

			draft.value.pings.roles = draft.value.pings.roles.filter(r => r !== id)
			await helper.cache
				.getDraftDoc()
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
			if (!draft.value.pings.members.includes(id)) {
				return helper.respond(new EmbedResponse(
					Emoji.BAD,
					"Member not being pinged!"
				))
			}

			draft.value.pings.members = draft.value.pings.members.filter(m => m !== id)
			await helper.cache
				.getDraftDoc()
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