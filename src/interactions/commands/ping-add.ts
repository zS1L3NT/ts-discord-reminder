import { GuildMember, Role } from "discord.js"
import admin from "firebase-admin"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import Entry from "../../data/Entry"
import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"

export default class extends BaseCommand<Entry, GuildCache> {
	override defer = true
	override ephemeral = true
	override data = {
		description: "Adds a member/role to the list of members/roles to be pinged",
		options: [
			{
				name: "member-or-role",
				description: "The member or role to add to the list of pinged members/roles",
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

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<Entry, GuildCache>) {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<Entry, GuildCache>) {
		const reminderId = helper.args().at(0)
		const mentions = helper.message!.mentions
		console.log(helper.args())
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
				if (reminder.pings.roles.includes(id)) {
					return helper.respond(ResponseBuilder.bad("Role already being pinged!"))
				}

				await helper.cache.getReminderDoc(reminderId).update({
					"pings.roles": admin.firestore.FieldValue.arrayUnion(id)
				})

				helper.respond(ResponseBuilder.good("Role added to ping list"))
				helper.cache.logger.log({
					member: helper.member,
					title: `Role added to ping list`,
					description: `<@${helper.member.id}> added <@&${id}> to the ping list of **Reminder ${reminderId}**`,
					command: "ping-add",
					color: "YELLOW"
				})
			}

			if (memberOrRole instanceof GuildMember) {
				if (reminder.pings.members.includes(id)) {
					return helper.respond(ResponseBuilder.bad("Member already being pinged!"))
				}

				await helper.cache.getReminderDoc(reminderId).update({
					"pings.members": admin.firestore.FieldValue.arrayUnion(id)
				})

				helper.respond(ResponseBuilder.good("Member added to ping list"))
				helper.cache.logger.log({
					member: helper.member,
					title: `Member added to ping list`,
					description: `<@${helper.member.id}> added <@${id}> to the ping list of **Reminder ${reminderId}**`,
					command: "ping-add",
					color: "YELLOW"
				})
			}
		} else {
			const draft = helper.cache.draft!

			if (memberOrRole instanceof Role) {
				if (draft.pings.roles.includes(id)) {
					return helper.respond(ResponseBuilder.bad("Role already being pinged!"))
				}

				draft.pings.roles.push(id)
				await helper.cache.getDraftDoc().update({
					"pings.roles": admin.firestore.FieldValue.arrayUnion(id)
				})

				helper.respond(ResponseBuilder.good("Role added to ping list"))
				helper.cache.logger.log({
					member: helper.member,
					title: `Role added to ping list`,
					description: `<@${helper.member.id}> added <@&${id}> to the ping list of the **Draft**`,
					command: "ping-add",
					color: "YELLOW"
				})
			}

			if (memberOrRole instanceof GuildMember) {
				if (draft.pings.members.includes(id)) {
					return helper.respond(ResponseBuilder.bad("Member already being pinged!"))
				}

				draft.pings.members.push(id)
				await helper.cache.getDraftDoc().update({
					"pings.members": admin.firestore.FieldValue.arrayUnion(id)
				})

				helper.respond(ResponseBuilder.good("Member added to ping list"))
				helper.cache.logger.log({
					member: helper.member,
					title: `Member added to ping list`,
					description: `<@${helper.member.id}> added <@${id}> to the ping list of the **Draft**`,
					command: "ping-add",
					color: "YELLOW"
				})
			}
		}
	}
}
