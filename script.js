import { colorData } from './output_clean_nuovo.js';
import { imageData } from './nome_e_data.js';

const elements = {
  calendar: document.getElementById("calendar"),
  intro: document.getElementById("intro"),
  showCalendarBtn: document.getElementById("show-calendar-btn"),
  showTimelineBtn: document.getElementById("show-timeline-btn"),
  calendarView: document.getElementById("calendar-view"),
  timelineView: document.getElementById("timeline-view"),
  timeline: document.getElementById("timeline"),
};

const state = {
  loadedImages: {},
  animationCancelled: false,
};

const LAYOUT = {
  timelinePadding: "180px"
};

const utils = {
  pad: (n) => n < 10 ? '0' + n : n,
  getMonthAbbr: (i) => ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][i],
  shouldShowMonthLabel: (date) => {
    // Special case for Jan 3, 2022
    if (date.getFullYear() === 2022 && date.getMonth() === 0 && date.getDate() === 3) {
      return true;
    }
    // First day of any other month
    return date.getDate() === 1;
  },
  shouldShowYear: (date) => {
    // Special case for Jan 3, 2022
    if (date.getFullYear() === 2022 && date.getMonth() === 0 && date.getDate() === 3) {
      return true;
    }
    // First day of January for other years
    return date.getMonth() === 0 && date.getDate() === 1;
  },
  getSeason: (date) => {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return "Spring";
    if (month >= 6 && month <= 8) return "Summer";
    if (month >= 9 && month <= 11) return "Autumn";
    return "Winter";
  }
};
// modal full-screen carousel
const modal      = document.getElementById('photo-modal');
const mainPhoto  = document.getElementById('main-photo');
const prevBtn    = modal.querySelector('.carousel-btn.prev');
const nextBtn    = modal.querySelector('.carousel-btn.next');
const closeCross = modal.querySelector('.modal-close');
let currentIndex  = 0;
let currentPhotos = [];



async function preloadImages() {
  const extensions = ['.jpg', '.jpeg', '.JPG', '.png', '.PNG'];
  const entries = Object.entries(imageData);
  const promises = entries.map(([dateStr, bases]) => {
    // assicuriamoci di trattare sia string che array
    const baseList = Array.isArray(bases) ? bases : [bases];
    // inizializziamo l'array delle URL
    state.loadedImages[dateStr] = [];
    // per ogni base proviamo a caricare con tutte le estensioni
    return Promise.all(baseList.map(base => new Promise(resolve => {
      const tryLoad = (i = 0) => {
        if (i >= extensions.length) return resolve();
        const path = `assets/foto_archivio/${base}${extensions[i]}`;
        const img = new Image();
        img.onload = () => {
          state.loadedImages[dateStr].push(path);
          resolve();
        };
        img.onerror = () => tryLoad(i + 1);
        img.src = path;
      };
      tryLoad();
    })));
  });
  await Promise.all(promises);
}


function setupEventListeners() {
  elements.showCalendarBtn.addEventListener('click', () => {
    document.body.classList.add('header-mode-active');
    const filterContainer = document.querySelector('.filter-container');
    filterContainer.style.removeProperty('display');
    moveToHeader();
    document.getElementById('header-timeline-btn').textContent = 'Look at the timeline';
    elements.intro.style.display = "none";
    elements.timelineView.style.display = "none";
    elements.calendarView.style.display = "block";
    elements.calendarView.style.paddingTop = "120px";
    
    // Renderizza il calendario senza animazione e NON è landing page
    renderCalendar(false, false);
  });

  elements.showTimelineBtn.addEventListener('click', () => {
    moveToHeader();
  
    document.getElementById('header-timeline-btn').textContent = 'Show the calendar';
    document.querySelector('.header-mode').style.display = 'flex';
    document.body.classList.add('header-mode-active');
    
    elements.intro.style.display = "none";
    elements.calendarView.style.display = "none";
    elements.timelineView.style.display = "block";
    elements.timelineView.style.paddingTop = LAYOUT.timelinePadding; // Usa il valore standardizzato
    elements.timelineView.style.visibility = "visible";
    
    // Reset and initialize filters
    const filterContainer = document.querySelector('.filter-container');
    filterContainer.style.display = 'block';
    populateFilters();
    initializeFilters();
    
    elements.timeline.innerHTML = "";
    renderTimeline2022();
  });

document.getElementById('header-timeline-btn').addEventListener('click', () => {
  const timelineBtn = document.getElementById('header-timeline-btn');
  const isShowingTimeline = elements.timelineView.style.display === "block";

  if (isShowingTimeline) {
    // Switch to calendar view
    timelineBtn.textContent = "Look at the timeline";
    elements.timelineView.style.display = "none";
    elements.calendarView.style.display = "block";
    elements.calendarView.style.paddingTop = "120px";
    renderCalendar(false, false);
  } else {
    // Switch to main timeline view
    timelineBtn.textContent = "Show the calendar";
    elements.calendarView.style.display = "none";
    elements.timelineView.style.display = "block";
    elements.timelineView.style.paddingTop = LAYOUT.timelinePadding;
    elements.timeline.innerHTML = "";
    renderTimeline2022();
  }
});


}

function moveToHeader() {
  const intro = document.getElementById('intro');
  
  // Create header if it doesn't exist
  if (!document.querySelector('.header-mode')) {
    const header = document.createElement('div');
    header.className = 'header-mode';
    
    // Create header content structure with static number
    header.innerHTML = `
      <div class="header-content">
        <h1>Pixels in growth</h1>
        <p class="subtitle">4026 photos taken from 2022 to 2025</p>
      </div>
      <div class="button-group">
        <button id="header-calendar-btn">Show the calendar</button>
        <button id="header-timeline-btn">Look at the timeline</button>
      </div>
    `;
    
    // Set initial position without transition
    header.style.transform = 'translateY(0)';
    document.body.insertBefore(header, document.body.firstChild);
    
    // Add event listeners to new buttons
    document.getElementById('header-calendar-btn').addEventListener('click', () => {
      document.body.classList.add('header-mode-active');
      const filterContainer = document.querySelector('.filter-container');
      filterContainer.style.removeProperty('display');
      elements.timelineView.style.display = "none";
      elements.calendarView.style.display = "block";
      elements.calendarView.style.paddingTop = "120px";
      cancelAndShowCalendarNow();
      addWeekdayLabels();
    });
    
    document.getElementById('header-timeline-btn').addEventListener('click', () => {
      document.body.classList.remove('header-mode-active');
      const filterContainer = document.querySelector('.filter-container');
      filterContainer.style.display = 'none';
      elements.calendarView.style.display = "none";
      elements.timelineView.style.display = "block"; // Cambiato da "flex" a "block"
      elements.timelineView.style.paddingTop = "120px"; // Aggiunto padding
      elements.timeline.innerHTML = ""; // Pulisci il contenuto esistente
      renderTimeline2022(); // Renderizza la timeline
    });
  }
  
  // Hide intro immediately without transition
  intro.style.display = 'none';
  
  // Add click event to header content
  const headerContent = document.querySelector('.header-mode .header-content');
  if (headerContent) {
    headerContent.addEventListener('click', () => {
      window.location.reload();
    });
  }
}

function cancelAndShowCalendarNow() {
  state.animationCancelled = true;
  document.querySelectorAll('.day').forEach(day => {
    day.style.transition = "none";
    day.style.opacity = "1";
  });
  elements.calendar.style.visibility = "visible";
  addYearSideLabels(); // Aggiungi gli anni quando si passa alla vista calendario
}

async function renderCalendar(withAnimation = true, isLandingPage = false) {
  elements.calendar.innerHTML = "";
  const labelContainer = document.getElementById("date-labels");
  labelContainer.innerHTML = "";

  // Rimuovi i weekday labels esistenti solo se è la landing page
  if (isLandingPage) {
    const existingWeekdays = document.querySelector('.weekday-labels');
    if (existingWeekdays) {
      existingWeekdays.remove();
    }
  } else {
    // Aggiungi i weekday labels per tutte le altre visualizzazioni del calendario
    addWeekdayLabels();
  }

  const start = new Date("2022-01-03");
  const end = new Date("2025-05-08");
  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((end - start) / oneDay) + 1;

  const days = [];
  const dateList = [];

  let current = new Date(start);

  // 1. Costruisci tutti i giorni e salvali
  for (let i = 0; i < totalDays; i++) {
    const yyyy = current.getFullYear();
    const mm = current.getMonth();
    const dd = current.getDate();
    const dateStr = `${yyyy}-${utils.pad(mm + 1)}-${utils.pad(dd)}`;
    const colors = colorData?.[dateStr];

    const day = document.createElement("div");
    day.className = "day";
    day.style.opacity = withAnimation ? "0" : "1";

    // Update the color calculation in renderCalendar function
    let hex;
    if (Array.isArray(colors) && colors.length > 0) {
      hex = calculateAverageColor(colors); // Rimuovi il controllo colors.length === 1
    } else {
      hex = "#ffffff"; // Day without photos
    }
    day.style.backgroundColor = hex;



    // Numero del giorno
    const label = document.createElement("div");
    label.className = "label day-number";
    label.textContent = dd;
    day.appendChild(label);

    // Colore (tooltip)
const colorLabel = document.createElement("div");
colorLabel.className = "color-hex";
// --- inizio patch ---
const numberOfPhotos = state.loadedImages[dateStr]
  ? (Array.isArray(colors) ? colors.length : 1)
  : 0;
const photoText = numberOfPhotos === 1
  ? '1 photo'
  : `${numberOfPhotos} photos`;
colorLabel.textContent = `${hex} – ${photoText}`;
// --- fine patch ---
day.appendChild(colorLabel);







    if (state.loadedImages[dateStr]) {
      day.classList.add("has-image");
      day.style.setProperty('--img-path', `url(${state.loadedImages[dateStr]})`);
    }

    day.setAttribute("data-photos", numberOfPhotos);

    // Add month label if applicable
    if (utils.shouldShowMonthLabel(current)) {
      const monthLabel = document.createElement("div");
      monthLabel.className = "label month-abbr";
      monthLabel.textContent = utils.getMonthAbbr(mm);
      day.appendChild(monthLabel);
    }

    // Add year label if applicable
    if (utils.shouldShowYear(current)) {
      const yearLabel = document.createElement("div");
      yearLabel.className = "label year-label";
      yearLabel.textContent = yyyy;
      day.appendChild(yearLabel);
    }

    // Add date attribute for filtering
    day.dataset.date = dateStr;

    days.push(day);
    dateList.push(new Date(current)); // clone
    current.setDate(current.getDate() + 1);
  }

  // 2. Append all squares to the calendar at once
  days.forEach(day => {
    // Rimuovi la transizione di opacity se non c'è animazione
    if (!withAnimation) {
      day.style.transition = "none";
    }
    day.style.opacity = withAnimation ? "0" : "1";
    day.style.visibility = "visible";
    elements.calendar.appendChild(day);
  });

  // Ensure layout is computed before starting animation
  requestAnimationFrame(() => {
    elements.calendar.style.visibility = "visible";
    if (!isLandingPage) {
      addYearSideLabels();
    }
    if (withAnimation) {
      animateSquaresRandomly(days);
    } else {
      // Mostra immediatamente tutti i quadrati senza animazione
      days.forEach(day => {
        day.style.opacity = "1";
        day.style.visibility = "visible";
      });
    }
  });
  
  // Aggiungi click listener agli anni
  document.querySelectorAll('.year-label').forEach(yearLabel => {
    yearLabel.style.cursor = 'pointer';
    yearLabel.addEventListener('click', (e) => {
      e.stopPropagation();
      const year = parseInt(yearLabel.textContent);
      showYearTimeline(year);
    });
  });
}

function animateSquaresRandomly(squares) {
  const delay = 10; // Slightly increased delay for smoother animation
  let remaining = [...squares];

  const animate = async () => {
    while (remaining.length > 0 && !state.animationCancelled) {
      const idx = Math.floor(Math.random() * remaining.length);
      const square = remaining.splice(idx, 1)[0];
      
      square.style.transition = "opacity 0.3s ease";
      square.style.opacity = "1";
      square.style.visibility = "visible";
      
      await new Promise(r => setTimeout(r, delay));
    }
  };

  animate();
}

function renderTimeline2022() {
  elements.timeline.innerHTML = "";

  // Contenitore principale diviso in due colonne
  const wrapper = document.createElement("div");
  wrapper.className = "timeline-wrapper";

  // Colonna sinistra per le etichette degli anni
  const labelsCol = document.createElement("div");
  labelsCol.className = "timeline-year-labels";

  // Colonna destra per le righe della timeline
  const contentCol = document.createElement("div");
  contentCol.className = "timeline-content";

  // Lista degli anni da mostrare
  const years = [2022, 2023, 2024, 2025];

  years.forEach((year) => {
    // Create year button with new class
    const yearButton = document.createElement("button");
    yearButton.className = "timeline-year-button"; // Changed from year-button to timeline-year-button
    yearButton.textContent = year;
    labelsCol.appendChild(yearButton);

    // Add click event to scroll to the corresponding year's timeline
yearButton.addEventListener('click', () => {
  showYearTimeline(year);

});

    // Crea contenitore e riga per i giorni dell’anno
    const yearContainer = document.createElement("div");
    yearContainer.className = "timeline-year";
    const timelineRow = document.createElement("div");
    timelineRow.className = "timeline-row";

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const oneDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.floor((endDate - startDate) / oneDay) + 1;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate.getTime() + i * oneDay);
      const dateStr = `${currentDate.getFullYear()}-${utils.pad(currentDate.getMonth() + 1)}-${utils.pad(currentDate.getDate())}`;
      const colors = colorData?.[dateStr];

      const square = document.createElement("div");
      square.className = "timeline-day";
      const hex = (Array.isArray(colors) && colors.length > 0) ? calculateAverageColor(colors) : "#ffffff";
      square.style.backgroundColor = hex;

      if (state.loadedImages[dateStr]) {
        square.classList.add("has-image");
        square.style.setProperty('--img-path', `url(${state.loadedImages[dateStr]})`);
      }

// =============================================

      // Add date attribute for filtering
      square.setAttribute("data-date", dateStr);
      
      // Add season attribute for filtering
      square.setAttribute("data-season", utils.getSeason(currentDate));
      
      timelineRow.appendChild(square);
      // calcola quante foto per quel giorno
const photoCount = Array.isArray(colors) && colors.length > 0 ? colors.length : 0;
// imposta attributo e tooltip
square.setAttribute('data-photos', photoCount);
square.setAttribute('title', photoCount + ' foto scattate quel giorno');

    }

    yearContainer.appendChild(timelineRow);
    contentCol.appendChild(yearContainer);


  });


  // Unisci tutto nel wrapper
  wrapper.appendChild(labelsCol);
  wrapper.appendChild(contentCol);
  contentCol.style.position = 'relative';
addMonthSeparators(years[0]);

  elements.timeline.appendChild(wrapper);

  addMonthSeparators(2022);
}



// Funzione per convertire colore hex in RGB
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

// Funzione per convertire RGB in hex
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Funzione per calcolare la media dei colori
function calculateAverageColor(colors) {
    if (!colors || colors.length === 0) return null;
    if (colors.length === 1) return colors[0];

    // Convert hex to RGB, calculate average, then convert back to hex
    const rgbColors = colors.map(hex => {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    });

    // Calculate average RGB values
    const avgColor = rgbColors.reduce((acc, curr) => ({
        r: acc.r + curr.r,
        g: acc.g + curr.g,
        b: acc.b + curr.b
    }), { r: 0, g: 0, b: 0 });

    avgColor.r = Math.round(avgColor.r / colors.length);
    avgColor.g = Math.round(avgColor.g / colors.length);
    avgColor.b = Math.round(avgColor.b / colors.length);

    // Convert back to hex
    const toHex = n => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(avgColor.r) + toHex(avgColor.g) + toHex(avgColor.b);
}

// Modifica la funzione che gestisce l'aggiunta delle foto al calendario
function addPhotosToDay(dayElement, photos) {
    if (!photos || photos.length === 0) {
        dayElement.style.backgroundColor = ''; // Bianco di default
        dayElement.setAttribute('data-photos', '0');
        return;
    }

    // Per il calendario della landing page, usa il primo colore
    if (!document.body.classList.contains('header-mode-active')) {
        dayElement.style.backgroundColor = photos[0].color;
    } else {
        // Per il calendario dopo "show the calendar", calcola la media
        const colors = photos.map(photo => photo.color);
        const averageColor = calculateAverageColor(colors);
        dayElement.style.backgroundColor = averageColor;
    }

    dayElement.setAttribute('data-photos', photos.length.toString());
}

function renderLabels(start, end) {
  const labelContainer = document.querySelector('.date-labels');
  labelContainer.innerHTML = '';
  
  let currentYear = null;
  let currentMonth = null;
  let current = new Date(start);
  
  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth();
    
    if (year !== currentYear) {
      const yearLabel = document.createElement('div');
      yearLabel.className = 'year-label';
      yearLabel.textContent = year;
      labelContainer.appendChild(yearLabel);
      currentYear = year;
    }
    
    if (month !== currentMonth) {
      const monthLabel = document.createElement('div');
      monthLabel.className = 'month-label';
      monthLabel.textContent = new Date(year, month, 1).toLocaleString('default', { month: 'short' });
      labelContainer.appendChild(monthLabel);
      currentMonth = month;
    }
    
    current.setMonth(current.getMonth() + 1);
  }
}

// Update your existing event listener
elements.showCalendarBtn.addEventListener('click', () => {
  moveToHeader();
  document.getElementById('header-timeline-btn').textContent = 'Look at the timeline';
  elements.intro.style.display = "none";
  elements.timelineView.style.display = "none";
  elements.calendarView.style.display = "block";
  addWeekdayLabels();

  cancelAndShowCalendarNow();
  elements.calendarView.style.paddingTop = "120px";
});

function addWeekdayLabels() {
  const weekdayContainer = document.createElement('div');
  weekdayContainer.className = 'weekday-labels';
  
  // Create 28 days starting from Monday (Jan 3, 2022)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 28; i++) {
    const label = document.createElement('div');
    label.className = 'weekday-label';
    label.textContent = days[i % 7];
    weekdayContainer.appendChild(label);
  }
  
  // Insert after header and before calendar
  const calendarView = document.getElementById('calendar-view');
  calendarView.insertBefore(weekdayContainer, calendarView.firstChild);
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
  const filterContainer = document.querySelector('.filter-container');
  
  // Show/hide filters dropdown
  toggleFiltersBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    filterContainer.classList.toggle('visible');
    toggleFiltersBtn.classList.toggle('active');
  });

  // Close filters when clicking outside
  document.addEventListener('click', (e) => {
    if (!filterContainer.contains(e.target) && !toggleFiltersBtn.contains(e.target)) {
      filterContainer.classList.remove('visible');
      toggleFiltersBtn.classList.remove('active');
    }
  });

  // Show header with filter button when calendar is shown
  document.getElementById('show-calendar-btn').addEventListener('click', () => {
    document.querySelector('.header-mode').style.display = 'flex';
    // ... existing calendar show logic ...
  });

  // Hide filters when switching to timeline
  document.getElementById('show-timeline-btn').addEventListener('click', () => {
    filterContainer.classList.remove('visible');
    toggleFiltersBtn.classList.remove('active');
  });
  const closeFiltersX = document.getElementById('close-filters-x');
if (closeFiltersX) {
  closeFiltersX.addEventListener('click', () => {
    filterContainer.classList.remove('visible');
    toggleFiltersBtn.classList.remove('active');
  });
}

});

// Add filter functionality
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-button');
  const activeFilters = {
    month: null,
    year: null,
    weekday: null
  };

  // Remove existing listeners
  filterButtons.forEach(button => {
    button.replaceWith(button.cloneNode(true));
  });

  // Add new listeners
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
      const filterType = button.dataset.filter;
      const filterValue = button.dataset.value;
      
      if (button.classList.contains('active')) {
        button.classList.remove('active');
        activeFilters[filterType] = null;
      } else {
        // Deactivate other buttons in same category
        document.querySelectorAll(`.filter-button[data-filter="${filterType}"]`)
          .forEach(btn => btn.classList.remove('active'));
        
        button.classList.add('active');
        activeFilters[filterType] = filterValue;
      }

      applyFilters(activeFilters);
    });
  });

  // Clear all button handler
  const clearBtn = document.getElementById("clear-filters-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      // Remove active class from all buttons
      document.querySelectorAll('.filter-button.active')
        .forEach(btn => btn.classList.remove('active'));

      // Reset filter state
      Object.keys(activeFilters).forEach(key => {
        activeFilters[key] = null;
      });

      // Apply cleared filters
      applyFilters(activeFilters);
    });
  }
}

function applyFilters(activeFilters) {
  const isTimelineView = document.getElementById('timeline-view').style.display === "block";
  const allDays = document.querySelectorAll(isTimelineView ? '.timeline-day' : '.day');

  allDays.forEach(day => {
    if (!day.dataset.date) return;
    
    const dayDate = new Date(day.dataset.date);
    const dayMonth = dayDate.toLocaleString('en-US', { month: 'long' });
    const dayYear = dayDate.getFullYear().toString();
    const dayWeekday = dayDate.toLocaleString('en-US', { weekday: 'long' });

    let isVisible = true;

    // Check each filter
    if (activeFilters.month) {
      isVisible = isVisible && dayMonth === activeFilters.month;
    }
    if (activeFilters.year) {
      isVisible = isVisible && dayYear === activeFilters.year;
    }
    if (activeFilters.weekday) {
      isVisible = isVisible && dayWeekday === activeFilters.weekday;
    }

    // Apply visibility with transition
    day.style.transition = 'opacity 0.3s ease';
    day.style.opacity = isVisible ? '1' : '0.2';
  });
}


function populateFilters() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = ["2022", "2023", "2024", "2025"];
  const weekdays = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
  ];

  const monthFiltersContainer = document.getElementById("month-filters");
  const yearFiltersContainer = document.getElementById("year-filters");
  const weekdayFiltersContainer = document.getElementById("weekday-filters");

  // Clear existing filters
  monthFiltersContainer.innerHTML = '';
  yearFiltersContainer.innerHTML = '';
  weekdayFiltersContainer.innerHTML = '';

  function createFilterButtons(items, filterType, container) {
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'filter-buttons-container';
    
    items.forEach(item => {
      const button = document.createElement("button");
      button.className = "filter-button";
      button.textContent = item;
      button.dataset.filter = filterType;
      button.dataset.value = item;
      buttonsWrapper.appendChild(button);
    });
    
    container.appendChild(buttonsWrapper);
  }

  // Populate all filters
  createFilterButtons(months, "month", monthFiltersContainer);
  createFilterButtons(years, "year", yearFiltersContainer);
  createFilterButtons(weekdays, "weekday", weekdayFiltersContainer);
}


// Unified filter handling
const handleFilterClick = (button, filterType) => {
    button.classList.toggle('active');
    updateVisibility();
}

// Clear all filters
const clearAllFilters = () => {
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
    updateVisibility();
}

// Update visibility based on active filters
const updateVisibility = () => {
    const activeFilters = {
        months: [...document.querySelectorAll('.filter-button[data-filter-type="month"].active')]
            .map(btn => btn.dataset.value),
        years: [...document.querySelectorAll('.filter-button[data-filter-type="year"].active')]
            .map(btn => btn.dataset.value),
        weekdays: [...document.querySelectorAll('.filter-button[data-filter-type="weekday"].active')]
            .map(btn => btn.dataset.value)
    };

    // Get current view (timeline or calendar)
    const currentView = document.body.classList.contains('timeline-mode') ? 'timeline' : 'calendar';
    const items = currentView === 'timeline' ? 
        document.querySelectorAll('.timeline-day') : 
        document.querySelectorAll('.calendar .day');

    items.forEach(item => {
        const month = item.dataset.month;
        const year = item.dataset.year;
        const weekday = item.dataset.weekday;
        
        const matchesMonth = activeFilters.months.length === 0 || activeFilters.months.includes(month);
        const matchesYear = activeFilters.years.length === 0 || activeFilters.years.includes(year);
        const matchesWeekday = activeFilters.weekdays.length === 0 || activeFilters.weekdays.includes(weekday);

        const isVisible = matchesMonth && matchesYear && matchesWeekday;
        item.style.opacity = isVisible ? '1' : '0.2';
    });
}

// Funzioni per i separatori e le etichette dei mesi nella timeline
function createMonthSeparators(year) {
    const separatorContainer = document.querySelector('.timeline-month-grid');
    if (!separatorContainer) return;
    
    // Clear existing separators
    separatorContainer.innerHTML = '';
    
    // Calculate positions
    const timelineWidth = document.querySelector('.timeline-row').offsetWidth;
    const daysInYear = isLeapYear(year) ? 366 : 365;
    
    // Funzione per calcolare i giorni in un mese
    function getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }
    
    // Calcola i giorni cumulativi per ogni mese
    let cumulativeDays = 0;
    const monthSeparators = [];
    
    for (let month = 0; month < 12; month++) {
        cumulativeDays += getDaysInMonth(month, year);
        monthSeparators.push(cumulativeDays);
    }
    
    // Create separators
    monthSeparators.forEach((days, index) => {
        if (index < 11) { // Non creare il separatore dopo dicembre
            const separator = document.createElement('div');
            separator.className = 'month-separator';
            const position = (days / daysInYear) * timelineWidth;
            separator.style.left = `${position}px`;
            
            // Aggiungi label del mese (opzionale)
            const monthLabel = document.createElement('div');
            monthLabel.className = 'month-label';
            monthLabel.textContent = new Date(year, index + 1, 1).toLocaleString('default', { month: 'short' });
            separator.appendChild(monthLabel);
            
            separatorContainer.appendChild(separator);
        }
    });
}

// Funzione helper per controllare se l'anno è bisestile
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Aggiorna la funzione initializeTimeline per accettare l'anno
function initializeTimeline(year) {
    createMonthSeparators(year);
    createMonthLabels();
}

// Aggiorna gli event listener
window.addEventListener('resize', () => {
    if (document.querySelector('.timeline-month-grid')) {
        const currentYear = new Date().getFullYear(); // o passa l'anno corrente della timeline
        createMonthSeparators(currentYear);
        createMonthLabels();
    }
});

// Aggiornare anche gli altri event listener dove viene chiamato createMonthSeparators
// sostituendo con initializeTimeline()

window.addEventListener("load", async () => {
  await preloadImages();
  state.animationCancelled = false;
  // Renderizza il calendario con animazione ed È landing page
  await renderCalendar(true, true);
  setupEventListeners();
  populateFilters();
  initializeFilters();
  
  // Trigger animations immediately after render
  const days = document.querySelectorAll('.day');
  if (days.length > 0) {
    requestAnimationFrame(() => {
      elements.calendar.style.visibility = "visible";
      animateSquaresRandomly([...days]);
      // Avvia l'animazione del numero contemporaneamente
      animateNumber(4026, 2000); // 2000ms = 2 secondi di durata
    });
  }
});

// Aggiungi questa funzione per animare il numero
function animateNumber(targetNumber, duration) {
  // Get both subtitles - the one in intro and the one in header
  const subtitles = document.querySelectorAll('.subtitle');
  const startText = 'photos taken from 2022 to 2025';
  let startNumber = 0;
  
  // Set initial value for all subtitles
  subtitles.forEach(subtitle => {
    subtitle.textContent = startText;
  });
  
  const increment = Math.ceil(targetNumber / (duration / 16));
  
  function updateNumber() {
    startNumber = Math.min(startNumber + increment, targetNumber);
    
    // Update all subtitles simultaneously
    subtitles.forEach(subtitle => {
      subtitle.textContent = `${startNumber} ${startText}`;
    });
    
    if (startNumber < targetNumber) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

function renderTimelineYear(startDate, endDate, container) {
  const oneDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((endDate - startDate) / oneDay) + 1;
  
  // Create timeline row container
  const timelineRow = document.createElement("div");
  timelineRow.className = "timeline-row";
  
  // Calculate square size based on screen width
  const screenWidth = window.innerWidth - 40; // Full width minus small margin
  const squareSize = Math.floor(screenWidth / 365); // Divide available width by days in year
  
  // Create squares for each day
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + (i * oneDay));
    const dateStr = `${currentDate.getFullYear()}-${utils.pad(currentDate.getMonth() + 1)}-${utils.pad(currentDate.getDate())}`;
    const colors = colorData?.[dateStr];
    
    const square = document.createElement("div");
    square.className = "timeline-day";
    square.style.width = `${squareSize}px`;
    square.style.height = `${squareSize}px`;
    
    // Set color using the same logic as calendar
    let hex;
    if (Array.isArray(colors) && colors.length > 0) {
      hex = calculateAverageColor(colors);
    } else {
      hex = "#ffffff";
    }
    square.style.backgroundColor = hex;
    
    square.setAttribute("data-date", dateStr);
    
    if (state.loadedImages[dateStr]) {
      square.classList.add("has-image");
      square.style.setProperty('--img-path', `url(${state.loadedImages[dateStr]})`);
    }
    
    timelineRow.appendChild(square);
  }
  
  container.appendChild(timelineRow);
  addMonthSeparators(year);
}

function addMonthSeparators(year) {
  // → prende il container giusto in single-year view
  const container = document.querySelector('#timeline.single-year')
                 || document.querySelector('.timeline-wrapper.single-year')
                 || document.querySelector('.timeline-content');
  if (!container) return;

  // Rimuovo vecchie linee/etichette/conteggi
  const old = container.querySelector('.timeline-month-lines');
  if (old) old.remove();

  // Contenitore assoluto per linee, etichette e numeri
  const linesContainer = document.createElement('div');
  linesContainer.className = 'timeline-month-lines';
  container.appendChild(linesContainer);

  // Utility per anni bisestili e configurazione mesi
  const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const daysIn = [
    31,
    isLeap(year) ? 29 : 28,
    31,30,31,30,31,31,30,31,30,31
  ];
  const names = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const totalDays = daysIn.reduce((a,b) => a + b, 0);

  let cumulative = 0;
  daysIn.forEach((days, idx) => {
    cumulative += days;
    const percent = (cumulative / totalDays) * 100;

    // 1) linea di separazione
    const line = document.createElement('div');
    line.className = 'timeline-month-line';
    line.style.left = `${percent}%`;
    linesContainer.appendChild(line);

    // 2) etichetta del mese
    const label = document.createElement('div');
    label.className = 'timeline-month-label';
    label.textContent = names[idx];
    label.style.left = `${percent}%`;
    linesContainer.appendChild(label);

    // 3) conteggio foto di quel mese
    let count = 0;
    const start = new Date(year, idx, 1);
    const end   = new Date(year, idx + 1, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0,10);
      if (colorData[key]) {
        count += Array.isArray(colorData[key])
          ? colorData[key].length
          : 1;
      }
    }
    const cntEl = document.createElement('div');
    cntEl.className = 'timeline-month-count';
    cntEl.textContent = count;
    cntEl.style.left = `${percent}%`;
    linesContainer.appendChild(cntEl);
  });
}





// Check timeline position
function checkTimelinePosition() {
  const timelineView = elements.timelineView;
  console.log({
    paddingTop: timelineView.style.paddingTop,
    offsetTop: timelineView.offsetTop,
    display: timelineView.style.display,
    classList: timelineView.classList.toString()
  });
}

// Aggiungi questa chiamata dopo ogni cambio di vista
checkTimelinePosition();

function showYearTimeline(year) {
  const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
if (toggleFiltersBtn) {
// Nascondi il pulsante ma mantieni lo spazio per non far muovere il titolo
toggleFiltersBtn.style.visibility = 'hidden';
}
  moveToHeader();
  document.body.classList.add('header-mode-active');

  // 1) Nasconde calendario / reset timeline
  elements.calendarView.style.display   = 'none';
  elements.timelineView.style.display   = 'block';
  elements.timelineView.style.paddingTop = LAYOUT.timelinePadding;
  const grid = elements.timeline;
  grid.className = 'single-year';
  grid.style.position = 'relative';
    // unico layout
  grid.innerHTML  = ''; 
// --- YEAR TIMELINE HEADER WITH BACK BUTTON -----------------------
const yearHeader = document.createElement('div');
yearHeader.className = 'year-timeline-header';

// back button (usa la classe stilizzata .back-to-timeline)
const backBtn = document.createElement('button');
backBtn.className = 'back-to-timeline';
backBtn.textContent = 'Back';
backBtn.addEventListener('click', () => {
    // Rimuovi l'header con il pulsante back
    yearHeader.remove();
    
    // Rimuovi le classi single-year
    elements.timeline.classList.remove('single-year');
    
    // Ripulisci la timeline corrente
    elements.timeline.innerHTML = '';
    
    // Ripristina la visualizzazione delle 4 timeline
    renderTimeline2022();
    
    // Ripristina il padding-top corretto
    elements.timelineView.style.paddingTop = LAYOUT.timelinePadding;
const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
if (toggleFiltersBtn) {
// Ripristina la visibilità del pulsante
toggleFiltersBtn.style.visibility = 'visible';
}
});

// titolo dell'anno al centro (opzionale, ma supportato dal CSS)
const title = document.createElement('div');
title.className = 'year-timeline-title';
title.textContent = year;

// assemblo header
yearHeader.appendChild(backBtn);
yearHeader.appendChild(title);

// inserisco l'header prima della griglia
elements.timelineView.insertBefore(yearHeader, grid);

  // 2) Pre-calcolo delle date e del max di foto
  const start   = new Date(`${year}-01-01`);
  const end     = new Date(`${year}-12-31`);
  const oneDay  = 24 * 60 * 60 * 1000;
  let maxPhotos = 0;
  for (let ts = start.getTime(); ts <= end.getTime(); ts += oneDay) {
    const dStr = new Date(ts).toISOString().slice(0,10);
    let arr = colorData[dStr] || [];
    if (!Array.isArray(arr)) arr = arr ? [arr] : [];
    maxPhotos = Math.max(maxPhotos, arr.length || 1);
  }

  // 3) Imposto in-line la griglia a X righe (una per “slot” di foto)
  const cellSize = `calc((100vw - 200px) / 365)`; 
  grid.style.gridTemplateColumns = `repeat(365, ${cellSize})`;
  grid.style.gridTemplateRows    = `repeat(${maxPhotos}, ${cellSize})`;
  grid.style.gap                 = '0';

  // 4) Popolo la griglia, una colonna per ogni giorno
  let col = 1;
  for (let ts = start.getTime(); ts <= end.getTime(); ts += oneDay, col++) {
    const dStr = new Date(ts).toISOString().slice(0,10);
    let arr = colorData[dStr] || [];
    if (!Array.isArray(arr)) arr = arr ? [arr] : [];

if (arr.length === 0) {
  const base = document.createElement('div');
  base.className           = 'base-square';
  base.style.gridColumnStart = col;
  base.style.gridRowStart    = maxPhotos;           // ↓ in basso
  grid.appendChild(base);
} else {
  arr.forEach((color, idx) => {
    const square = document.createElement('div');
    square.className           = 'timeline-day';
    square.style.gridColumnStart = col;
    square.style.gridRowStart    = maxPhotos - idx;  // ↑ a partire dal basso
    square.style.backgroundColor = color;
    /* … resto invariato … */
    grid.appendChild(square);

  });
  // 5) Aggiungo linee e nomi dei mesi sotto la griglia
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const linesContainer = document.createElement("div");
linesContainer.className = "timeline-month-lines";
// Assicuriamoci che il container padre sia position: relative
grid.style.position = "relative";

let cumulative = 0;
const daysInYear = isLeapYear(year) ? 366 : 365;
for (let m = 0; m < 12; m++) {
  // numero di giorni del mese m
  const dim = new Date(year, m + 1, 0).getDate();
  cumulative += dim;
  const pct = (cumulative / daysInYear) * 100;

  // linea di separazione
  const line = document.createElement("div");
  line.className = "timeline-month-line";
  line.style.left = `${pct}%`;
  linesContainer.appendChild(line);

  // etichetta del mese
  const label = document.createElement("div");
  label.className = "timeline-month-label";
  label.style.left = `${pct}%`;
  label.textContent = monthNames[m];
  linesContainer.appendChild(label);
}

// aggiungo il contenitore dopo i quadratini
grid.appendChild(linesContainer);

}

  }

  // Count photos for the year
  const countPhotosInYear = () => {
    let count = 0;
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0,10);
      if (colorData[dateStr]) {
        count += colorData[dateStr].length || 0;
      }
    }
    return count;
  };

  const statsContainer = document.createElement('div');
  statsContainer.className = 'year-stats-container';
  statsContainer.innerHTML = `Photos taken in the year ${year}: <strong>${countPhotosInYear()}</strong>`;
  elements.timelineView.appendChild(statsContainer);

}

// —– INIZIO: gestione chiusura modal
closeCross.addEventListener('click', () => {
  modal.classList.add('hidden');
});
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});
// —– FINE: gestione chiusura modal


// ——————————————————————————————————————————————————————————
// 3) Gestione navigazione ◀/▶ e chiusura modal

// freccia “indietro”
prevBtn.addEventListener('click', () => {
  if (currentPhotos.length === 0) return;
  currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
  mainPhoto.src = currentPhotos[currentIndex];
});

// freccia “avanti”
nextBtn.addEventListener('click', () => {
  if (currentPhotos.length === 0) return;
  currentIndex = (currentIndex + 1) % currentPhotos.length;
  mainPhoto.src = currentPhotos[currentIndex];
});

// chiudi col click sulla “X”
closeCross.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// chiudi cliccando fuori dal contenuto
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});
// ——————————————————————————————————————————————————————————
// ◀ Freccia indietro
prevBtn.addEventListener('click', () => {
  if (currentPhotos.length === 0) return;
  currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
  mainPhoto.src = currentPhotos[currentIndex];
});

// ▶ Freccia avanti
nextBtn.addEventListener('click', () => {
  if (currentPhotos.length === 0) return;
  currentIndex = (currentIndex + 1) % currentPhotos.length;
  mainPhoto.src = currentPhotos[currentIndex];
});

// Chiudi con la “X”
closeCross.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Chiudi cliccando fuori dal contenuto
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});



