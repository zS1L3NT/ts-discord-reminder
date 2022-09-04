import { Colors, GuildMember, Role } from "discord.js"
import { BaseCommand, CommandHelper, ResponseBuilder } from "nova-bot"

import { Entry, Ping, PingType } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import ReminderOrDraftMiddleware from "../../middleware/ReminderOrDraftMiddleware"
import prisma from "../../prisma"

export default class extends BaseCommand<typeof prisma, Entry, GuildCache> {
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

	override condition(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		return helper.isMessageCommand(true)
	}

	override converter(helper: CommandHelper<typeof prisma, Entry, GuildCache>) {
		const reminderId = helper.args().at(0)
		const mentions = helper.message!.mentions
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
			if (reminder.pings.find(p => p.type === pingType && p.reference_id === id)) {
				return helper.respond(ResponseBuilder.bad(`${pingType} already being pinged!`))
			}

			const ping: Ping = {
				guild_id: helper.cache.guild.id,
				reminder_id: reminderId,
				reference_id: id,
				type: pingType
			}
			helper.cache.reminders.find(r => r.id === reminderId)?.pings.push(ping)
			await helper.cache.prisma.ping.create({ data: ping })

			helper.respond(ResponseBuilder.good(`${pingType} added to ping list`))
			helper.cache.logger.log({
				member: helper.member,
				title: `${pingType} added to ping list`,
				description: `<@${helper.member.id}> added <@${
					pingType === PingType.Role ? "&" : ""
				}${id}> to the ping list of **Reminder ${reminderId}**`,
				command: "ping-add",
				color: Colors.Yellow
			})
		} else {
			const draft = helper.cache.draft!
			if (draft.pings.find(p => p.type === pingType && p.reference_id === id)) {
				return helper.respond(ResponseBuilder.bad(`${pingType} already being pinged!`))
			}

			const ping: Ping = {
				guild_id: helper.cache.guild.id,
				reminder_id: "draft",
				reference_id: id,
				type: pingType
			}
			draft.pings.push(ping)
			await helper.cache.prisma.ping.create({ data: ping })

			helper.respond(ResponseBuilder.good(`${pingType} added to ping list`))
			helper.cache.logger.log({
				member: helper.member,
				title: `${pingType} added to ping list`,
				description: `<@${helper.member.id}> added <@${
					pingType === PingType.Role ? "&" : ""
				}${id}> to the ping list of the **Draft**`,
				command: "ping-add",
				color: Colors.Yellow
			})
		}
	}
}
