import colors from "colors"
import Tracer from "tracer"
import {} from "discord.js"

export default Tracer.colorConsole({
	level: process.env.LOG_LEVEL || "log",
	format: [
		"[{{timestamp}}] <{{path}}> {{message}}",
		{
			alert: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			warn: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			error: "[{{timestamp}}] <{{path}}, Line {{line}} at {{pos}}> {{message}}"
		}
	],
	methods: ["log", "discord", "debug", "info", "alert", "warn", "error"],
	dateformat: "dd mmm yyyy, hh:MM:sstt",
	filters: {
		log: colors.grey,
		discord: colors.cyan,
		debug: colors.blue,
		info: colors.green,
		alert: colors.yellow,
		warn: colors.yellow.bold.italic,
		error: colors.red.bold.italic
	},
	preprocess: data => {
		data.path = data.path
			.replaceAll("\\", "/")
			.split("nova-bot")
			.at(-1)!
			.replace(/^\/dist/, "nova-bot")
		data.path = data.path
			.replaceAll("\\", "/")
			.split("ts-discord-reminder")
			.at(-1)!
			.replace(/^\/(dist|src)/, "src")
	}
})
