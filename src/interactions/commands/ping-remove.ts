import { GuildMember, Role } from "discord.js"
import admin from "firebase-admin"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import HasDraftMiddleware from "../../middleware/HasDraftMiddleware"
import IsReminderIdValidMiddleware from "../../middleware/IsReminderIdValidMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Removes a member/role to the list of members/roles to be pinged",
		options: [
			{
				name: "member-or-role",
				description: "The member or role to remove from the list of pinged members/roles",
				type: "mentionable" as const,
				requirements: "Valid Member or Role",
				required: true
			},
			{
				name: "reminder-id",
				description: "This is the ID of the Reminder to edit",
				type: "string" as const,
				requirements: "Valid Reminder ID",
				required: false,
				default: "Draft ID"
			}
		]
	}

	override middleware = [new IsReminderIdValidMiddleware(), new HasDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand("ping-remove", "more")
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.input().at(0)
		const mentions = helper.message!.mentions
		console.log(helper.input())
		return {
			"reminder-id": reminderId?.match(/^[A-Za-z0-9]{20}$/) ? reminderId : null,
			"mention-or-role": mentions.members?.at(0) || mentions.roles?.at(0) || null
		}
	}

	override async execute(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const memberOrRole = helper.mentionable("member-or-role") as Role | GuildMember | null

		if (!memberOrRole) {
			return helper.respond(ResponseBuilder.bad("No member or role was provided"))
		}

		const id = memberOrRole.id
		if (reminderId) {
			const reminder = helper.cache.reminders.find(reminder => reminder.id === reminderId)!

			if (memberOrRole instanceof Role) {
				if (!reminder.pings.roles.includes(id)) {
					return helper.respond(ResponseBuilder.bad("Role not being pinged!"))
				}

				await helper.cache
					.getReminderDoc(reminderId)
					.update({ "pings.roles": admin.firestore.FieldValue.arrayRemove(id) })

				helper.respond(ResponseBuilder.good("Role removed from ping list"))
			}

			if (memberOrRole instanceof GuildMember) {
				if (!reminder.pings.members.includes(id)) {
					return helper.respond(ResponseBuilder.bad("Member not being pinged!"))
				}

				await helper.cache
					.getReminderDoc(reminderId)
					.update({ "pings.members": admin.firestore.FieldValue.arrayRemove(id) })

				helper.respond(ResponseBuilder.good("Member removed from ping list"))
			}
		} else {
			const draft = helper.cache.draft!

			if (memberOrRole instanceof Role) {
				if (!draft.pings.roles.includes(id)) {
					return helper.respond(ResponseBuilder.bad("Role not being pinged!"))
				}

				draft.pings.roles = draft.pings.roles.filter(r => r !== id)
				await helper.cache
					.getDraftDoc()
					.update({ "pings.roles": admin.firestore.FieldValue.arrayRemove(id) })

				helper.respond(ResponseBuilder.good("Role removed from ping list"))
			}

			if (memberOrRole instanceof GuildMember) {
				if (!draft.pings.members.includes(id)) {
					return helper.respond(ResponseBuilder.bad("Member not being pinged!"))
				}

				draft.pings.members = draft.pings.members.filter(m => m !== id)
				await helper.cache
					.getDraftDoc()
					.update({ "pings.members": admin.firestore.FieldValue.arrayRemove(id) })

				helper.respond(ResponseBuilder.good("Member removed from ping list"))
			}
		}
	}
}
