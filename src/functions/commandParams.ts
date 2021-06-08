import { Message, TextChannel } from "discord.js"
import { GuildCache, updateModifyChannel, updateNotifyChannel } from "../all"

const time = (ms: number) => new Promise(res => setTimeout(res, ms))

const match =
	(message: Message): match =>
	(regexp: string) =>
		message.content.match(new RegExp(regexp))
type match = (regexp: string) => RegExpMatchArray | null

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

export const commandParams = (
	cache: GuildCache,
	message: Message
): [
	GuildCache,
	Message,
	match,
	clear,
	sendMessage,
	updateChannelInline,
	updateChannelInline,
	"✅"
] => [
	cache,
	message,
	match(message),
	clear(message),
	sendMessage(message),
	updateModifyChannelInline(cache, message),
	updateNotifyChannelInline(cache, message),
	"✅"
]

type dip = (command: string) => void
export type commandParams = [
	dip,
	GuildCache,
	Message,
	match,
	clear,
	sendMessage,
	updateChannelInline,
	updateChannelInline,
	"✅"
]
