import getColors  from 'get-image-colors'
import fs from 'fs'
import path from 'path'
import { scanFolder, getImagePath } from './common.js'

const IMG_PATH   = getImagePath() // percorso delle cartella delle immagini (relativo a questo script)
const JSON_PATH  = path.join("..", "data_colors_3.json") // Nome del file per il salvataggio dei dati

// numero di colori da estrarre
const NUM_COLORS = 9

run()

async function run() {

	console.log(IMG_PATH)

	const files = scanFolder(IMG_PATH)


	const data = []

	// Inizio cronometro...
	const t0 = (new Date()).getTime()

	let count = 0

	for (const file of files) {

		try {
			console.log("Carico file ["+ (count++) +"]: " + file + "..." )

			let Colors = []
			await getColors(path.join(IMG_PATH, file), {
				count: NUM_COLORS
			}).then(colors => {
				Colors = colors.map(color => color.hex())
			})

			// print
			// console.log('File: ' + file, Colors)

			data.push({
				FileName      : path.parse(file).name,
				FileExtension : ".jpg",
				Colors
			})
		} catch (e) {
			console.log("ERRORE!")
			console.log(e)
		}
	}

	// ...fine cronometro
	const t1 = (new Date()).getTime()

	console.log()
	console.log("Tempo impiegato: " + (t1 - t0) + "ms")
	console.log("Numero di immagini analizzate: " + data.length)
	console.log("Scrivo dati nel file: " + JSON_PATH + "...")
	fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 4), 'utf8')
	console.log("Fatto!")
	console.log(":)")

}

