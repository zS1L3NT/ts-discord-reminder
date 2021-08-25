import {
	Client,
	Guild,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	TextChannel
} from "discord.js"
import Document, { iDocument } from "./Document"
import Assignment from "./Assignment"
import Draft from "./Draft"
import DocumentConverter from "../utilities/DocumentConverter"
import ChannelCleaner from "../utilities/ChannelCleaner"
import DateFunctions from "../utilities/DateFunctions"

export default class GuildCache {
	public bot: Client
	public guild: Guild
	private ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
	private document: Document = Document.getEmpty()

	private assignments: Assignment[] = []
	private draft: Draft | undefined

	private init: number = 0
	private menu_state: "drafts" | "subjects"

	public constructor(
		bot: Client,
		guild: Guild,
		ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
		resolve: (localCache: GuildCache) => void
	) {
		this.menu_state = "drafts"
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
		this.ref.collection("assignments").onSnapshot(snap => {
			// Set the cache from Firestore
			this.assignments = DocumentConverter.toAssignments(
				snap.docs,
				this.getAssignmentRef.bind(this)
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

		const notifyChannelId = this.getNotifyChannelId()
		const modifyChannelId = this.getModifyChannelId()
		const modifyMessageId = this.getModifyMessageId()
		const notifyMessageIds = this.getNotifyMessageIds()

		let channel: TextChannel | undefined

		// Update notify channel
		try {
			channel = await new ChannelCleaner(this, notifyChannelId)
				.setFilter(message => notifyMessageIds.includes(message.id))
				.clean()
		} catch (err) {
			// ! Channel doesn't exist
			console.warn(
				`Guild(${this.guild.name}) has no Channel(${notifyChannelId})`
			)
			await this.setNotifyChannelId("")
		}
		if (channel) await this.updateNotifyChannel(channel)

		// Update modify channel
		try {
			channel = await new ChannelCleaner(this, modifyChannelId)
				.setFilter(
					message =>
						message.id === modifyMessageId ||
						!!message.content.match(/^--/)
				)
				.clean()
		} catch (err) {
			// ! Channel doesn't exist
			console.warn(
				`Guild(${this.guild.name}) has no Channel(${modifyChannelId})`
			)
			await this.setModifyChannelId("")
		}
		if (channel) await this.updateModifyChannel(channel)

		console.timeEnd(
			`Updated Channels for Guild(${this.guild.name}) [${debug}]`
		)
	}

	public async updateNotifyChannel(channel: TextChannel) {
		const assignments = this.getAssignments()
			.filter(assignment => {
				if (assignment.getDate() < new Date().getTime()) {
					this.removeAssignment(assignment.getId())
					return false
				}
				return true
			})
			.sort((a, b) => b.getDate() - a.getDate())

		const notifyMessageIds = this.getNotifyMessageIds()

		// Check if a message exists for each id
		for (let i = 0, il = notifyMessageIds.length; i < il; i++) {
			const notifyMessageId = notifyMessageIds[i]
			try {
				// * Edited assignment message
				await channel.messages.fetch(notifyMessageId)
			} catch (e) {
				// ! Assignment message doesn't exist
				console.warn(
					`Channel(${channel.name}) has no Message(${notifyMessageId})`
				)
				await this.removeNotifyMessageId(notifyMessageId)
			}
		}

		const requiredMessages =
			assignments.length - this.getNotifyMessageIds().length
		for (let i = 0; i < requiredMessages; i++) {
			const main = await channel.send(
				"Waiting for assignments to update..."
			)
			await this.pushNotifyMessageId(main.id)
		}

		const colors = this.getColors()
		const promises: Promise<Message>[] = []

		for (let i = 0, il = notifyMessageIds.length; i < il; i++) {
			const notifyMessageId = notifyMessageIds[i]
			const assignment = assignments[i]
			const message = await channel.messages.cache.get(notifyMessageId)
			if (message) {
				if (assignment) {
					promises.push(
						message.edit({
							embeds: [assignment.getFormatted(colors)]
						})
					)
				} else {
					await this.removeNotifyMessageId(notifyMessageId)
				}
			}
		}

		await Promise.allSettled(promises)
	}

	public async updateModifyChannel(channel: TextChannel) {
		const draft = this.getDraft()

		const modifyMessageId = this.getModifyMessageId()
		const message = channel.messages.cache.get(modifyMessageId)

		const DraftsButton = new MessageButton()
			.setLabel("Drafts")
			.setStyle("PRIMARY")
			.setEmoji("✏")
			.setCustomId("enable_drafts")
		const SubjectsButton = new MessageButton()
			.setLabel("Subjects")
			.setStyle("SUCCESS")
			.setEmoji("📚")
			.setCustomId("enable_subjects")

		const ButtonActionRow = new MessageActionRow().addComponents(
			DraftsButton,
			SubjectsButton
		)

		const embed =
			this.getMenuState() === "drafts"
				? Draft.getFormatted(draft)
				: this.getSubjectsFormatted()

		if (message) {
			await message.edit({
				content: "\u200B",
				components: [ButtonActionRow],
				embeds: [embed]
			})
		} else {
			// ! Modify message doesn't exist
			console.warn(
				`Channel(${channel.name}) has no Message(${modifyMessageId})`
			)
			const main = await channel.send({
				content: "\u200B",
				components: [ButtonActionRow],
				embeds: [embed]
			})
			await this.setModifyMessageId(main.id)
		}
	}

	public async updatePingChannel(assignment: Assignment) {
		const pingChannelId = this.getPingChannelId()

		const channel = this.guild.channels.cache.get(pingChannelId)
		if (channel instanceof TextChannel) {
			channel
				.send({
					content: `@everyone ${assignment.getSubject()} ${assignment.getName()} is due in ${new DateFunctions(
						assignment.getDate()
					).getDueIn()}!`,
					embeds: [assignment.getFormatted(this.getColors())]
				})
				.then()
		}
	}

	public async updateNotifyChannelInline() {
		const channel = this.guild.channels.cache.get(this.getNotifyChannelId())
		if (channel instanceof TextChannel) {
			await this.updateNotifyChannel(channel)
		}
	}

	public async updateModifyChannelInline() {
		const channel = this.guild.channels.cache.get(this.getModifyChannelId())
		if (channel instanceof TextChannel) {
			await this.updateModifyChannel(channel)
		}
	}

	/**
	 * Get the reference to the object in Firestore
	 * @param id Assignment ID
	 * @returns Reference to object in Firestore
	 */
	public getAssignmentRef(id: string) {
		return this.ref.collection("assignments").doc(id)
	}

	public getModifyChannelId() {
		return this.document.value.modify_channel_id
	}

	public async setModifyChannelId(modify_channel_id: string) {
		this.document.value.modify_channel_id = modify_channel_id
		await this.ref.update({ modify_channel_id })
	}

	public getModifyMessageId() {
		return this.document.value.modify_message_id
	}

	public async setModifyMessageId(modify_message_id: string) {
		this.document.value.modify_message_id = modify_message_id
		await this.ref.update({ modify_message_id })
	}

	public getNotifyChannelId() {
		return this.document.value.notify_channel_id
	}

	public async setNotifyChannelId(notify_channel_id: string) {
		this.document.value.notify_channel_id = notify_channel_id
		await this.ref.update({ notify_channel_id })
	}

	public getNotifyMessageIds() {
		return this.document.value.notify_message_ids
	}

	public async pushNotifyMessageId(notify_message_id: string) {
		this.document.value.notify_message_ids.push(notify_message_id)
		await this.ref.update({
			notify_message_ids: this.document.value.notify_message_ids
		})
	}

	public async removeNotifyMessageId(notify_message_id: string) {
		this.document.value.notify_message_ids =
			this.document.value.notify_message_ids.filter(
				id => id !== notify_message_id
			)
		await this.ref.update({
			notify_message_ids: this.document.value.notify_message_ids
		})
	}

	public getPingChannelId() {
		return this.document.value.ping_channel_id
	}

	public async setPingChannelId(ping_channel_id: string) {
		this.document.value.ping_channel_id = ping_channel_id
		await this.ref.update({ ping_channel_id })
	}

	public generateAssignmentId() {
		return this.ref.collection("assignments").doc().id
	}

	public getAssignment(id: string): Assignment | undefined {
		return this.getAssignments().filter(a => a.getId() === id)[0]
	}

	public getAssignments() {
		return this.assignments
	}

	/**
	 * @async Creates a new Assignment in the Guild Cache
	 * @param assignment Assignment to add to Firestore
	 */
	public async pushAssignment(assignment: Assignment) {
		this.assignments.push(assignment)
		await this.ref.collection("assignments").doc(assignment.getId()).set({
			id: assignment.getId(),
			name: assignment.getName(),
			subject: assignment.getSubject(),
			date: assignment.getDate(),
			details: assignment.getDetails()
		})
	}

	public async removeAssignment(id: string) {
		this.assignments = this.assignments.filter(a => a.getId() !== id)
		await this.ref.collection("assignments").doc(id).delete()
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

	public getColors() {
		return this.document.value.colors
	}

	public getSubjectsFormatted() {
		return new MessageEmbed()
			.setTitle("Subjects")
			.setDescription(
				Object.keys(this.document.value.colors)
					.map(code => `${code}: ${this.document.value.colors[code]}`)
					.join("\n")
			)
			.setColor("#3BA55C")
			.addField("\u200B", "\u200B")
			.addField("Find a color here", "https://htmlcolorcodes.com")
			.addField(
				"Notice",
				"You can't rename a subject, but you can delete it and create it again!"
			)
			.addField("Create new subject", "`--create <subject code> <color>`")
			.addField("Change subject color", "`--edit <subject code> <color>`")
			.addField("Delete subject", "`--delete <subject code>`")
	}

	public getSubjects() {
		return Object.keys(this.document.value.colors)
	}

	public async changeSubject(name: string, color: string) {
		this.document.value.colors[name] = color
		await this.ref.update({ colors: this.document.value.colors })
	}

	public async deleteSubject(name: string) {
		delete this.document.value.colors[name]
		await this.ref.update({ colors: this.document.value.colors })
	}

	public getMenuState() {
		return this.menu_state
	}

	public setMenuState(menu_state: "drafts" | "subjects") {
		this.menu_state = menu_state
	}
}
