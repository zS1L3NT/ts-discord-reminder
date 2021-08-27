import { InteractionReplyOptions, Message, MessagePayload } from "discord.js"
import GuildCache from "../models/GuildCache"

const time = (ms: number) => new Promise(res => setTimeout(res, ms))

export default class MessageHelper {
	public cache: GuildCache
	public message: Message

	public constructor(cache: GuildCache, message: Message) {
		this.cache = cache
		this.message = message
	}

	public match(regexp: string) {
		const regex = this.message.content.match(new RegExp(regexp))
		return regex ? regex.slice(1) : null
	}

	public matchOnly(command: string) {
		return this.match(`^${command}(?:(?= *$)(?!\\w+))`)
	}

	public matchMore(command: string) {
		return this.match(`^${command}(?:(?= *)(?!\\w+))`)
	}

	public clearAfter(ms: number) {
		setTimeout(() => {
			this.message.delete().catch(() => {})
		}, ms)
	}

	public reactSuccess() {
		void this.message.react("✅")
	}

	public reactFailure() {
		void this.message.react("❌")
	}

	public respond(
		options: string | MessagePayload | InteractionReplyOptions,
		ms: number
	) {
		this.message.channel.send(options).then(async temporary => {
			await time(ms)
			await temporary.delete().catch(() => {})
		})
	}
}
