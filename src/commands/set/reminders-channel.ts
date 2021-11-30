import admin from "firebase-admin"
import Document, { iValue } from "../../models/Document"
import GuildCache from "../../models/GuildCache"
import { Emoji, iInteractionSubcommandFile, ResponseBuilder } from "discordjs-nova"
import { GuildMember, TextChannel } from "discord.js"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

const config = require("../../../config.json")

const file: iInteractionSubcommandFile<iValue, Document, GuildCache> = {
	defer: true,
	ephemeral: true,
	help: {
		description: [
			"Sets the channel which the bot will attatch to and show all the reminders",
			"This channel will be owned by the bot and unrelated messages will be cleared every minute",
			"Use this to see all the reminders in a channel"
		].join("\n"),
		params: [
			{
				name: "channel",
				description: "Leave this empty if you want to unset the channel",
				requirements: "Valid Text Channel",
				required: false,
				default: "Unsets the channel"
			}
		]
	},
	builder: new SlashCommandSubcommandBuilder()
		.setName("reminders-channel")
		.setDescription("Set the channel that all the reminder embeds show up in")
		.addChannelOption(option =>
			option.setName("channel").setDescription("Leave empty to unset the reminders channel")
		),
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
							"This channel is already the reminders channel!"
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
