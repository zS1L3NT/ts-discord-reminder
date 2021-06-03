import {Client, Message, TextChannel} from "discord.js"
import {BotCache, Draft, updateChannels, updateModifyChannel, updateNotifyChannel, verifyDate} from "./all"

const bot = new Client()
const botCache = new BotCache()
const time = (ms: number) => new Promise(res => setTimeout(res, ms))
const CHECK_MARK = "✅"

bot.login(require("../discordToken.json")).then()
bot.on("ready", () => {
	console.log("Logged in as Assignment Bot#2744")
	bot.guilds.cache.forEach(async guild => {
		const cache = await botCache.getGuildCache(guild.id)
		console.log(`Restored state for Guild(${guild.name})`)

		let debugCount = 0
		await updateChannels(guild, cache, ++debugCount)
		setInterval(async () => await updateChannels(guild, cache, ++debugCount), 30 * 1000)
	})
})

bot.on("message", async message => {
	const cache = await botCache.getGuildCache(message.guild!.id)

	const NotifyHereRegex = match(message, "^--notify-here$")
	const ModifyHereRegex = match(message, "^--modify-here$")

	if (NotifyHereRegex) {
		await message.react(CHECK_MARK)
		await cache.setNotifyChannelId(message.channel.id)
		await time(3000)
		await message.delete()
	} else if (ModifyHereRegex) {
		await message.react(CHECK_MARK)
		await cache.setModifyChannelId(message.channel.id)
		await time(3000)
		await message.delete()
	}
})

// Handle the modify channel
bot.on("message", async message => {
	const cache = await botCache.getGuildCache(message.guild!.id)
	const clear = (ms: number) => setTimeout(message.delete.bind(message), ms)
	if (message.channel.id !== cache.getModifyChannelId()) return
	if (message.author.bot) return

	const sendMessage = async (text: string, ms: number) => {
		const temporary = await message.channel.send(text)
		await time(ms)
		await temporary.delete()
	}

	const ModifyHereRegex = match(message, "^--modify-here$")
	const CreateRegex = match(message, "^--create")
	const EditRegex = match(message, "^--edit")
	const DeleteRegex = match(message, "^--delete")
	const DiscardRegex = match(message, "^--discard")
	const NameRegex = match(message, "^--name")
	const DateRegex = match(message, "^--date")
	const InfoRegex = match(message, "^--info")
	const DoneRegex = match(message, "^--done$")

	const draft = cache.getDraft()
	const notifyChannel = message.guild!.channels.cache.get(cache.getNotifyChannelId())
	const modifyChannel = message.guild!.channels.cache.get(cache.getModifyChannelId())
	const updateNotifyChannelInline = async () => {
		if (notifyChannel) {
			await updateNotifyChannel(cache, notifyChannel as TextChannel)
		}
	}
	const updateModifyChannelInline = async () => {
		if (modifyChannel) {
			await updateModifyChannel(cache, modifyChannel as TextChannel)
		}
	}

	if (CreateRegex) {
		if (cache.getDraft()) {
			// : Cannot create draft because draft already exists
			clear(5000)
			await sendMessage("Try using `--discard` to discard current assignment an create a new one", 6000)
			return
		}

		const CreateNameRegex = match(message, "^--create (.+)")

		if (!CreateNameRegex) {
			// : No name given to new draft
			clear(5000)
			await sendMessage("Try adding the assignment name after the `--create` command", 6000)
			return
		}

		const [, name] = CreateNameRegex
		const assignment = new Draft(cache, cache.generateAssignmentId(), "", name, new Date().getTime(), [])
		await assignment.saveToFirestore()
		cache.setDraft(assignment)
		await updateModifyChannelInline()

		// *
		clear(8000)
		await sendMessage("Created draft assignment", 9000)
		await sendMessage("When is this assignment due (24h format)? `--date <DD>/<MM>/<YYYY> <hh>:<mm>`", 9000)
	} else if (EditRegex) {
		if (cache.getDraft()) {
			// : Cannot edit draft because draft already exists
			clear(5000)
			await sendMessage("Try using `--discard` to discard current assignment an create a new one", 6000)
			return
		}

		const EditIdRegex = match(message, "^--edit (.+)")

		if (!EditIdRegex) {
			// : No id given to reference an assignment
			clear(5000)
			await sendMessage("Try adding the assignment id after the `--edit` command", 6000)
			return
		}

		const [, id] = EditIdRegex
		const assignment = cache.getAssignment(id)

		if (!assignment) {
			// : No assignment exists for given id
			clear(5000)
			await sendMessage("No such assignment", 6000)
			return
		}

		const draft = await assignment.toDraft(cache)
		await draft.saveToFirestore()
		cache.setDraft(draft)
		await updateNotifyChannelInline()
		await updateModifyChannelInline()

		// *
		clear(6000)
		await sendMessage(
			"Try using `--date`, `--info ++ <detail to add>` or `--info -- <index to remove>` to edit info about assignment",
			7000
		)
	} else if (DeleteRegex) {
		const DeleteIdRegex = match(message, "^--delete (.+)")

		if (!DeleteIdRegex) {
			// : No id given to reference an assignment
			clear(5000)
			await sendMessage("Try adding the assignment id after the `--delete` command", 6000)
			return
		}

		const [, id] = DeleteIdRegex
		const assignment = cache.getAssignment(id)

		if (!assignment) {
			// : No assignment exists for given id
			clear(5000)
			await sendMessage("No such assignment", 6000)
			return
		}

		await cache.removeAssignment(id)
		await updateNotifyChannelInline()

		// *
		clear(5000)
		await message.react(CHECK_MARK)
	} else if (DiscardRegex) {
		if (!draft) {
			// : No draft to discard
			clear(5000)
			await sendMessage("No draft to discard", 6000)
			return
		}
		await cache.removeDraft()
		await updateModifyChannelInline()

		// *
		clear(5000)
		await message.react(CHECK_MARK)
	} else if (NameRegex) {
		if (!draft) {
			// : Cannot edit draft because draft doesn't exists
			clear(5000)
			await sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		const FullNameRegex = match(message, "^--name (.+)")

		if (!FullNameRegex) {
			// : No new name given to draft
			clear(5000)
			await sendMessage("Make sure to add the name after the `--name`", 6000)
			return
		}

		const [, name] = FullNameRegex
		await draft.setName(name)
		await updateModifyChannelInline()

		// *
		clear(5000)
		await message.react(CHECK_MARK)
	} else if (DateRegex) {
		if (!draft) {
			// : Cannot edit draft because draft doesn't exists
			clear(5000)
			await sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		const FullDateRegex = match(message, "^--date (\\d{2})\\/(\\d{2})\\/(\\d{4}) (\\d{2}):(\\d{2})")

		if (!FullDateRegex) {
			// : No new date given to draft
			clear(5000)
			await sendMessage("Make sure the date is in the format `<DD>/<MM>/<YYYY> <hh>:<mm>`", 6000)
			return
		}

		const date = verifyDate(FullDateRegex, async err => {
			// : Invalid date given to draft
			clear(5000)
			await sendMessage(err, 6000)
		})

		if (date instanceof Date) {
			await draft.setDate(date.getTime())
			await updateModifyChannelInline()

			// *
			clear(12000)
			await sendMessage("Got it. The assignment is due on " + date, 13000)
			if (!cache.getDraft()!.getDetails().length)
				await sendMessage(
					"Add details about this assignment line by line with `--info ++ <detail to add>`\nWhen you're done, use `--done` to finish",
					13000
				)
		}
	} else if (InfoRegex) {
		if (!draft) {
			// : Cannot edit draft because draft doesn't exists
			clear(5000)
			await sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		const AddInfoRegex = match(message, "^--info \\+\\+ (.+)")
		const RemoveInfoRegex = match(message, "^--info -- (\\d+)")

		if (AddInfoRegex) {
			const [, info] = AddInfoRegex

			const draft = cache.getDraft()!
			await draft.pushDetail(info)
			await updateModifyChannelInline()

			// *
			clear(5000)
			await message.react(CHECK_MARK)
		} else if (RemoveInfoRegex) {
			const [, index] = RemoveInfoRegex

			const indexInt = parseInt(index) - 1
			if (indexInt < cache.getDraft()!.getDetails().length) {
				await draft.removeDetail(indexInt)
				await updateModifyChannelInline()

				// *
				clear(5000)
				await message.react(CHECK_MARK)
			} else {
				// : Item doesn't exist
				clear(5000)
				await sendMessage("Info at index " + indexInt + " doesn't exist", 6000)
			}
		} else {
			// : Invalid command
			clear(5000)
			await sendMessage(
				"Try using `--info ++ <detail to add>` or `--info -- <index to remove>` to add or remove info",
				6000
			)
		}
	} else if (DoneRegex) {
		if (!draft) {
			// :
			clear(5000)
			await sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		if (draft.getDate() < new Date().getTime()) {
			// :
			clear(5000)
			await sendMessage("Try using `--date <DD>/<MM>/<YYYY> <hh>:<mm>` to add a date to the assignment", 6000)
			return
		}

		await cache.pushAssignment(draft)
		await cache.removeDraft()
		await updateNotifyChannelInline()
		await updateModifyChannelInline()

		// *
		clear(5000)
		await sendMessage("Assignment added! :white_check_mark:", 6000)
	} else if (!ModifyHereRegex) {
		clear(3000)
		await sendMessage("Invalid command", 4000)
	}
})

bot.on("guildCreate", async guild => {
	console.log(`Added to Guild(${guild.name})`)
	await botCache.createGuildCache(guild.id)
})

bot.on("guildDelete", async guild => {
	console.log(`Removed from Guild(${guild.name})`)
	await botCache.deleteGuildCache(guild.id)
})

const match = (message: Message, regexp: string) => message.content.match(new RegExp(regexp))
