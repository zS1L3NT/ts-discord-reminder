import { BaseBotCache } from "nova-bot"

import { Entry } from "@prisma/client"

import prisma from "../prisma"
import GuildCache from "./GuildCache"

export default class BotCache extends BaseBotCache<typeof prisma, Entry, GuildCache> {
	override async registerGuildCache(guildId: string): Promise<void> {
		await this.prisma.entry.create({
			data: {
				guild_id: guildId,
				prefix: null,
				log_channel_id: null,
				ping_channel_id: null,
				reminders_channel_id: null,
				reminder_message_ids: []
			}
		})
	}

	override async eraseGuildCache(guildId: string): Promise<void> {
		await this.prisma.entry.delete({ where: { guild_id: guildId } })
		await this.prisma.alias.deleteMany({ where: { guild_id: guildId } })
		await this.prisma.reminder.deleteMany({ where: { guild_id: guildId } })
		await this.prisma.ping.deleteMany({ where: { guild_id: guildId } })
	}
}
