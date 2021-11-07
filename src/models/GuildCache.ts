import equal from "deep-equal"
import { Client, Guild, TextChannel } from "discord.js"
import admin from "firebase-admin"
import { useTryAsync } from "no-try"
import ChannelCleaner from "../utilities/ChannelCleaner"
import DateHelper from "../utilities/DateHelper"
import FirestoreParser from "../utilities/FirestoreParser"
import Document, { iDocument } from "./Document"
import Reminder from "./Reminder"

export default class GuildCache {
	public bot: Client
	public guild: Guild
	public ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	public reminders: Reminder[] = []
	public draft: Reminder | undefined
	private document: Document = Document.getEmpty()

	public constructor(
		bot: Client,
		guild: Guild,
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		resolve: (cache: GuildCache) => void
	) {
		this.bot = bot
		this.guild = guild
		this.ref = ref
		this.ref.onSnapshot(snap => {
			if (snap.exists) {
				this.document = new Document(snap.data() as iDocument)
				resolve(this)
			}
		})
		this.ref.collection("reminders").onSnapshot(snap => {
			const converter = new FirestoreParser(snap.docs)
			this.reminders = converter.getReminders()
			this.draft = converter.getDraft()
		})
	}

	/**
	 * Method run every minute
	 */
	public async updateMinutely(debug: number) {
		console.time(`Updated Channels for Guild(${this.guild.name}) [${debug}]`)

		await this.updateRemindersChannel()

		console.timeEnd(`Updated Channels for Guild(${this.guild.name}) [${debug}]`)
	}

	public async updateRemindersChannel() {
		const remindersChannelId = this.getRemindersChannelId()
		if (remindersChannelId === "") return

		const [err, messages] = await useTryAsync(async () => {
			const remindersMessageIds = this.getRemindersMessageIds()
			const cleaner = new ChannelCleaner(this, remindersChannelId, remindersMessageIds)
			await cleaner.clean()
			const messages = cleaner.getMessages()

			const newRemindersMessageIds = cleaner.getMessageIds()
			if (!equal(newRemindersMessageIds, remindersMessageIds)) {
				this.setRemindersMessageIds(newRemindersMessageIds).then()
			}

			return messages
		})

		if (err) {
			if (err.message === "no-channel") {
				console.warn(`Guild(${this.guild.name}) has no Channel(${remindersChannelId})`)
				await this.setRemindersChannelId("")
				return
			}
			throw err
		}

		// Remove expired reminders
		for (const reminder of this.reminders) {
			if (reminder.value.due_date < Date.now()) {
				this.reminders = this.reminders.filter(rem => rem.value.id !== reminder.value.id)
				await this.getReminderDoc(reminder.value.id).delete()
				await this.ref.set(
					{
						reminders_message_ids: admin.firestore.FieldValue.arrayRemove(
							this.getRemindersMessageIds()[0]
						)
					},
					{ merge: true }
				)
			}
		}

		const embeds = this.reminders
			.sort((a, b) => b.value.due_date - a.value.due_date)
			.map(reminder => reminder.getEmbed(this.guild))

		const remindersMessageIds = this.getRemindersMessageIds()

		if (embeds.length === remindersMessageIds.length) {
			for (let i = 0, il = embeds.length; i < il; i++) {
				const messageId = remindersMessageIds[i]
				const embed = embeds[i]
				const message = messages.get(messageId)!
				message.edit({ embeds: [embed] }).then()
			}
		} else {
			console.error("Embed count doesn't match up to reminder message id count!")
			if (embeds.length > remindersMessageIds.length) {
				console.log("Embeds > Message IDs")
			} else {
				console.log("Message IDs > Embeds")
			}
		}
	}

	public async updatePingChannel(reminder: Reminder) {
		const pingChannelId = this.getPingChannelId()

		const channel = this.guild.channels.cache.get(pingChannelId)
		if (channel instanceof TextChannel) {
			channel
				.send({
					content: `${reminder.getPingString(this.guild)}\n${
						reminder.value.title
					} is due in ${new DateHelper(reminder.value.due_date).getTimeLeft()}!`,
					embeds: [reminder.getEmbed(this.guild)]
				})
				.then()
		}
	}

	public getDraftDoc() {
		return this.getReminderDoc("draft")
	}

	public getReminderDoc(reminder_id?: string) {
		return reminder_id
			? this.ref.collection("reminders").doc(reminder_id)
			: this.ref.collection("reminders").doc()
	}

	public getRemindersChannelId() {
		return this.document.value.reminders_channel_id
	}

	public async setRemindersChannelId(reminders_channel_id: string) {
		this.document.value.reminders_channel_id = reminders_channel_id
		await this.ref.update({ reminders_channel_id })
	}

	public getRemindersMessageIds() {
		return this.document.value.reminders_message_ids
	}

	public async setRemindersMessageIds(reminders_message_ids: string[]) {
		this.document.value.reminders_message_ids = reminders_message_ids
		await this.ref.update({ reminders_message_ids })
	}

	public getPingChannelId() {
		return this.document.value.ping_channel_id
	}

	public async setPingChannelId(ping_channel_id: string) {
		this.document.value.ping_channel_id = ping_channel_id
		await this.ref.update({ ping_channel_id })
	}
}
