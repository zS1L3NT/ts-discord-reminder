import admin from "firebase-admin"
import { iInteractionSubcommandFile } from "../../utilities/BotSetupHelper"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { GuildMember, Role } from "discord.js"
import EmbedResponse, { Emoji } from "../../utilities/EmbedResponse"

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName("ping-add")
		.setDescription("Add a member/role to ping when the time comes")
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
			if (draft.value.pings.roles.includes(id)) {
				return helper.respond(new EmbedResponse(
					Emoji.BAD,
					"Role already being pinged!"
				))
			}

			draft.value.pings.roles.push(id)
			await helper.cache
				.getDraftDoc()
				.set({
					pings: {
						roles: admin.firestore.FieldValue.arrayUnion(id)
					}
				}, { merge: true })

			helper.respond(new EmbedResponse(
				Emoji.GOOD,
				"Role added to ping list"
			))
		}

		if (member_or_role instanceof GuildMember) {
			if (draft.value.pings.members.includes(id)) {
				return helper.respond(new EmbedResponse(
					Emoji.BAD,
					"Member already being pinged!"
				))
			}

			draft.value.pings.members.push(id)
			await helper.cache
				.getDraftDoc()
				.set({
					pings: {
						members: admin.firestore.FieldValue.arrayUnion(id)
					}
				}, { merge: true })

			helper.respond(new EmbedResponse(
				Emoji.GOOD,
				"Member added to ping list"
			))
		}
	}
} as iInteractionSubcommandFile