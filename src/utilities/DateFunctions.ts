export default class DateFunctions {
	private readonly time: number
	private readonly days_of_week: {
		[day: string]: string
	} = {
		Mon: "Monday",
		Tue: "Tuesday",
		Wed: "Wednesday",
		Thu: "Thursday",
		Fri: "Friday",
		Sat: "Saturday",
		Sun: "Sunday"
	}
	private readonly name_of_months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	]

	public constructor(time: number) {
		this.time = time
	}

	public static verify(FullDateMatch: string[]) {
		const [day, month, year, hour, minute] = FullDateMatch
		const LongerMonths = [1, 3, 5, 7, 8, 10, 12]

		const dayInt = parseInt(day)
		const monthInt = parseInt(month)
		const yearInt = parseInt(year)
		const hourInt = parseInt(hour)
		const minuteInt = parseInt(minute)

		if (LongerMonths.includes(monthInt)) {
			if (dayInt > 31)
				throw new Error(`This month cannot have ${dayInt} days`)
		} else {
			if (dayInt > 30)
				throw new Error(`This month cannot have ${dayInt} days`)
		}

		if (monthInt > 12)
			throw new Error(`A year cannot have ${monthInt} months`)

		if (yearInt < new Date().getFullYear())
			throw new Error("Year must not be in the past")
		if (yearInt - new Date().getFullYear() > 5)
			throw new Error("Year must not be more than 5 years ahead")

		if (hourInt > 23) throw new Error("Hour must not exceed 23")

		if (minuteInt > 59) throw new Error("Minute must not exceed 59")

		// Handle timezone change
		if (new Date().getUTCHours() == new Date().getHours()) {
			let UTC_hour = hourInt - 8
			if (UTC_hour < 0) UTC_hour += 24
			return new Date(yearInt, monthInt - 1, dayInt, UTC_hour, minuteInt)
		}
		return new Date(yearInt, monthInt - 1, dayInt, hourInt, minuteInt)
	}

	public isBetweenRange(actual: number, range: number) {
		const high = actual + range
		const low = actual - range
		return this.time >= low && this.time <= high
	}

	public getDueIn() {
		const ms = this.time - new Date().getTime() + 30000

		if (ms < 1000) {
			return "NOW"
		}

		const s = Math.floor(ms / 1000)
		if (s < 60) {
			return "Less than 1m"
		}

		const m = Math.floor(s / 60)
		if (m < 60) {
			return m + "m"
		}

		const h = Math.floor(m / 60)
		const mr = m % 60
		if (h < 24) {
			return h + "h " + mr + "m"
		}

		const d = Math.floor(h / 24)
		const hr = h % 24
		if (d < 7) {
			return d + "d " + hr + "h " + mr + "m"
		}

		const w = Math.floor(d / 7)
		const dr = d % 7
		return w + "w " + dr + "d " + hr + "h " + mr + "m"
	}

	public getDueDate() {
		const date = new Date(this.time)
		let localDate: Date
		if (date.getUTCHours() === date.getHours()) {
			// Wrong timezone, in UK
			localDate = new Date(this.time + 28800000)
		} else {
			localDate = date
		}

		const day_of_week =
			this.days_of_week[localDate.toDateString().slice(0, 3)]
		const date_in_month = localDate.getDate()
		const name_of_month = this.name_of_months[localDate.getMonth()]
		const year = localDate.getFullYear()

		const hours = localDate.getHours()
		const minutes = localDate.getMinutes()

		const time =
			hours >= 12
				? hours === 12
					? `12:${minutes.toString().padStart(2, "0")}pm`
					: `${(hours - 12).toString().padStart(2, "0")}:${minutes
							.toString()
							.padStart(2, "0")}pm`
				: `${hours.toString().padStart(2, "0")}:${minutes
						.toString()
						.padStart(2, "0")}am`

		return `${day_of_week}, ${date_in_month} ${name_of_month} ${year} at ${time}`
	}
}
