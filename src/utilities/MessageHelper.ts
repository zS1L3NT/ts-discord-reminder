import { InteractionReplyOptions, Message, MessagePayload } from "discord.js"
import GuildCache from "../models/GuildCache"
import EmbedResponse from "./EmbedResponse"

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
		options: MessagePayload | InteractionReplyOptions | EmbedResponse,
		ms: number
	) {
		let message: Promise<Message>

		if (options instanceof EmbedResponse) {
			message = this.message.channel.send({
				embeds: [options.create()]
			})
		}
		else {
			message = this.message.channel.send(options as MessagePayload | InteractionReplyOptions)
		}

		message.then(async temporary => {
			await time(ms)
			await temporary.delete().catch(() => {
			})
		})
	}
}
