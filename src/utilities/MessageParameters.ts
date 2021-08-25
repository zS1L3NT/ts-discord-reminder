import { Message } from "discord.js"
import GuildCache from "../models/GuildCache"

const time = (ms: number) => new Promise(res => setTimeout(res, ms))

const Match =
	(message: Message): iMatch =>
	(regexp: string) => {
		const regex = message.content.match(new RegExp(regexp))
		return regex ? regex.slice(1) : null
	}
type iMatch = (regexp: string) => string[] | null

const MatchOnly =
	(message: Message): iMatchOnly =>
	(command: string) => {
		const regex = message.content.match(
			new RegExp(`^${command}(?:(?= *$)(?!\\w+))`)
		)
		return regex ? regex.slice(1) : null
	}
type iMatchOnly = (command: string) => string[] | null

const MatchMore =
	(message: Message): iMatchMore =>
	(command: string) => {
		const regex = message.content.match(
			new RegExp(`^${command}(?:(?= *)(?!\\w+))`)
		)
		return regex ? regex.slice(1) : null
	}
type iMatchMore = (command: string) => string[] | null

const Clear =
	(message: Message): iClear =>
	(ms: number) =>
		setTimeout(() => {
			message.delete().catch(() => {})
		}, ms)
type iClear = (ms: number) => NodeJS.Timeout

const React =
	(message: Message): iReact =>
	(reaction: string) => {
		void message.react(reaction)
	}
type iReact = (reaction: string) => void

const Respond =
	(message: Message): iRespond =>
	(text: string, ms: number) => {
		message.channel.send(text).then(async temporary => {
			await time(ms)
			await temporary.delete().catch(() => {})
		})
	}
type iRespond = (text: string, ms: number) => void

type iDip = (command: string) => void
export const MessageParameters = (
	cache: GuildCache,
	message: Message,
	dip: iDip
): iMessageParameters => ({
	dip: dip,
	cache: cache,
	message,
	Match: Match(message),
	MatchOnly: MatchOnly(message),
	MatchMore: MatchMore(message),
	Clear: Clear(message),
	React: React(message),
	Respond: Respond(message),
	CHECK_MARK: "✅",
	CROSS_MARK: "❌"
})

export interface iMessageParameters {
	dip: iDip
	cache: GuildCache
	message: Message
	Match: iMatch
	MatchOnly: iMatchOnly
	MatchMore: iMatchMore
	Clear: iClear
	React: iReact
	Respond: iRespond
	CHECK_MARK: "✅"
	CROSS_MARK: "❌"
}
