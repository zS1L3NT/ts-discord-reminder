import colors from "colors"
import Tracer from "tracer"

export default Tracer.colorConsole({
	level: process.env.LOG_LEVEL || "log",
	format: [
		"[{{timestamp}}] {{message}}",
		{
			alert: "[{{timestamp}}] {{message}}",
			warn: "[{{timestamp}}] {{message}}",
			error: "[{{timestamp}}] {{message}}"
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
	}
})
