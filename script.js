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

const utils = {
  pad: (n) => n < 10 ? '0' + n : n,
  getMonthAbbr: (i) => ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][i],
};

async function preloadImages() {
  const extensions = ['.jpg', '.jpeg', '.JPG', '.png', '.PNG'];
  const promises = Object.entries(imageData).map(([dateStr, base]) => {
    return new Promise((resolve) => {
      const tryLoad = (i = 0) => {
        if (i >= extensions.length) return resolve();
        const path = `assets/foto_archivio/${base}${extensions[i]}`;
        const img = new Image();
        img.onload = () => {
          state.loadedImages[dateStr] = path;
          resolve();
        };
        img.onerror = () => tryLoad(i + 1);
        img.src = path;
      };
      tryLoad();
    });
  });
  await Promise.all(promises);
}

function setupEventListeners() {
  elements.showCalendarBtn.addEventListener('click', () => {
    cancelAndShowCalendarNow();
    elements.intro.style.display = "none";
    elements.timelineView.style.display = "none";
    elements.calendarView.style.display = "block";
  });

  elements.showTimelineBtn.addEventListener('click', () => {
    elements.intro.style.display = "none";
    elements.calendarView.style.display = "none";
    elements.timelineView.style.display = "flex";
    elements.timelineView.style.visibility = "visible";
    elements.timeline.style.visibility = "visible";
    renderTimeline2022();
  });
}

function cancelAndShowCalendarNow() {
  state.animationCancelled = true;
  document.querySelectorAll('.day').forEach(day => {
    day.style.transition = "none";
    day.style.opacity = "1";
  });
  elements.calendar.style.visibility = "visible";
}

async function renderCalendar(withAnimation = true) {
  elements.calendar.innerHTML = "";
  const start = new Date("2022-01-03");
  const end = new Date("2025-05-08");
  
  // Create container for calendar and labels
  const calendarContainer = document.createElement('div');
  calendarContainer.className = 'calendar-container';
  
  // Create labels container
  const monthLabelsContainer = document.createElement('div');
  monthLabelsContainer.className = 'month-labels-container';
  
  let current = new Date(start);
  let squares = [];

  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = current.getMonth();
    const dd = current.getDate();
    const dateStr = `${yyyy}-${utils.pad(mm + 1)}-${utils.pad(dd)}`;
    
    // Create day element
    const dayContainer = document.createElement("div");
    dayContainer.className = "day";
    
    // Create month label outside the calendar
    if (dd === 1) {
      const monthLabel = document.createElement('div');
      monthLabel.className = 'month-label';
      monthLabel.textContent = utils.getMonthAbbr(mm);
      monthLabel.style.top = `${squares.length * 100 / 28}%`;
      monthLabelsContainer.appendChild(monthLabel);
    }

    const colors = colorData?.[dateStr];

    const hex = Array.isArray(colors) ? colors[0] : colors || "#ffffff";
    dayContainer.style.backgroundColor = hex;

    const label = document.createElement("div");
    label.className = "label day-number";

    // Check for first day of year
    if (dd === 1 && mm === 0) {
      label.textContent = yyyy;
      label.classList.add('year-start');
    }
    // Check for first day of other months
    else if (dd === 1) {
      label.textContent = utils.getMonthAbbr(mm);
      label.classList.add('month-start');
    } 
    else {
      label.textContent = dd;
    }
    dayContainer.appendChild(label);

    const colorLabel = document.createElement("div");
    colorLabel.className = "color-hex";
    colorLabel.textContent = hex;
    dayContainer.appendChild(colorLabel);

    if (state.loadedImages[dateStr]) {
      dayContainer.classList.add("has-image");
      dayContainer.dataset.imgPath = state.loadedImages[dateStr];
    }

    const numberOfPhotos = state.loadedImages[dateStr]
      ? Array.isArray(colors)
        ? colors.length
        : 1
      : 0;
    dayContainer.setAttribute("data-photos", numberOfPhotos);

    squares.push(dayContainer);
    current.setDate(current.getDate() + 1);
  }

  // Aggiungi i blocchi giorno
  squares.forEach(day => elements.calendar.appendChild(day));

  // Append elements in correct order
  calendarContainer.appendChild(monthLabelsContainer);
  calendarContainer.appendChild(elements.calendar);
  elements.calendarView.appendChild(calendarContainer);

  elements.calendar.style.visibility = "visible";

  if (withAnimation) {
    animateSquaresRandomly(squares);
  } else {
    squares.forEach(day => (day.style.opacity = "1"));
  }
}




function animateSquaresRandomly(squares) {
  const animate = async () => {
    while (squares.length > 0 && !state.animationCancelled) {
      const idx = Math.floor(Math.random() * squares.length);
      const sq = squares.splice(idx, 1)[0];
      sq.style.transition = "opacity 0.3s ease";
      sq.style.opacity = "1";
      await new Promise(r => setTimeout(r, 5 + Math.random() * 5));
    }
  };
  animate();
}

function renderTimeline2022() {
  elements.timeline.innerHTML = "";
  
  // Create containers for all years
  const years = [2022, 2023, 2024, 2025]; // Added 2025
  
  const yearContainers = years.map(year => {
    const yearContainer = document.createElement("div");
    yearContainer.className = "timeline-year";
    const label = document.createElement("div");
    label.className = "timeline-year-label";
    label.textContent = year;
    yearContainer.appendChild(label);
    elements.timeline.appendChild(yearContainer);
    return yearContainer;
  });
  
  // Render all years
  years.forEach((year, index) => {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    renderTimelineYear(startDate, endDate, yearContainers[index]);
  });
}


function renderTimelineYear(start, end, container) {
  
  let current = new Date(start);

  const daysContainer = document.createElement("div");
  daysContainer.style.display = "flex";
  daysContainer.style.flexWrap = "wrap";
  daysContainer.style.width = "fit-content";
  daysContainer.style.gap = "0";
  daysContainer.style.border = "none";
  daysContainer.style.backgroundColor = "white";

  while (current <= end) {
    console.log(current)
    const yyyy = current.getFullYear();
    const mm = utils.pad(current.getMonth() + 1);
    const dd = utils.pad(current.getDate());
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    const colors = colorData[dateStr];
    if (colors && colors !== "#ffffff") {
      const dayContainer = document.createElement("div");
      dayContainer.className = "day";
      dayContainer.style.display = "flex";
      dayContainer.style.flexDirection = "column";
      dayContainer.style.margin = "0";
      dayContainer.style.padding = "0";
      dayContainer.style.border = "none";
      
      const colorArray = Array.isArray(colors) ? colors : [colors];
      dayContainer.setAttribute('data-photos', colorArray.length);

      colorArray.forEach(color => {
        const colorSquare = document.createElement("div");
        colorSquare.className = "day-color";
        colorSquare.style.backgroundColor = color;
        colorSquare.style.border = "none";
        dayContainer.appendChild(colorSquare);
      });

      daysContainer.appendChild(dayContainer);
    }

    current.setDate(current.getDate() + 1);
  }

  container.appendChild(daysContainer);
}

function addPhotosToDay(dayElement, photos) {
  // Clear any existing colors
  dayElement.innerHTML = '';
  
  // Add a square for each photo (up to 5)
  photos.slice(0, 5).forEach(photo => {
    const colorSquare = document.createElement('div');
    colorSquare.className = 'day-color';
    colorSquare.style.backgroundColor = photo.color; // Assuming photo has a color property
    dayElement.appendChild(colorSquare);
  });
  
  // Set data-photos attribute for CSS styling
  dayElement.setAttribute('data-photos', photos.length);
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

function init() {
  // ...existing initialization code...
}

window.addEventListener("load", async () => {
  await preloadImages();
  await renderCalendar(true);
  setupEventListeners();
});
