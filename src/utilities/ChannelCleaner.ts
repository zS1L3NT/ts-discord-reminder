import { Message, TextChannel } from "discord.js"
import GuildCache from "../models/GuildCache"

type iFilter = (message: Message) => boolean
export default class ChannelCleaner {
	private filter: iFilter
	private cache: GuildCache
	private readonly channelId: string

	public constructor(cache: GuildCache, channelId: string) {
		this.filter = () => true
		this.cache = cache
		this.channelId = channelId
	}

	/**
	 * Set a filter to remove messages that meet a condition.
	 * TRUE if excluding message from deletion
	 *
	 * @param filter Filter
	 */
	public setExcluded(filter: iFilter) {
		this.filter = filter
		return this
	}

	public async clean() {
		const channel = this.cache.guild.channels.cache.get(this.channelId)
		if (channel instanceof TextChannel) {
			const promises: Promise<any>[] = []

			const messages = await channel.messages.fetch({ limit: 100 })
			messages.forEach(message => {
				if (!this.filter(message)) {
					console.warn(
						`Message(${message.id}) shouldn't be in Channel(${channel.id})`
					)
					promises.push(message.delete())
				}
			})

			await Promise.allSettled(promises)
			return channel
		} else {
			throw new Error(
				"Channel ID references is not a text channel or doesn't exist"
			)
		}
	}
}
