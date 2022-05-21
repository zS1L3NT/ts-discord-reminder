import equal from "deep-equal"
import { TextChannel } from "discord.js"
import { useTryAsync } from "no-try"
import { BaseGuildCache, ChannelCleaner, DateHelper } from "nova-bot"

import logger from "../logger"
import Entry from "./Entry"
import Reminder, { ReminderConverter } from "./Reminder"

export default class GuildCache extends BaseGuildCache<Entry, GuildCache> {
	reminders: Reminder[] = []
	draft: Reminder | undefined

	override resolve(resolve: (cache: GuildCache) => void): void {
		this.ref.onSnapshot(snap => {
			if (snap.exists) {
				this.entry = snap.data()!
				resolve(this)
			}
		})
		this.ref
			.collection("reminders")
			.withConverter(new ReminderConverter())
			.onSnapshot(snaps => {
				const data = snaps.docs.map(doc => doc.data())
				this.reminders = data.filter(doc => doc.id !== "draft")
				this.draft = data.find(doc => doc.id === "draft")
			})
	}

	/**
	 * Method run every minute
	 */
	override async updateMinutely() {
		await this.updateRemindersChannel()
	}

	async updateRemindersChannel() {
		const remindersChannelId = this.getRemindersChannelId()
		if (!remindersChannelId) return

		// Remove expired reminders
		for (const reminder of this.reminders) {
			if (reminder.due_date < Date.now()) {
				this.reminders = this.reminders.filter(rem => rem.id !== reminder.id)
				await this.getReminderDoc(reminder.id).delete()
				await this.setReminderMessageIds(this.getReminderMessageIds().slice(1))
			}
		}

		const embeds = this.reminders
			.sort((a, b) => b.due_date - a.due_date)
			.map(reminder => reminder.toMessageEmbed(this.guild))
		const requiredMessages = Math.ceil(embeds.length / 10)
		let reminderMessageIds = this.getReminderMessageIds()

		if (reminderMessageIds.length > requiredMessages) {
			const diff = reminderMessageIds.length - requiredMessages
			await this.setReminderMessageIds(reminderMessageIds.slice(diff))
			reminderMessageIds = this.getReminderMessageIds()
		}

		if (reminderMessageIds.length < requiredMessages) {
			const diff = requiredMessages - reminderMessageIds.length
			await this.setReminderMessageIds([...reminderMessageIds, ...Array(diff).fill("")])
			reminderMessageIds = this.getReminderMessageIds()
		}

		const [err, messages] = await useTryAsync(async () => {
			const cleaner = new ChannelCleaner<Entry, GuildCache>(
				this,
				remindersChannelId,
				reminderMessageIds
			)
			await cleaner.clean()

			if (!equal(reminderMessageIds, this.getReminderMessageIds())) {
				await this.setReminderMessageIds(reminderMessageIds)
				reminderMessageIds = this.getReminderMessageIds()
			}

			return cleaner.getMessages()
		})

		if (err) {
			if (err.message === "no-channel") {
				logger.warn(`Guild(${this.guild.name}) has no Channel(${remindersChannelId})`)
				await this.setRemindersChannelId("")
				return
			}
			if (err.name === "HTTPError") {
				logger.warn(`Failed to clean channel:`, err)
				return
			}
			throw err
		}

		for (let i = 0; i < Math.ceil(embeds.length / 10); i++) {
			const messageId = reminderMessageIds[i]!
			const message = messages.get(messageId)
			message?.edit({ embeds: embeds.slice(i * 10, (i + 1) * 10) })
		}
	}

	async updatePingChannel(reminder: Reminder) {
		const pingChannelId = this.getPingChannelId()

		const channel = this.guild.channels.cache.get(pingChannelId)
		if (channel instanceof TextChannel) {
			channel.send({
				content: `${reminder.getPingString(this.guild)}\n${
					reminder.title
				} is due in ${new DateHelper(reminder.due_date).getTimeLeft()}!`,
				embeds: [reminder.toMessageEmbed(this.guild)]
			})
		}
	}

	getDraftDoc() {
		return this.getReminderDoc("draft")
	}

	getReminderDoc(reminderId?: string) {
		const collection = this.ref.collection("reminders").withConverter(new ReminderConverter())
		return reminderId ? collection.doc(reminderId) : collection.doc()
	}

	getRemindersChannelId() {
		return this.entry.reminders_channel_id
	}

	async setRemindersChannelId(reminders_channel_id: string) {
		this.entry.reminders_channel_id = reminders_channel_id
		await this.ref.update({ reminders_channel_id })
	}

	getReminderMessageIds() {
		return [...this.entry.reminder_message_ids]
	}

	async setReminderMessageIds(reminder_message_ids: string[]) {
		this.entry.reminder_message_ids = reminder_message_ids
		await this.ref.update({ reminder_message_ids })
	}

	getPingChannelId() {
		return this.entry.ping_channel_id
	}

	async setPingChannelId(ping_channel_id: string) {
		this.entry.ping_channel_id = ping_channel_id
		await this.ref.update({ ping_channel_id })
	}
}
