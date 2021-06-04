const days_of_week: {
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

const name_of_months = [
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

export default (due: number) => {
	const date = new Date(due)
	let localDate: Date
	if (date.getUTCHours() === date.getHours()) {
		// Wrong timezone, in UK
		localDate = new Date(due + 28800000)
	} else {
		localDate = date
	}

	const day_of_week = days_of_week[localDate.toDateString().slice(0, 3)]
	const date_in_month = localDate.getDate()
	const name_of_month = name_of_months[localDate.getMonth()]
	const year = localDate.getFullYear()

	const hours = localDate.getHours()
	const minutes = localDate.getMinutes()
	const time = hours > 12 ? `${hours - 12}:${minutes}pm` : `${hours}:${minutes}am`

	return `${day_of_week}, ${date_in_month} ${name_of_month} ${year} at ${time}`
}