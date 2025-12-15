export default async function loadLesson(){
	const data = await fetch('/lessons/lesson1.json');
	const response = await data.text()
	const json = JSON.parse(response)
	console.log(json)
	return json
}
