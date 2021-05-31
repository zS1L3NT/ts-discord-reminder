import { Client, Message } from "discord.js"
import verifyDate from "./verifyDate"
import formatAssignments from "./formatAssignments"
import modifyText from "./modifyText"
import LocalStorage from "./repository"

const bot = new Client()
const localStorage = new LocalStorage()
const time = (ms: number) => new Promise(res => setTimeout(res, ms))
const CHECK_MARK = "✅"

bot.login(require("../discordToken.json"))
bot.on("ready", () => {
	console.log("Logged in as Assignment Bot#2744")
	bot.guilds.cache.forEach(guild => {
		localStorage.getLocalCache(guild.id)
	})
})

bot.on("message", async message => {
	const send = message.channel.send.bind(message.channel)
	const cache = await localStorage.getLocalCache(message.guild!.id)

	const NotifyHereRegex = match(message, "^--notify-here$")
	const ModifyHereRegex = match(message, "^--modify-here$")

	if (NotifyHereRegex) {
		await message.react(CHECK_MARK)
		const main = await send("...")
		cache.setModifyTimer(
			setInterval(() => {
				if (cache.getAssignments().length > 0) {
					main.edit(formatAssignments(cache.getAssignments()))
				} else {
					main.edit("No assignments due")
				}
			}, 5 * 1000)
		)

		await time(3000)
		await message.delete()
	} else if (ModifyHereRegex) {
		await message.react(CHECK_MARK)
		const main = await send("...")
		cache.setModifyChannelId(message.channel.id)
		cache.setNotifyTimer(
			setInterval(() => {
				const draft = cache.getDraft()
				main.edit((draft ? "**Draft**:\n" + formatAssignments([draft]) : "**No draft**") + "\n\n" + modifyText())
			}, 5 * 1000)
		)

		await time(3000)
		await message.delete()
	}
})

// ? Handle the modify channel
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
	const DateRegex = match(message, "^--date")
	const InfoRegex = match(message, "^--info")
	const DoneRegex = match(message, "^--done$")

	if (CreateRegex) {
		if (cache.getDraft()) {
			// !
			clear(5000)
			sendMessage("Try using `--discard` to discard current assignment an create a new one", 6000)
			return
		}

		const CreateNameRegex = match(message, "^--create (.+)")

		if (!CreateNameRegex) {
			// !
			clear(5000)
			sendMessage("Try adding the assignment name after the `--create` command", 6000)
			return
		}

		const [_, name] = CreateNameRegex
		await cache.setDraft({
			id: cache.generateAssignmentId(),
			name,
			date: new Date().getTime(),
			details: []
		})

		// *
		clear(8000)
		sendMessage("Created draft assignment", 9000)
		sendMessage("When is this assignment due (24h format)? `--date DD/MM/YYYY hh:mm`", 9000)
	} else if (EditRegex) {
		if (cache.getDraft()) {
			// !
			clear(5000)
			sendMessage("Try using `--discard` to discard current assignment an create a new one", 6000)
			return
		}

		const EditIdRegex = match(message, "^--edit (.+)")

		if (!EditIdRegex) {
			// !
			clear(5000)
			sendMessage("Try adding the assignment id after the `--edit` command", 6000)
			return
		}

		const [_, id] = EditIdRegex
		const assignment = cache.getAssignment(id)

		if (!assignment) {
			// !
			clear(5000)
			sendMessage("No such assignment", 6000)
			return
		}

		await cache.removeAssignment(id)
		await cache.setDraft(assignment)
		// *
		clear(6000)
		sendMessage("Try using `--date`, `--info ++ ...` or `--info -- 1` to edit info about assignment", 7000)
	} else if (DeleteRegex) {
		const DeleteIdRegex = match(message, "^--delete (.+)")

		if (!DeleteIdRegex) {
			// !
			clear(5000)
			sendMessage("Try adding the assignment id after the `--delete` command", 6000)
			return
		}

		const [_, id] = DeleteIdRegex
		const assignment = cache.getAssignment(id)

		if (!assignment) {
			// !
			clear(5000)
			sendMessage("No such assignment", 6000)
			return
		}

		await cache.removeAssignment(id)
		// *
		clear(5000)
		message.react(CHECK_MARK)
	} else if (DiscardRegex) {
		if (!cache.getDraft()) {
			clear(5000)
			sendMessage("No draft to discard", 6000)
			return
		}
		await cache.removeDraft()
		// *
		clear(5000)
		message.react(CHECK_MARK)
	} else if (DateRegex) {
		if (!cache.getDraft()) {
			// !
			clear(5000)
			sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		const FullDateRegex = match(message, "^--date (\\d{2})\\/(\\d{2})\\/(\\d{4}) (\\d{2}):(\\d{2})")

		if (!FullDateRegex) {
			// !
			clear(5000)
			sendMessage("Make sure the date is in the format `DD/MM/YYYY hh:mm`", 6000)
			return
		}

		const date = verifyDate(FullDateRegex, err => {
			clear(5000)
			sendMessage(err, 6000)
		})

		if (date instanceof Date) {
			const assignment = cache.getDraft()!
			assignment.date = date.getTime()
			await cache.setDraft(assignment)

			clear(12000)
			sendMessage("Got it. The assignment is due on " + date, 13000)
			if (!cache.getDraft()!.details.length)
				sendMessage(
					"Add details about this assignment line by line with `--info ++ ...`\nWhen you're done, use `--done` to finish",
					13000
				)
		}
	} else if (InfoRegex) {
		if (!cache.getDraft()) {
			// !
			clear(5000)
			sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		const AddInfoRegex = match(message, "^--info \\+\\+ (.+)")
		const RemoveInfoRegex = match(message, "^--info -- (\\d+)")

		if (AddInfoRegex) {
			const [_, info] = AddInfoRegex

			const assignment = cache.getDraft()!
			assignment.details.push(info)
			await cache.setDraft(assignment)
			// *
			clear(5000)
			message.react(CHECK_MARK)
		} else if (RemoveInfoRegex) {
			const [_, index] = RemoveInfoRegex

			const indexInt = parseInt(index) - 1
			if (indexInt < cache.getDraft()!.details.length) {
				const assignment = cache.getDraft()!
				assignment.details.splice(indexInt, 1)
				await cache.setDraft(assignment)
				// *
				clear(5000)
				message.react(CHECK_MARK)
			} else {
				// !
				clear(5000)
				sendMessage("Info #" + indexInt + " doesn't exist", 6000)
			}
		} else {
			// !
			clear(5000)
			sendMessage("Try using `--info ++ ...` or `--info -- 1` to add or remove info", 6000)
		}
	} else if (DoneRegex) {
		const assignment = cache.getDraft()
		if (!assignment) {
			// !
			clear(5000)
			sendMessage("Try using `--create` to create an assignment draft first", 6000)
			return
		}

		if (assignment.date < new Date().getTime()) {
			// !
			clear(5000)
			sendMessage("Try using `--date DD/MM/YYYY hh:mm` to add a date to the assignment", 6000)
			return
		}

		await cache.setAssignment(assignment)
		await cache.removeDraft()
		// *
		clear(5000)
		sendMessage("Assignment added! :white_check_mark:", 6000)
	} else if (!ModifyHereRegex) {
		clear(3000)
		sendMessage("Invalid command", 4000)
	}
})

const match = (message: Message, regexp: string) => message.content.match(new RegExp(regexp))
