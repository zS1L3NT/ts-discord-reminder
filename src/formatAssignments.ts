import { Assignment } from "./repository"
import formatDate from "./formatDate"

export default (assignments: Assignment[]) =>
	assignments
		.map(assignment => {
			const lines: string[] = []
			lines.push(`**${assignment.name}**`)
			lines.push(`Due: **${formatDate(assignment.date)}**`)
			lines.push(`ID: \`${assignment.id}\``)
			if (assignment.details.length > 0) {
				lines.push(`Information:`)
				assignment.details.forEach((detail, i) => lines.push(`${i + 1}: ${detail}`))
			}
			return lines.join("\n")
		})
		.join("\n────────────────────────\n")
