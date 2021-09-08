import { Client, Guild, TextChannel } from "discord.js"
import Document, { iDocument } from "./Document"
import Reminder from "./Reminder"
import ChannelCleaner from "../utilities/ChannelCleaner"
import DateHelper from "../utilities/DateHelper"
import FirestoreParser from "../utilities/FirestoreParser"

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
		resolve: (localCache: GuildCache) => void
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
			const converter = new FirestoreParser(this, snap.docs)
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

		let channel: TextChannel

		try {
			const remindersMessageId = this.getRemindersMessageId()
			const cleaner = new ChannelCleaner(this, remindersChannelId, [remindersMessageId])
			await cleaner.clean()
			channel = cleaner.getChannel()

			const newRemindersMessageId = cleaner.getMessageIds()[0]
			if (newRemindersMessageId !== remindersMessageId) {
				this.setRemindersMessageId(newRemindersMessageId).then()
			}
		} catch (err) {
			console.warn(
				`Guild(${this.guild.name}) has no Channel(${remindersChannelId})`
			)
			await this.setRemindersChannelId("")
			return
		}

		// Remove expired reminders
		for (const reminder of this.reminders) {
			if (reminder.value.due_date < Date.now()) {
				this.reminders = this.reminders.filter(rem => rem.value.id !== reminder.value.id)
				await this.getReminderDoc(reminder.value.id).delete()
			}
		}

		const embeds = this.reminders
			.sort((a, b) => b.value.due_date - a.value.due_date)
			.map(reminder => reminder.getEmbed())
		const message = channel.messages.cache.get(this.getRemindersMessageId())!
		await message.edit({
			content: embeds.length === 0 ? "No reminders!" : "\u200B",
			embeds
		})
	}

	public async updatePingChannel(reminder: Reminder) {
		const pingChannelId = this.getPingChannelId()

		const channel = this.guild.channels.cache.get(pingChannelId)
		if (channel instanceof TextChannel) {
			channel
				.send({
					content: `${
						reminder.getPingString()
					}\n${
						reminder.value.title
					} is due in ${new DateHelper(
						reminder.value.due_date
					).getTimeLeft()}!`,
					embeds: [reminder.getEmbed()]
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
}
