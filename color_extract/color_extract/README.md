# Estrazione di colori dominanti dalle immagini

Questo programma analizza le immagini per estrarre i colori dominanti e salva i risultati in un file JSON.

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
- Estrae i colori dominanti da ogni immagine
- Salva i risultati in `data_colors.json` nella cartella precedente dello script

### Formato Output

L'output JSON è un array di oggetti, dove ogni oggetto rappresenta un'immagine analizzata. La struttura è la seguente:

```json
[
	{
		"FileName": "nome_immagine",
		"FileExtension": ".jpg",
		"Colors": ["#FF3278", "#00AABB", "#112233"]
	}
]
```

Dove:
- `FileName`: Nome del file immagine (senza estensione)
- `FileExtension`: Estensione del file immagine (es. .jpg, .png)
- `Colors`: Array di colori dominanti in formato esadecimale, ordinati dalla maggiore alla minore presenza nell'immagine
