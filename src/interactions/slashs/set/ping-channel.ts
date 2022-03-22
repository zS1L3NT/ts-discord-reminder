import Entry from "../../../data/Entry"
import GuildCache from "../../../data/GuildCache"
import { Emoji, iSlashSubFile, ResponseBuilder } from "nova-bot"
import { GuildMember, TextChannel } from "discord.js"

const file: iSlashSubFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "ping-channel",
		description: {
			slash: "Set the channel where the bot pings all users about Reminders",
			help: [
				"Sets the channel where the bot will ping users about Reminders",
				"Use this if you want the bot to ping users about Reminders"
			].join("\n")
		},
		options: [
			{
				name: "channel",
				description: {
					slash: "Leave this empty if you want to unset the channel",
					help: "Leave this empty if you want to unset the channel"
				},
				type: "channel",
				requirements: "Valid Text Channel",
				required: false,
				default: "Unsets the channel"
			}
		]
	},
	execute: async helper => {
		const member = helper.interaction.member as GuildMember
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== process.env.DISCORD__DEV_ID) {
			return helper.respond(
				new ResponseBuilder(Emoji.BAD, "Only administrators can set bot channels")
			)
		}

		const channel = helper.channel("channel")
		if (channel instanceof TextChannel) {
			switch (channel.id) {
				case helper.cache.getRemindersChannelId():
					helper.respond(
						new ResponseBuilder(
							Emoji.BAD,
							"This channel is already the Reminders channel!"
						)
					)
					break
				case helper.cache.getPingChannelId():
					helper.respond(
						new ResponseBuilder(Emoji.BAD, "This channel is already the ping channel!")
					)
					break
				default:
					await helper.cache.setPingChannelId(channel.id)
					helper.respond(
						new ResponseBuilder(
							Emoji.GOOD,
							`Pinging channel reassigned to \`#${channel.name}\``
						)
					)
					break
			}
		} else if (channel === null) {
			await helper.cache.setPingChannelId("")
			helper.respond(new ResponseBuilder(Emoji.GOOD, `Pinging channel unassigned`))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, `Please select a text channel`))
		}
	}
}

export default file
