import exifr from 'exifr'
import fs from 'fs'
import path from 'path'
import { scanFolder, getImagePath } from './common.js'

const IMG_PATH  = getImagePath()    // percorso delle cartella delle immagini (relativo a questo script)
const JSON_PATH = path.join("..", "data_exif.json") // Nome del file per il salvataggio dei dati

// È possibile selezionare solo i campi desiderati:
// const FILTRO = ['ISO', 'Orientation', 'LensModel']
// ...oppure inserirli tutti:
const FILTRO = undefined

run()

async function run() {
	const files = scanFolder(IMG_PATH)

	const data = []

	// Inizio cronometro...
	const t0 = (new Date()).getTime()

	for (const file of files) {
		await exifr.parse(path.join(IMG_PATH, file), FILTRO).then(output => {
			console.log("File: " + file)

			data.push({
				// ImageWidth : output.ExifImageWidth,
				// ImageHeight : output.ExifImageHeight,
				FileName : path.parse(file).name,
				FileExtension : path.extname(file),
				EXIF : output
			})
		}).catch( e => console.log("Errore: " + file))
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
