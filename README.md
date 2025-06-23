SUPSI 2025  
Corso d’interaction design, CV429.01  
Docenti: A. Gysin, G. Profeta  

Elaborato 1: Me, Myself & AI  

Pixels in growth
Autore: Arianna Copa  
[Pixels in growth] (https://ariannacopa.github.io/Pixels_in_growth/)


## Introduzione e tema
“Pixels in Growth” nasce all’interno del corso di Interaction Design con l’obiettivo di realizzare un sistema di visualizzazione grafica interattiva per esplorare il mio archivio fotografico personale, composto da oltre 4.000 immagini scattate tra il 2022 e il 2025.<br>
Analizzando i dati delle fotografie, ho scoperto una tendenza interessante: nel corso del tempo il numero di scatti quotidiani è cresciuto in modo significativo, riflettendo il mio crescente interesse per la documentazione visiva del quotidiano.

Il concept progettuale si basa proprio su questa progressione: ogni giorno è rappresentato da un quadrato, che rimane bianco nei giorni senza foto e diventa colorato nei giorni in cui ho scattato almeno uno scatto. Il colore di ciascun quadrato non è casuale, ma corrisponde alla media visiva dei toni predominanti nelle immagini di quel giorno. In questo modo, la timeline e il calendario risultano una mappa quantitativa delle mie abitudini fotografiche.

Visivamente, il sistema utilizza due modalità di navigazione:

1. Vista Calendario: una griglia di quadrati disposti in ordine cronologico e raggruppati in settimane e mesi, con etichette che indicano i mesi e gli anni principali. È possibile approfondire il codice esadecimale del colore medio e la quantità di foto scattate.

2. Vista Timeline: una sequenza orizzontale continua di quadrati, organizzata per anno, che mette in evidenza l’andamento temporale e permette di confrontare facilmente l’intensità e la variazione cromatica tra stagioni e anni diversi.

Il progetto vuole essere quindi una mappa della mia continuità visiva, capace di raccontare attraverso forme semplici e colori medi l’evoluzione della mia fotografia nel tempo.


## Riferimenti progettuali
Questi casi d’uso dimostrano come la combinazione di forma geometrica semplice (il quadrato), cromia media e rappresentazione temporale possa trasformare un archivio fotografico personale in un racconto visivo sia quantitativo sia emozionale:

![reference](https://github.com/user-attachments/assets/c2843fe4-2482-46ab-81ca-adfe23f08aca)
   
• Interfaccia web basata su una griglia modulare in cui singoli quadrati si colorano per rivelare frammenti di immagini.<br>
• Emphasis sull’esplorazione ludica del contenuto fotografico attraverso un pattern “pixelato”.

![timeline](https://github.com/user-attachments/assets/a0b970be-02ef-46d5-adbc-3df50c658184)<br>
• Serie di cartoline disegnate a mano che codificano in colore e forma due settimane di dati personali (umore, abitudini, attività).<br>
• Elevata cura tipografica e infografica nel passaggio dal dato grezzo alla forma estetica.

## Design dell’interfaccia e modalità di interazione
Pixels in Growth ha un’interfaccia chiara e intuitiva, pensata per mettere in risalto il racconto visivo. Troviamo due modalità di esplorazione principali (Calendario e Timeline), collegate fra loro da strumenti di navigazione e filtri.
<img width="1728" alt="immagini_interfaccia_1" src="https://github.com/user-attachments/assets/bc9c40d2-e4a4-4b8a-be6c-a99af2cde05f" />
1. La pagina si apre con una Landing page di caricamento, che permette una prima visualizzazione del calendario, titolo, sottotitolo  e bottoni di navigazione.
Interazione: animazione iniziale; hover che rivela foto e informazioni, bottoni di navigazione alle altre viste.
<img width="1728" alt="immagini_interfaccia_2" src="https://github.com/user-attachments/assets/6813bb3d-e766-4096-9239-3e350888cd89" />
<img width="1728" alt="immagini_interfaccia_3" src="https://github.com/user-attachments/assets/d820a183-6d3a-477e-a422-7126ce265c70" />

2. La vista Calendario ha un layout a righe e colonne. I quadrati si colorano in base alla media cromatica delle foto: bianco per i giorni senza scatti, colorati per i giorni in cui ho fotografato.
Interazione: hover che rivela l'esadecimale del colore medio e il numero di foto scattate quel giorno; bottone che permette il filtraggio del calendario per mesi, anni o giorni della settimana, bottone che permette la navigazione alla vista della Timeline.
<img width="1728" alt="immagini_interfaccia_4" src="https://github.com/user-attachments/assets/a18215b9-778c-45c2-a259-e197719f00d5" />
<img width="1728" alt="immagini_interfaccia_5" src="https://github.com/user-attachments/assets/f1e1ba0a-45fd-4979-bdf6-476c29ad4ac4" />
<img width="1728" alt="immagini_interfaccia_6" src="https://github.com/user-attachments/assets/4d81b800-73a8-4c7e-8cf6-2a492ac9e1a0" />

3. Nella vista Timeline i riquadri scorrono affiancati lungo un’unica linea, suddivisi per anno grazie a etichette poste ai lati di ogni sezione. Si può vedere la timeline dello specifico anno.
Interazione: bottone che permette il filtraggio delle timeline per mesi, anni, giorni della settimana, bottoni che permettono la visualizzazione dello specifico anno e dei giorni e bottone che permette la navigazione alla vista del Calendario.


## Tecnologia usata
Il progetto utilizza le seguenti tecnologie:

HTML: Per la struttura della pagina.

          <!-- Vista Calendario -->
          <div id="calendar-view">
            <div class="calendar-container">
              <div id="date-labels" class="date-labels"></div>
              <div id="calendar"></div>
            </div>
          </div>
          
          <!-- Vista Timeline -->
          <div id="timeline-view" style="display: none;">
            <div id="timeline"></div>
          </div>


CSS: Per gli stli.

          .calendar-container {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 2px;
          }
          
          .day {
            width: calc((100vw - 2rem) / 28);
            height: auto;
            padding-top: calc((100vw - 2rem) / 28); /* quadrato perfetto */
            position: relative;
          }
          
          @media screen and (max-width: 768px) {
            .day { width: calc((100vw - 1rem) / 20); padding-top: calc((100vw - 1rem) / 20); }
          }


JavaScript: Per l'interattività.

          function renderCalendar() {
            const start = new Date("2022-01-03"),
                  end   = new Date("2025-05-08"),
                  oneDay = 24*60*60*1000;
            for (let d = start; d <= end; d = new Date(d.getTime()+oneDay)) {
              const key = `${d.getFullYear()}-${utils.pad(d.getMonth()+1)}-${utils.pad(d.getDate())}`;
              const dayDiv = document.createElement('div');
              dayDiv.classList.add('day');
              dayDiv.style.backgroundColor = colorData[key] || '#fff';
              dayDiv.dataset.date = key;
              calendar.appendChild(dayDiv);
            }
          }

## Target e contesto d’uso
Il progetto si rivolge a chi vive la fotografia come racconto visivo da esplorare e condividere:
- Appassionati di fotografia che, oltre alla condivisione sui social, cercano un modo per leggere le proprie immagini in chiave creativa e riflessiva.
- Studenti e docenti di Design e Data Visualization, desiderosi di studiare un caso concreto di interfaccia in grado di trasformare un semplice archivio in un’esperienza di scoperta.

Il contesto d'uso è angolo interattivo all’interno di una mostra di fotografia contemporanea: su un grande touchscreen, il visitatore carica le proprie immagini e vede emergere davanti a sé una mappa di giorni colorati, un calendario cromatico dei propri ricordi. In questo spazio, Pixels in Growth diventa un ponte tra l’esperienza personale e l’osservazione estetica: ogni quadrato racconta una storia, ogni tonalità svela un’emozione.
