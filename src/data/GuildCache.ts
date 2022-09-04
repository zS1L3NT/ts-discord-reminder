import equal from "deep-equal"
import { Colors, TextChannel } from "discord.js"
import { useTryAsync } from "no-try"
import { BaseGuildCache, ChannelCleaner, DateHelper } from "nova-bot"

import { Entry } from "@prisma/client"

import logger from "../logger"
import prisma from "../prisma"
import ReminderFull from "./ReminderFull"

export default class GuildCache extends BaseGuildCache<typeof prisma, Entry, GuildCache> {
	reminders: ReminderFull[] = []
	draft: ReminderFull | undefined

	override async refresh() {
		this.entry = await this.prisma.entry.findFirstOrThrow({
			where: {
				guild_id: this.guild.id
			}
		})
		const reminders = await this.prisma.reminder.findMany({
			where: {
				guild_id: this.guild.id
			}
		})
		const pings = await this.prisma.ping.findMany({
			where: {
				guild_id: this.guild.id
			}
		})
		this.draft = reminders
			.filter(r => r.id === "draft")
			?.map(
				draft =>
					new ReminderFull(
						draft.guild_id,
						draft.id,
						draft.title,
						draft.description,
						draft.due_date,
						draft.priority,
						pings.filter(ping => ping.reminder_id === "draft")
					)
			)[0]
		this.reminders = reminders
			.filter(r => r.id !== "draft")
			.map(
				reminder =>
					new ReminderFull(
						reminder.guild_id,
						reminder.id,
						reminder.title,
						reminder.description,
						reminder.due_date,
						reminder.priority,
						pings.filter(ping => ping.reminder_id === reminder.id)
					)
			)
	}

	override async updateMinutely() {
		if (!this.entry.reminders_channel_id) return

		// Remove expired reminders
		for (const reminder of this.reminders) {
			if (reminder.due_date.getTime() < Date.now()) {
				this.reminders = this.reminders.filter(r => r.id !== reminder.id)
				await this.prisma.reminder.delete({
					where: { id_guild_id: { id: reminder.id, guild_id: this.guild.id } }
				})
				await this.prisma.ping.deleteMany({
					where: { reminder_id: reminder.id, guild_id: this.guild.id }
				})
				await this.update({
					reminder_message_ids: this.entry.reminder_message_ids.slice(1)
				})
				this.logger.log({
					title: `Reminder due date past`,
					description: `Deleting Reminder ${reminder.id} since it's due date is past.`,
					color: Colors.Blue,
					embeds: [reminder.toEmbedBuilder(this.guild).setColor("#000000")]
				})
			}
		}

		const embeds = this.reminders
			.sort((a, b) => b.due_date.getTime() - a.due_date.getTime())
			.map(reminder => reminder.toEmbedBuilder(this.guild))
		const requiredMessages = Math.ceil(embeds.length / 10)
		let reminder_message_ids = [...this.entry.reminder_message_ids]

		if (reminder_message_ids.length > requiredMessages) {
			const diff = reminder_message_ids.length - requiredMessages
			reminder_message_ids = reminder_message_ids.slice(diff)
			await this.update({ reminder_message_ids })
		}

		if (reminder_message_ids.length < requiredMessages) {
			const diff = requiredMessages - reminder_message_ids.length
			reminder_message_ids = [...reminder_message_ids, ...Array(diff).fill("")]
			await this.update({ reminder_message_ids })
		}

		const [err, messages] = await useTryAsync(async () => {
			const cleaner = new ChannelCleaner<typeof prisma, Entry, GuildCache>(
				this,
				this.entry.reminders_channel_id!,
				reminder_message_ids
			)
			await cleaner.clean()

			if (!equal(reminder_message_ids, this.entry.reminder_message_ids)) {
				reminder_message_ids = []
				await this.update({ reminder_message_ids })
			}

			return cleaner.getMessages()
		})

		if (err) {
			if (err.message === "no-channel") {
				logger.warn(
					`Guild(${this.guild.name}) has no Channel(${this.entry.reminders_channel_id})`
				)
				await this.update({ reminders_channel_id: "" })
				return
			}
			if (err.name === "HTTPError") {
				logger.warn(`Failed to clean channel:`, err)
				return
			}
			throw err
		}

		for (let i = 0; i < Math.ceil(embeds.length / 10); i++) {
			const messageId = reminder_message_ids[i]!
			const message = messages.get(messageId)
			message?.edit({ embeds: embeds.slice(i * 10, (i + 1) * 10) })
		}
	}

	override getEmptyEntry(): Entry {
		return {
			guild_id: "",
			prefix: null,
			log_channel_id: null,
			ping_channel_id: null,
			reminders_channel_id: null,
			reminder_message_ids: []
		}
	}

	async updatePingChannel(reminder: ReminderFull) {
		const channel = this.guild.channels.cache.get(this.entry.ping_channel_id ?? "")
		if (channel instanceof TextChannel) {
			channel.send({
				content: `${reminder.getPingString(this.guild)}\n${
					reminder.title
				} is due in ${new DateHelper(reminder.due_date.getTime()).getTimeLeft()}!`,
				embeds: [reminder.toEmbedBuilder(this.guild)]
			})
		}
	}
}
