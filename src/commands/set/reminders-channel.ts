import Entry from "../../models/Entry"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember, TextChannel } from "discord.js"

const config = require("../../../config.json")

const file: iInteractionSubcommandFile<Entry, GuildCache> = {
	defer: true,
	ephemeral: true,
	data: {
		name: "reminders-channel",
		description: {
			slash: "Set the channel that all the Reminder embeds show up in",
			help: [
				"Sets the channel which the bot will attatch to and show all the Reminders",
				"This channel will be owned by the bot and unrelated messages will be cleared every minute",
				"Use this to see all the Reminders in a channel"
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
		if (!member.permissions.has("ADMINISTRATOR") && member.id !== config.discord.dev_id) {
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
					await helper.cache.setRemindersChannelId(channel.id)
					helper.cache.updateRemindersChannel().then()
					helper.respond(
						new ResponseBuilder(
							Emoji.GOOD,
							`Reminders channel reassigned to ${channel.toString()}`
						)
					)
					break
			}
		} else if (channel === null) {
			await helper.cache.setRemindersChannelId("")
			helper.respond(new ResponseBuilder(Emoji.GOOD, `Reminders channel unassigned`))
		} else {
			helper.respond(new ResponseBuilder(Emoji.BAD, `Please select a text channel`))
		}
	}
}

export default file
