import { Message, TextChannel } from "discord.js"
import { GuildCache, updateModifyChannel, updateNotifyChannel } from "../all"

const time = (ms: number) => new Promise(res => setTimeout(res, ms))

const match =
	(message: Message): match =>
	(regexp: string) => {
		const regex = message.content.match(new RegExp(regexp))
		return regex ? regex.slice(1) : null
	}
type match = (regexp: string) => string[] | null

const clear =
	(message: Message): ((ms: number) => NodeJS.Timeout) =>
	(ms: number) =>
		setTimeout(() => {
			message.delete().catch(() => {})
		}, ms)
type clear = (ms: number) => NodeJS.Timeout

const sendMessage =
	(message: Message): sendMessage =>
	async (text: string, ms: number) => {
		const temporary = await message.channel.send(text)
		await time(ms)
		await temporary.delete().catch(() => {})
	}
type sendMessage = (text: string, ms: number) => Promise<void>

const updateNotifyChannelInline =
	(cache: GuildCache, message: Message): updateChannelInline =>
	async () => {
		const notifyChannel = message.guild!.channels.cache.get(
			cache.getNotifyChannelId()
		)
		if (notifyChannel) {
			await updateNotifyChannel(cache, notifyChannel as TextChannel)
		}
	}
const updateModifyChannelInline =
	(cache: GuildCache, message: Message): updateChannelInline =>
	async () => {
		const modifyChannel = message.guild!.channels.cache.get(
			cache.getModifyChannelId()
		)
		if (modifyChannel) {
			await updateModifyChannel(cache, modifyChannel as TextChannel)
		}
	}
type updateChannelInline = () => Promise<void>

export const parameters = (
	cache: GuildCache,
	message: Message
): {
	cache: GuildCache
	message: Message
	match: match
	clear: clear
	sendMessage: sendMessage
	updateModifyChannelInline: updateChannelInline
	updateNotifyChannelInline: updateChannelInline
	CHECK_MARK: "✅"
	CROSS_MARK: "❌"
} => ({
	cache,
	message,
	match: match(message),
	clear: clear(message),
	sendMessage: sendMessage(message),
	updateModifyChannelInline: updateModifyChannelInline(cache, message),
	updateNotifyChannelInline: updateNotifyChannelInline(cache, message),
	CHECK_MARK: "✅",
	CROSS_MARK: "❌"
})

type dip = (command: string) => void
export interface allParameters {
	dip: dip
	cache: GuildCache
	message: Message
	match: match
	clear: clear
	sendMessage: sendMessage
	updateModifyChannelInline: updateChannelInline
	updateNotifyChannelInline: updateChannelInline
	CHECK_MARK: "✅"
	CROSS_MARK: "❌"
}
