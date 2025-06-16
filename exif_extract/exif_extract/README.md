# Estrazione di metadati EXIF dalle immagini

Questo programma analizza le immagini per estrarre i metadati EXIF e salva i risultati in un file JSON.

### Prerequisiti

1. Node.js installato sul computer
2. Cartella contenente le immagini da analizzare

### Configurazione

1. Aprire il terminale nella cartella del progetto
2. Installare i pacchetti necessari:
   ```bash
   npm install
   ```
3. Configurare il percorso delle immagini:
   - Creare un file `image_path.cfg` nella directory precedente
   - Inserire il percorso completo alla cartella delle immagini

### Utilizzo

1. Eseguire il programma:
   ```bash
   npm start
   # oppure
   node index.js
   ```

### Output

Il programma:
- Processa tutte le immagini nella directory specificata
- Estrae i metadati EXIF da ogni immagine
- Salva i risultati in `data_exif.json` nella cartella precedente dello script

### Formato Output

L'output JSON è un array di oggetti, dove ogni oggetto rappresenta un'immagine analizzata. La struttura è la seguente:

```json
[
	{
		"FileName": "DSC_1234",
		"FileExtension": ".jpg",
		"EXIF": {
			"ISO": 400,
			"FNumber": 4.0,
			"ExposureTime": "1/250",
			"DateTimeOriginal": "2024-03-01T10:15:30.000Z",
			"Make": "SONY",
			"Model": "ILCE-7M4",
			"LensModel": "FE 24-70mm F2.8 GM",
			"FocalLength": 50,
			"Flash": "Flash did not fire",
			"WhiteBalance": "Daylight",
			"MeteringMode": "Multi-segment",
			"ExposureMode": "Manual",
			"GPSLatitude": 46.234567,
			"GPSLongitude": 9.123456,
			"GPSAltitude": 1200.0
		}
	}
]
```

Dove:
- `FileName`: Nome del file immagine (senza estensione)
- `FileExtension`: Estensione del file immagine (es. .jpg, .png)
- `EXIF`: Oggetto contenente i metadati EXIF dell'immagine, che possono includere:
  - `ISO`: Sensibilità ISO
  - `FNumber`: Apertura del diaframma
  - `ExposureTime`: Tempo di esposizione
  - `DateTimeOriginal`: Data e ora dello scatto
  - `Make`: Marca della fotocamera
  - `Model`: Modello della fotocamera
  - `LensModel`: Modello dell'obiettivo
  - `FocalLength`: Lunghezza focale in mm
  - `Flash`: Stato del flash
  - `WhiteBalance`: Bilanciamento del bianco
  - `MeteringMode`: Modalità di misurazione esposizione
  - `ExposureMode`: Modalità di esposizione
  - `GPSLatitude`: Latitudine GPS
  - `GPSLongitude`: Longitudine GPS
  - `GPSAltitude`: Altitudine GPS in metri
  - Altri metadati disponibili nell'immagine
