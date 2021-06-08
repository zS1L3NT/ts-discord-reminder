import { TextChannel } from "discord.js"
import { Draft, GuildCache } from "../all"
import { MessageActionRow, MessageButton } from "discord-buttons"

// : Assume that the modify channel exists
export default async (cache: GuildCache, mChannel: TextChannel) => {
	const draft = cache.getDraft()
	const modifyMessageId = cache.getModifyMessageId()
	const message = mChannel.messages.cache.get(modifyMessageId)

	const DraftsButton = new MessageButton()
		.setLabel("Drafts")
		.setStyle("blurple")
		.setEmoji("✏")
		.setID("enable_drafts")
	const SubjectsButton = new MessageButton()
		.setLabel("Subjects")
		.setStyle("green")
		.setEmoji("📚")
		.setID("enable_subjects")
	const Buttons = new MessageActionRow()
		.addComponent(DraftsButton)
		.addComponent(SubjectsButton)

	const embed =
		cache.getMenuState() === "drafts"
			? Draft.getFormatted(draft)
			: cache.getSubjectsFormatted()

	if (message) {
		await message.edit("\u200B", {
			// @ts-ignore
			component: Buttons,
			embed
		})
	} else {
		// ! Modify message doesn't exist
		console.warn(
			`Channel(${mChannel.name}) has no Message(${modifyMessageId})`
		)
		const main = await mChannel.send("\u200B", {
			// @ts-ignore
			component: Buttons,
			embed
		})
		await cache.setModifyMessageId(main.id)
	}
}
