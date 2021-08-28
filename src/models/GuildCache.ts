import { Client, Guild, TextChannel } from "discord.js"
import Document, { iDocument } from "./Document"
import { Draft, Reminder } from "./Reminder"
import DocumentConverter from "../utilities/DocumentConverter"
import ChannelCleaner from "../utilities/ChannelCleaner"
import DateFunctions from "../utilities/DateFunctions"

export default class GuildCache {
	public bot: Client
	public guild: Guild
	private ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	private document: Document = Document.getEmpty()

	private reminders: Reminder[] = []
	private draft: Draft | undefined

	private init: number = 0

	public constructor(
		bot: Client,
		guild: Guild,
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		resolve: (localCache: GuildCache) => void
	) {
		this.bot = bot
		this.guild = guild
		this.ref = ref
		this.ref.onSnapshot(snap => {
			if (snap.exists) {
				this.document = new Document(snap.data() as iDocument)

				if (this.init < 3) this.init++
				if (this.init === 2) resolve(this)
			}
		})
		this.ref.collection("reminders").onSnapshot(snap => {
			// Set the cache from Firestore
			this.reminders = DocumentConverter.toReminders(
				snap.docs,
				this.getReminderRef.bind(this)
			)
			this.draft = DocumentConverter.toDraft(snap.docs, this)

			if (this.init < 3) this.init++
			if (this.init === 2) resolve(this)
		})
	}

	/**
	 * Method run every minute
	 */
	public async updateMinutely(debug: number) {
		console.time(
			`Updated Channels for Guild(${this.guild.name}) [${debug}]`
		)

		await this.updateRemindersChannel()

		console.timeEnd(
			`Updated Channels for Guild(${this.guild.name}) [${debug}]`
		)
	}

	public async updateRemindersChannel() {
		const remindersChannelId = this.getRemindersChannelId()
		const remindersMessageId = this.getRemindersMessageId()

		let channel: TextChannel | undefined

		try {
			channel = await new ChannelCleaner(this, remindersChannelId)
				.setExcluded(message => message.id === remindersMessageId)
				.clean()
		} catch (err) {
			console.warn(
				`Guild(${this.guild.name}) has no Channel(${remindersChannelId})`
			)
			await this.setRemindersChannelId("")
			return
		}

		const reminders = this.getReminders()
		const embeds = reminders.map(reminder => reminder.getFormatted())
		const message = channel.messages.cache.get(remindersMessageId)

		if (message) {
			await message.edit({
				content: embeds.length === 0 ? "No reminders!" : "\u200B",
				embeds
			})
		} else {
			const message = await channel.send({
				content: embeds.length === 0 ? "No reminders!" : "\u200B",
				embeds
			})
			await this.setRemindersMessageId(message.id)
		}
	}

	public async updatePingChannel(reminder: Reminder) {
		const pingChannelId = this.getPingChannelId()

		const channel = this.guild.channels.cache.get(pingChannelId)
		if (channel instanceof TextChannel) {
			channel
				.send({
					content: `@everyone ${
						reminder.name
					} is due in ${new DateFunctions(
						reminder.date
					).getDueIn()}!`,
					embeds: [reminder.getFormatted()]
				})
				.then()
		}
	}

	/**
	 * Get the reference to the object in Firestore
	 * @param id Reminder ID
	 * @returns Reference to object in Firestore
	 */
	public getReminderRef(id: string) {
		return this.ref.collection("reminders").doc(id)
	}

	public getRemindersChannelId() {
		return this.document.value.reminders_channel_id
	}

	public async setRemindersChannelId(reminders_channel_id: string) {
		this.document.value.reminders_channel_id = reminders_channel_id
		await this.ref.update({ reminders_channel_id })
	}

	public getRemindersMessageId() {
		return this.document.value.reminders_message_id
	}

	public async setRemindersMessageId(reminders_message_id: string) {
		this.document.value.reminders_message_id = reminders_message_id
		await this.ref.update({ reminders_message_id })
	}

	public getPingChannelId() {
		return this.document.value.ping_channel_id
	}

	public async setPingChannelId(ping_channel_id: string) {
		this.document.value.ping_channel_id = ping_channel_id
		await this.ref.update({ ping_channel_id })
	}

	public generateReminderId() {
		return this.ref.collection("reminders").doc().id
	}

	public getReminder(id: string): Reminder | undefined {
		return this.getReminders().filter(a => a.id === id)[0]
	}

	public getReminders() {
		return this.reminders
	}

	/**
	 * @async Creates a new Reminder in the Guild Cache
	 * @param reminder Reminder to add to Firestore
	 */
	public async pushReminder(reminder: Reminder) {
		this.reminders.push(reminder)
		await this.ref.collection("reminders").doc(reminder.id).set({
			id: reminder.id,
			name: reminder.name,
			date: reminder.date,
			details: reminder.details,
			priority: reminder.priority
		})
	}

	public async removeReminder(id: string) {
		this.reminders = this.reminders.filter(a => a.id !== id)
		await this.ref.collection("reminders").doc(id).delete()
	}

	public getDraft() {
		return this.draft
	}

	public setDraft(draft: Draft) {
		this.draft = draft
	}

	public async removeDraft() {
		if (this.draft) {
			await this.draft.delete()
			this.draft = undefined
		}
	}
}
