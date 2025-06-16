import fs from 'fs'
import os from 'os'

export const DEFAULT_CFG_PATH_LOCATION = "../image_path.cfg"
const FILES_DA_IGNORARE = ['.DS_Store', '.AppleDouble', '.LSOverride']

export function getImagePath() {
	try {
		const path = fs.readFileSync(DEFAULT_CFG_PATH_LOCATION, 'utf8').trim()
		const fixedPath = path.replace('~', os.homedir())
		return fixedPath

	} catch (e) {
		console.log("Percorso immagine default non trovato/errato.")
		console.log("Verifica il file " + DEFAULT_CFG_PATH_LOCATION)
	}
}

export function scanFolder(path) {
	return fs.readdirSync(path).filter( e => FILES_DA_IGNORARE.indexOf(e) == -1)
}
