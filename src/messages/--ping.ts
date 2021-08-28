import { iMessageFile } from "../utilities/BotSetupHelper"
import MessageHelper from "../utilities/MessageHelper"

module.exports = {
	data: "--ping",
	condition: helper => !!helper.matchOnly("--ping"),
	execute: async (helper: MessageHelper) => {
		helper.clearAfter(5000)
		helper.reactSuccess()
		helper.respond("pong", 6000)
	}
} as iMessageFile
