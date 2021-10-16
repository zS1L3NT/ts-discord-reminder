import { MessageEmbed } from "discord.js"

export enum Emoji {
	GOOD = "https://firebasestorage.googleapis.com/v0/b/zectan-projects.appspot.com/o/good.png?alt=media&token=4b833fc2-b8ff-4d5c-add2-f5a6029664fb",
	BAD = "https://firebasestorage.googleapis.com/v0/b/zectan-projects.appspot.com/o/bad.png?alt=media&token=cbd48c77-784c-4f86-8de1-7335b452a894"
}

export default class EmbedResponse {
	private emoji: Emoji
	private content: string

	public constructor(emoji: Emoji, content: string) {
		this.emoji = emoji
		this.content = content
	}

	public create() {
		return new MessageEmbed()
			.setAuthor(this.content, this.emoji)
			.setColor(this.emoji === Emoji.GOOD ? "#77B255" : "#DD2E44")
	}
}
