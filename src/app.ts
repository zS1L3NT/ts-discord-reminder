import { Client, Message, TextChannel } from "discord.js"
import { verifyDate, BotCache, Draft, updateNotifyChannel, updateChannels } from "./all"

const bot = new Client()
const localStorage = new BotCache()
const time = (ms: number) => new Promise(res => setTimeout(res, ms))
const CHECK_MARK = "✅"

bot.login(require("../discordToken.json"))
bot.on("ready", () => {
	console.log("Logged in as Assignment Bot#2744")
	bot.guilds.cache.forEach(async guild => {
		const cache = await localStorage.getLocalCache(guild.id)
		console.log(`Restored state for Guild(${guild.name})`)

		await updateChannels(guild, cache)
		setInterval(async () => await updateChannels(guild, cache), 30 * 1000)
	})
})

bot.on("message", async message => {
	const cache = await localStorage.getLocalCache(message.guild!.id)

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
	const cache = await localStorage.getLocalCache(message.guild!.id)
	const clear = (ms: number) => setTimeout(message.delete.bind(message), ms)
	if (message.channel.id !== cache.getModifyChannelId()) return
	if (message.author.bot) return

	const sendMessage = async (text: string, ms: number) => {
		const temporary = await message.channel.send(text)
		await time(ms)
		temporary.delete()
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
	const updateNotifyChannelInline = async () => {
		const channel = message.guild!.channels.cache.get(cache.getNotifyChannelId())
		if (channel) {
			await updateNotifyChannel(cache, channel as TextChannel)
		}
	}

	if (CreateRegex) {
		if (cache.getDraft()) {
			// :
			clear(5000)
			sendMessage("Try using `--discard` to discard current assignment an create a new one", 6000)
			return
		}

		const CreateNameRegex = match(message, "^--create (.+)")

		if (!CreateNameRegex) {
			// :
			clear(5000)
			sendMessage("Try adding the assignment name after the `--create` command", 6000)
			return
		}

		const [_, name] = CreateNameRegex
		const assignment = new Draft(cache, cache.generateAssignmentId(), "", name, new Date().getTime(), [])
		await assignment.init()
		cache.setDraft(assignment)

		// *
		clear(8000)
		sendMessage("Created draft assignment", 9000)
		sendMessage("When is this assignment due (24h format)? `--date DD/MM/YYYY hh:mm`", 9000)
	} else if (EditRegex) {
		if (cache.getDraft()) {
			// :
			clear(5000)
			sendMessage("Try using `--discard` to discard current assignment an create a new one", 6000)
			return
		}

		const EditIdRegex = match(message, "^--edit (.+)")

		if (!EditIdRegex) {
			// :
			clear(5000)
			sendMessage("Try adding the assignment id after the `--edit` command", 6000)
			return
		}

		const [_, id] = EditIdRegex
		const assignment = cache.getAssignment(id)

		if (!assignment) {
			// :
			clear(5000)
			sendMessage("No such assignment", 6000)
			return
		}

		const draft = await assignment.toDraft(cache)
		await draft.init()
		cache.setDraft(draft)
		await updateNotifyChannelInline()

		// *
		clear(6000)
		sendMessage("Try using `--date`, `--info ++ ...` or `--info -- 1` to edit info about assignment", 7000)
	} else if (DeleteRegex) {
		const DeleteIdRegex = match(message, "^--delete (.+)")

		if (!DeleteIdRegex) {
			// :
			clear(5000)
			sendMessage("Try adding the assignment id after the `--delete` command", 6000)
			return
		}

		const [_, id] = DeleteIdRegex
		const assignment = cache.getAssignment(id)

		if (!assignment) {
			// :
			clear(5000)
			sendMessage("No such assignment", 6000)
			return
		}

		await cache.removeAssignment(id)
		await updateNotifyChannelInline()

		// *
		clear(5000)
		message.react(CHECK_MARK)
	} else if (DiscardRegex) {
		if (!draft) {
			clear(5000)
			sendMessage("No draft to discard", 6000)
			return
		}
		await cache.removeDraft()
		// *
		clear(5000)
		message.react(CHECK_MARK)
	} else if (NameRegex) {
		if (!draft) {
			// :
			clear(5000)
			sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		const FullNameRegex = match(message, "^--name (.+)")

		if (!FullNameRegex) {
			// :
			clear(5000)
			sendMessage("Make sure to add the name after the `--name`", 6000)
			return
		}

		const [_, name] = FullNameRegex
		await draft.setName(name)

		// *
		clear(5000)
		message.react(CHECK_MARK)
	} else if (DateRegex) {
		if (!draft) {
			// :
			clear(5000)
			sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		const FullDateRegex = match(message, "^--date (\\d{2})\\/(\\d{2})\\/(\\d{4}) (\\d{2}):(\\d{2})")

		if (!FullDateRegex) {
			// :
			clear(5000)
			sendMessage("Make sure the date is in the format `DD/MM/YYYY hh:mm`", 6000)
			return
		}

		const date = verifyDate(FullDateRegex, err => {
			clear(5000)
			sendMessage(err, 6000)
		})

		if (date instanceof Date) {
			await draft.setDate(date.getTime())

			// *
			clear(12000)
			sendMessage("Got it. The assignment is due on " + date, 13000)
			if (!cache.getDraft()!.getDetails().length)
				sendMessage(
					"Add details about this assignment line by line with `--info ++ ...`\nWhen you're done, use `--done` to finish",
					13000
				)
		}
	} else if (InfoRegex) {
		if (!draft) {
			// :
			clear(5000)
			sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		const AddInfoRegex = match(message, "^--info \\+\\+ (.+)")
		const RemoveInfoRegex = match(message, "^--info -- (\\d+)")

		if (AddInfoRegex) {
			const [_, info] = AddInfoRegex

			const draft = cache.getDraft()!
			draft.pushDetail(info)

			// *
			clear(5000)
			message.react(CHECK_MARK)
		} else if (RemoveInfoRegex) {
			const [_, index] = RemoveInfoRegex

			const indexInt = parseInt(index) - 1
			if (indexInt < cache.getDraft()!.getDetails().length) {
				draft.removeDetail(indexInt)

				// *
				clear(5000)
				message.react(CHECK_MARK)
			} else {
				// :
				clear(5000)
				sendMessage("Info #" + indexInt + " doesn't exist", 6000)
			}
		} else {
			// :
			clear(5000)
			sendMessage("Try using `--info ++ ...` or `--info -- 1` to add or remove info", 6000)
		}
	} else if (DoneRegex) {
		if (!draft) {
			// :
			clear(5000)
			sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		if (draft.getDate() < new Date().getTime()) {
			// :
			clear(5000)
			sendMessage("Try using `--date DD/MM/YYYY hh:mm` to add a date to the assignment", 6000)
			return
		}

		await cache.pushAssignment(draft)
		await cache.removeDraft()
		await updateNotifyChannelInline()

		// *
		clear(5000)
		sendMessage("Assignment added! :white_check_mark:", 6000)
	} else if (!ModifyHereRegex) {
		clear(3000)
		sendMessage("Invalid command", 4000)
	}
})

const match = (message: Message, regexp: string) => message.content.match(new RegExp(regexp))
