// 1. Inserisci i tuoi dati grezzi qui, con duplicati
const righe = `
"2022-01-01": "#d9d9d9",
"2022-01-01": "#c8b3a7",
"2022-01-02": "#aaa7a6",
"2022-01-02": "#a49d94",
"2022-01-02": "#f4f4f4",
"2022-01-03": "#89837e",
"2022-01-03": "#a0a4a5",
"2022-01-03": "#a59f9a"
`;

// 2. Estrai righe, rimuovi spazi e virgolette
const rawPairs = righe
  .split("\n")
  .map(line => line.trim().replace(/"|,$/g, ''))
  .filter(Boolean)
  .map(line => {
    const [date, color] = line.split(":").map(s => s.trim());
    return [date, color];
  });

// 3. Raggruppa per data
const grouped = {};
rawPairs.forEach(([date, color]) => {
  if (!grouped[date]) grouped[date] = [];
  if (!grouped[date].includes(color) && color.toLowerCase() !== "#ffffff") {
    grouped[date].push(color);
  }
});

// 4. Output finale
console.log("export const colorData = " + JSON.stringify(grouped, null, 2) + ";");
