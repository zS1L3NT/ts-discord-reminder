export default (): string => {
	const lines: string[] = []
	lines.push("`--create <task name>`")
	lines.push("`--edit <task id>`")
	lines.push("`--delete <task id>`")
	lines.push("`--discard`")
	lines.push("`--date <DD>/<MM>/<YYYY> <hh>:<mm>`")
	lines.push("`--info ++ <information to add>`")
	lines.push("`--info -- <index of information to remove>`")
	lines.push("`--done`")
	
	return lines.join("\n")
}