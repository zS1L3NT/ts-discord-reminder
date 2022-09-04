import { Colors, GuildMember, Role } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry, PingType } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
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

	override middleware = [new ReminderOrDraftMiddleware()]

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const reminderId = helper.args().at(0)
		const mentions = helper.message!.mentions
		console.log(helper.args())
		return {
			"reminder-id": reminderId?.match(/^[A-Za-z0-9]{20}$/) ? reminderId : null,
			"mention-or-role": mentions.members?.at(0) || mentions.roles?.at(0) || null
		}
	}

	override async execute(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const reminderId = helper.string("reminder-id")
		const memberOrRole = helper.mentionable("member-or-role") as Role | GuildMember | null

		if (!memberOrRole) {
			return helper.respond(ResponseBuilder.bad("No member or role was provided"))
		}

		const id = memberOrRole.id
		const pingType = memberOrRole instanceof Role ? PingType.Role : PingType.Member
		if (reminderId) {
			const reminder = helper.cache.reminders.find(r => r.id === reminderId)!
			const index = reminder.pings.findIndex(
				p => p.type === pingType && p.reference_id === id
			)
			if (index === -1) {
				return helper.respond(ResponseBuilder.bad(`${pingType} not being pinged!`))
			}

			reminder.pings.splice(index, 1)
			await helper.cache.prisma.ping.delete({
				where: {
					guild_id_reminder_id_reference_id_type: {
						guild_id: helper.cache.guild.id,
						reminder_id: reminderId,
						reference_id: id,
						type: pingType
					}
				}
			})

			helper.respond(ResponseBuilder.good(`${pingType} removed from ping list`))
			helper.cache.logger.log({
				member: helper.member,
				title: `${pingType} removed from ping list`,
				description: `<@${helper.member.id}> removed <@${
					pingType === "Role" ? "&" : ""
				}${id}> from the ping list of **Reminder ${reminderId}**`,
				command: "ping-remove",
				color: Colors.Yellow
			})
		} else {
			const draft = helper.cache.draft!
			const index = draft.pings.findIndex(
				p => p.type === PingType.Role && p.reference_id === id
			)
			if (index === -1) {
				return helper.respond(ResponseBuilder.bad(`${pingType} not being pinged!`))
			}

			draft.pings.splice(index, 1)
			await helper.cache.prisma.ping.delete({
				where: {
					guild_id_reminder_id_reference_id_type: {
						guild_id: helper.cache.guild.id,
						reminder_id: "draft",
						reference_id: id,
						type: pingType
					}
				}
			})

			helper.respond(ResponseBuilder.good(`${pingType} removed from ping list`))
			helper.cache.logger.log({
				member: helper.member,
				title: `${pingType} removed from ping list`,
				description: `<@${helper.member.id}> removed <@${
					pingType === "Role" ? "&" : ""
				}${id}> from the ping list of the **Draft**`,
				command: "ping-remove",
				color: Colors.Yellow
			})
		}
	}
}
