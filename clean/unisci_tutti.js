const fs = require('fs');

// Carica i dati da file JSON
const immagini = JSON.parse(fs.readFileSync('nome_e_data.json', 'utf8'));
const colori = JSON.parse(fs.readFileSync('output_clean.json', 'utf8'));

const unione = {};

// Prendi tutte le date uniche
const dateTotali = new Set([...Object.keys(immagini), ...Object.keys(colori)]);

// Per ogni data, unisci immagini e colori
dateTotali.forEach(data => {
  const imgs = immagini[data]
    ? Array.isArray(immagini[data]) ? immagini[data] : [immagini[data]]
    : [];
  const cols = colori[data]
    ? Array.isArray(colori[data]) ? colori[data] : [colori[data]]
    : [];

  unione[data] = [...imgs, ...cols].join(', ');
});

// Salva il file finale
fs.writeFileSync('unione_finale.json', JSON.stringify(unione, null, 2));

console.log('✅ File unione_finale.json creato con successo!');
