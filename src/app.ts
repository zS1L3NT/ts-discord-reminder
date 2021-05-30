import { Client, Message } from "discord.js"
import verifyDate from "./verifyDate"
import formatAssignments from "./formatAssignments"
import LocalStorage, { Assignment } from "./repository"

const bot = new Client()
const localStorage = new LocalStorage()
const CHECK_MARK = "✔"

bot.login(require("../discordToken.json"))
bot.on("ready", () => {
	console.log("Logged in as Assignment Bot#2744")
	bot.guilds.cache.forEach(guild => {
		localStorage.getLocalCache(guild.id)
	})
})

bot.on("message", async message => {
	const channelId = message.channel.id
	const send = message.channel.send.bind(message.channel)
	const cache = await localStorage.getLocalCache(message.guild!.id)
	const builder = () => cache.getBuilder(message.channel.id)

	const SendHereRegex = match(message, "^--sendhere$")
	const MainRegex = match(message, "^--assignment")
	const DateRegex = match(message, "^--date")
	const InfoRegex = match(message, "^--info")
	const DoneRegex = match(message, "^--done$")

	if (SendHereRegex) {
		const m = await send("...")
		cache.setTimer(setInterval(() => update(cache.getAssignments(), m.edit.bind(m)), 5 * 1000))
	} else if (MainRegex) {
		const CreateRegex = match(message, "^--assignment --create")
		const EditRegex = match(message, "^--assignment --edit")
		const DeleteRegex = match(message, "^--assignment --delete")
		const DiscardRegex = match(message, "^--assignment --discard")

		if (builder() && !DiscardRegex) {
			// !
			send("Try using `--assignment --discard` to discard current assignment an create a new one")
			return
		}

		if (CreateRegex) {
			const CreateNameRegex = match(message, "^--assignment --create (.+)")

			if (!CreateNameRegex) {
				// !
				send("Try adding the assignment name after the `--assignment --create` command")
				return
			}

			const [_, name] = CreateNameRegex
			cache.setBuilder(channelId, {
				name,
				date: new Date().getTime(),
				details: []
			})

			// *
			send("Created draft assignment")
			send("When is this assignment due (24h format)? `--date DD/MM/YYYY hh:mm`")
		} else if (EditRegex) {
			const EditNameRegex = match(message, "^--assignment --edit (.+)")

			if (!EditNameRegex) {
				// !
				send("Try adding the assignment name after the `--assignment --edit` command")
				return
			}

			const [_, name] = EditNameRegex
			const assignment = cache.getAssignment(name)

			if (!assignment) {
				// !
				send("No such assignment")
				return
			}

			cache.removeAssignment(name)
			cache.setBuilder(channelId, assignment)
			// *
			send("Try using `--date`, `--info ++ ...` or `--info -- 1` to edit info about assignment")
		} else if (DeleteRegex) {
			const DeleteNameRegex = match(message, "^--assignment --delete (.+)")

			if (!DeleteNameRegex) {
				// !
				send("Try adding the assignment name after the `--assignment --delete` command")
				return
			}

			const [_, name] = DeleteNameRegex
			const assignment = cache.getAssignment(name)

			if (!assignment) {
				// !
				send("No such assignment")
				return
			}

			cache.removeAssignment(name)
			// *
			message.react(CHECK_MARK)
		} else if (DiscardRegex) {
			if (!builder()) {
				send("No draft to discard")
				return
			}
			cache.removeBuilder(channelId)
			// *
			message.react(CHECK_MARK)
		} else {
			// !
			send("Try using `--create`, `--edit` or `--delete` after the `--assignment` command")
		}
	} else if (DateRegex) {
		if (!builder()) {
			// !
			send("Try using `--assignment --create` to create an assignment draft first")
			return
		}

		const FullDateRegex = match(message, "^--date (\\d{2})\\/(\\d{2})\\/(\\d{4}) (\\d{2}):(\\d{2})")

		if (!FullDateRegex) {
			// !
			send("Make sure the date is in the format `DD/MM/YYYY hh:mm`")
			return
		}

		const date = verifyDate(FullDateRegex, err => send(err))
		if (date instanceof Date) {
			const assignment = builder()
			assignment.date = date.getTime()
			cache.setBuilder(channelId, assignment)

			send("Got it. The assignment is due on " + date)
			if (!builder().details?.length)
				send(
					"Add details about this assignment line by line with `--info ++ ...`\nWhen you're done, use `--done` to finish"
				)
		}
	} else if (InfoRegex) {
		if (!builder()) {
			// !
			send("Try using `--assignment --create` to create an assignment draft first")
			return
		}

		const AddInfoRegex = match(message, "^--info \\+\\+ (.+)")
		const RemoveInfoRegex = match(message, "^--info -- (\\d+)")

		if (AddInfoRegex) {
			const [_, info] = AddInfoRegex

			const assignment = builder()
			assignment.details ? assignment.details.push(info) : (assignment.details = [info])
			cache.setBuilder(channelId, assignment)
			// *
			message.react(CHECK_MARK)
		} else if (RemoveInfoRegex) {
			const [_, index] = RemoveInfoRegex

			const indexInt = parseInt(index) - 1
			if (indexInt < (builder().details?.length || -Infinity)) {
				const assignment = builder()
				assignment.details!.splice(indexInt, 1)
				cache.setBuilder(channelId, assignment)
				// *
				message.react(CHECK_MARK)
			} else {
				// !
				send("Info #" + indexInt + " doesn't exist")
			}
		} else {
			// !
			send("Try using `--info ++ ...` or `--info -- 1` to add or remove info")
		}
	} else if (DoneRegex) {
		const assignment = builder()
		if (!assignment) {
			// !
			send("Try using `--assignment --create` to create an assignment draft first")
			return
		}

		if (!assignment.date) {
			// !
			send("Try using `--date DD/MM/YYYY hh:mm` to add a date to the assignment")
			return
		}

		cache.setAssignment(assignment)
		cache.removeBuilder(channelId)
		// *
		send("Assignment added! :white_check_mark:")
	}
})

const match = (message: Message, regexp: string) => message.content.match(new RegExp(regexp))
const update = (assignments: Assignment[], edit: (message: string) => void) => {
	if (assignments.length > 0) edit(formatAssignments(assignments))
	else edit("No assignments due")
}
