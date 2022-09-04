import { Colors, MessageType } from "discord.js"
import { BaseModal, ModalHelper, ResponseBuilder } from "nova-bot"

import { Entry } from "@prisma/client"

import GuildCache from "../../data/GuildCache"
import logger from "../../logger"
import prisma from "../../prisma"

export default class extends BaseModal<typeof prisma, Entry, GuildCache> {
	override defer = false
	override ephemeral = false

	override middleware = []

	override async execute(helper: ModalHelper<typeof prisma, Entry, GuildCache>) {
		const description = helper.text("description")!

		const footerText = helper.message!.embeds[0]!.footer!.text!

		let oldDescription: string
		if (footerText === "Draft") {
			oldDescription = helper.cache.draft!.description
			helper.cache.draft!.description = description
			await helper.cache.prisma.reminder.update({
				where: {
					id_guild_id: {
						id: "draft",
						guild_id: helper.cache.guild.id
					}
				},
				data: {
					description
				}
			})
		} else {
			const reminderId = footerText.slice(4)
			oldDescription = helper.cache.reminders.find(r => r.id === reminderId)!.description
			await helper.cache.prisma.reminder.update({
				where: {
					id_guild_id: {
						id: reminderId,
						guild_id: helper.cache.guild.id
					}
				},
				data: {
					description
				}
			})
		}

		await helper.update({
			embeds: [
				ResponseBuilder.good(
					`${footerText === "Draft" ? "Draft" : "Reminder"} description updated`
				).build()
			]
		})
		helper.cache.logger.log({
			member: helper.member,
			title: `Description Changed`,
			description: [
				`<@${helper.member.id}> changed the description of a Reminder`,
				`**Reminder ID**: ${footerText === "Draft" ? footerText : footerText.slice(4)}`,
				`**Old Description**:`,
				`${oldDescription}`,
				`**New Description**:`,
				`${description}`
			].join("\n"),
			command: "description",
			color: Colors.Yellow
		})

		if (helper.message!.type !== MessageType.ChatInputCommand) {
			setTimeout(
				() =>
					helper
						.message!.delete()
						.catch(err => logger.log("Failed to delete message", err)),
				5000
			)
		}
	}
}
