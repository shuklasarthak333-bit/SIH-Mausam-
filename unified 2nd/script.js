/* =====================================================
   PART 1 — PRELOADER + SLIDE NAVIGATION
===================================================== */

const preloader = document.querySelector(".preloader");
const loaderVideo = document.querySelector(".loader-video");
const loaderBrand = document.querySelector(".loader-brand");
const loaderBottom = document.querySelector(".loader-bottom");
const loaderPercent = document.querySelector(".loader-percent");

const counter = { value: 0 };

const loaderTL = gsap.timeline({
    onComplete: () => { preloader.style.display = "none"; }
});

gsap.set(loaderVideo, { scale: 1.12 });

loaderTL.to(loaderBrand, { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" });
loaderTL.to(loaderBottom, { opacity: 1, duration: 0.6 }, "-=0.6");
loaderTL.to(loaderVideo, { scale: 1, duration: 3, ease: "power2.out" }, "<");

loaderTL.to(counter, {
    value: 100,
    duration: 2.5,
    ease: "power2.inOut",
    onUpdate: () => { loaderPercent.textContent = Math.round(counter.value) + "%"; }
}, "-=2");

loaderTL.to(loaderBrand, { scale: 1.15, y: -50, opacity: 0, duration: 0.7, ease: "power3.in" });
loaderTL.to(loaderVideo, { scale: 1.2, opacity: 0, duration: 1, ease: "power3.inOut" }, "<");
loaderTL.to(loaderBottom, { opacity: 0, duration: 0.4 }, "<");
loaderTL.to(preloader, { opacity: 0, duration: 0.5, ease: "power2.inOut" });


/* -----------------------------------------------------
   NAV MENU ELEMENTS
----------------------------------------------------- */

const navToggler = document.querySelector(".nav-toggler");
const navMenu = document.querySelector(".nav-menu");
const navBgs = document.querySelectorAll(".nav-bg");
const navItems = document.querySelector(".nav-items");
const navLinks = document.querySelectorAll(".nav-link-text");

let isMenuOpen = false;
let isAnimating = false;

gsap.set(navBgs, { scaleY: 0, transformOrigin: "top" });
gsap.set(navLinks, { y: "110%" });

const splitLinks = [];

navLinks.forEach((link) => {
    if (typeof SplitText === "undefined") return;
    const split = new SplitText(link, { type: "lines", mask: "lines" });
    splitLinks.push(split);
});

const tl = gsap.timeline({
    paused: true,
    onStart: () => { navMenu.classList.add("open"); },
    onComplete: () => { isAnimating = false; },
    onReverseComplete: () => {
        navMenu.classList.remove("open");
        gsap.set(navLinks, { y: "110%" });
        isAnimating = false;
    }
});

tl.to(navBgs, { scaleY: 1, duration: 0.55, stagger: 0.1, ease: "power3.inOut" });

tl.to(navItems, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    duration: 0.8,
    ease: "power3.inOut"
}, "-=0.45");

tl.to(navLinks, { y: "0%", duration: 0.9, stagger: 0.08, ease: "power4.out" }, "-=0.35");

navToggler.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;

    navToggler.classList.toggle("open");
    navToggler.setAttribute("aria-expanded", !isMenuOpen);

    if (!isMenuOpen) tl.play();
    else tl.reverse();

    isMenuOpen = !isMenuOpen;
});

document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
        if (!isMenuOpen) return;
        if (isAnimating) return;

        isAnimating = true;
        navToggler.classList.remove("open");
        navToggler.setAttribute("aria-expanded", "false");
        tl.reverse();
        isMenuOpen = false;
    });
});


/* -----------------------------------------------------
   AMBIENT MUSIC
----------------------------------------------------- */

const musicButton = document.querySelector(".music-control");
const musicIcon = document.querySelector(".music-icon");
const musicText = document.querySelector(".music-text");
const ambientMusic = document.querySelector("#ambientMusic");
let musicPlaying = false;

musicButton.addEventListener("click", async () => {
    if (!musicPlaying) {
        try {
            await ambientMusic.play();
            musicPlaying = true;
            musicIcon.textContent = "◼";
            musicText.textContent = "MUTE";
            musicButton.classList.add("playing");
            musicButton.setAttribute("aria-pressed", "true");
        } catch (error) {
            console.log("Unable to play music:", error);
        }
    } else {
        ambientMusic.pause();
        musicPlaying = false;
        musicIcon.textContent = "♫";
        musicText.textContent = "AMBIENT";
        musicButton.classList.remove("playing");
        musicButton.setAttribute("aria-pressed", "false");
    }
});


/* =====================================================
   PART 2 — GOLDEN HARVEST WEATHER APP
===================================================== */

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const locationName = document.getElementById("locationName");
const zoneName = document.getElementById("zoneName");
const condition = document.getElementById("condition");
const feelsLabel = document.getElementById("feelsLabel");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherBackground = document.getElementById("weatherBackground");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector("i");
const languageToggle = document.getElementById("languageToggle");
const languageEnglish = document.getElementById("languageEnglish");
const languageHindi = document.getElementById("languageHindi");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalClose = document.getElementById("modalClose");
const modalButton = document.getElementById("modalButton");
const toast = document.getElementById("toast");

let currentLanguage = localStorage.getItem("goldenHarvestLanguage") || "en";
let toastTimer;


/* -----------------------------------------------------
   TRANSLATIONS
----------------------------------------------------- */

const translations = {

    en: {
        search: "Search location...",
        zone: "Zone 7b",
        condition: "Partly Cloudy",
        feelsLike: "Feels like",
        humidity: "HUMIDITY",
        wind: "WIND",
        soilMoisture: "Soil Moisture:",
        optimal: "Optimal",
        rainfall: "Rainfall Predictions:",
        lightShowers: "Light Showers",
        frost: "Frost Alert:",
        none: "None",
        pest: "Pest Situation:",
        low: "Low",
        seasonal: "Seasonal Planting",
        guidance: "Guidance",
        recommendation: "Perfect day for transplanting seedlings in Zone 7b.",
        sunrise: "SURYA UDAY",
        fieldInformation: "FIELD INFORMATION",
        weatherInformation: "Weather Information",
        weatherDetails: "Weather details.",
        done: "Done",
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        info: {
            soil: { title: "Soil Moisture", description: "Soil moisture is currently optimal." },
            rainfall: { title: "Rainfall Predictions", description: "Light showers are currently predicted." },
            frost: { title: "Frost Alert", description: "There is currently no frost alert." },
            pestNone: { title: "Pest Situation", description: "No significant pest situation is currently reported." },
            seasonal: { title: "Seasonal Planting Guidance", description: "Current conditions are suitable for seasonal planting." },
            pestLow: { title: "Pest Situation", description: "Pest situation is currently low." }
        }
    },

    hi: {
        search: "स्थान खोजें...",
        zone: "क्षेत्र 7b",
        condition: "आंशिक रूप से बादल",
        feelsLike: "महसूस",
        humidity: "नमी",
        wind: "हवा",
        soilMoisture: "मिट्टी की नमी:",
        optimal: "उत्तम",
        rainfall: "वर्षा का अनुमान:",
        lightShowers: "हल्की बारिश",
        frost: "पाला चेतावनी:",
        none: "कोई नहीं",
        pest: "कीट स्थिति:",
        low: "कम",
        seasonal: "मौसमी रोपण",
        guidance: "मार्गदर्शन",
        recommendation: "क्षेत्र 7b में पौधों की रोपाई के लिए आज का दिन बहुत अच्छा है।",
        sunrise: "सूर्योदय",
        fieldInformation: "कृषि जानकारी",
        weatherInformation: "मौसम की जानकारी",
        weatherDetails: "मौसम की जानकारी।",
        done: "ठीक है",
        days: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
        info: {
            soil: { title: "मिट्टी की नमी", description: "मिट्टी की नमी वर्तमान में उत्तम है।" },
            rainfall: { title: "वर्षा का अनुमान", description: "हल्की बारिश की संभावना है।" },
            frost: { title: "पाला चेतावनी", description: "वर्तमान में पाले की कोई चेतावनी नहीं है।" },
            pestNone: { title: "कीट स्थिति", description: "वर्तमान में कोई महत्वपूर्ण कीट समस्या नहीं है।" },
            seasonal: { title: "मौसमी रोपण मार्गदर्शन", description: "वर्तमान परिस्थितियाँ मौसमी रोपण के लिए उपयुक्त हैं।" },
            pestLow: { title: "कीट स्थिति", description: "वर्तमान में कीटों की स्थिति कम है।" }
        }
    }

};


/* -----------------------------------------------------
   THEME INITIALIZATION
----------------------------------------------------- */

const savedTheme = localStorage.getItem("goldenHarvestTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.className = "fa-solid fa-sun";
}


/* -----------------------------------------------------
   THEME TOGGLE
----------------------------------------------------- */

themeToggle.addEventListener("click", () => {

    themeIcon.style.opacity = "0";
    themeIcon.style.transform = "rotate(180deg) scale(.5)";

    setTimeout(() => {

        document.body.classList.toggle("dark-mode");

        const darkMode = document.body.classList.contains("dark-mode");

        themeIcon.className = darkMode ? "fa-solid fa-sun" : "fa-solid fa-moon";

        localStorage.setItem("goldenHarvestTheme", darkMode ? "dark" : "light");

        requestAnimationFrame(() => {
            themeIcon.style.opacity = "1";
            themeIcon.style.transform = "rotate(0deg) scale(1)";
        });

    }, 180);

});


/* -----------------------------------------------------
   SEARCH
----------------------------------------------------- */

searchForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const location = searchInput.value.trim();

    if (!location) {
        showToast(currentLanguage === "hi" ? "पहले स्थान दर्ज करें।" : "Enter a location first.");
        searchInput.focus();
        return;
    }

    showToast(currentLanguage === "hi" ? "खोज रहे हैं..." : "Searching...");

    try {

        const geocodeURL =
            "https://geocoding-api.open-meteo.com/v1/search" +
            "?name=" + encodeURIComponent(location) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geocodeURL);
        if (!geoResponse.ok) throw new Error("Geocoding failed");

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            showToast(currentLanguage === "hi" ? "स्थान नहीं मिला।" : "Location not found.");
            return;
        }

        const place = geoData.results[0];

        const weatherURL =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + place.latitude +
            "&longitude=" + place.longitude +
            "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code" +
            "&daily=temperature_2m_max,weather_code" +
            "&forecast_days=6" +
            "&timezone=auto";

        const weatherResponse = await fetch(weatherURL);
        if (!weatherResponse.ok) throw new Error("Weather request failed");

        const weather = await weatherResponse.json();

        updateMainWeather(place, weather);
        updateForecast(weather.daily);

        searchInput.value = "";

        showToast(
            currentLanguage === "hi"
                ? place.name + " का मौसम अपडेट हो गया।"
                : "Weather updated for " + place.name
        );

    } catch (error) {
        console.error(error);
        showToast(currentLanguage === "hi" ? "मौसम लोड नहीं हो सका।" : "Unable to load weather.");
    }

});


/* -----------------------------------------------------
   UPDATE MAIN WEATHER
----------------------------------------------------- */

function updateMainWeather(place, weather) {

    const current = weather.current;

    animateNumber(temperature, Math.round(current.temperature_2m));
    animateNumber(feelsLike, Math.round(current.apparent_temperature));

    locationName.textContent = place.name;
    zoneName.textContent = getLocationSubtitle(place);
    condition.textContent = getWeatherCondition(current.weather_code);
    humidity.textContent = Math.round(current.relative_humidity_2m) + "%";
    wind.textContent = Math.round(current.wind_speed_10m);

    applyLanguage(currentLanguage, false);
}


/* -----------------------------------------------------
   LOCATION SUBTITLE
----------------------------------------------------- */

function getLocationSubtitle(place) {

    let result = "";

    if (place.admin1) result = place.admin1;

    if (place.country) {
        if (result) result += ", ";
        result += place.country;
    }

    return result || "Weather location";
}


/* -----------------------------------------------------
   WEATHER CONDITION
----------------------------------------------------- */

function getWeatherCondition(code) {

    if (code === 0) return currentLanguage === "hi" ? "साफ आसमान" : "Clear Sky";
    if (code === 1) return currentLanguage === "hi" ? "मुख्यतः साफ" : "Mainly Clear";
    if (code === 2) return currentLanguage === "hi" ? "आंशिक रूप से बादल" : "Partly Cloudy";
    if (code === 3) return currentLanguage === "hi" ? "बादल छाए हुए" : "Overcast";
    if (code >= 51 && code <= 67) return currentLanguage === "hi" ? "बारिश" : "Rain Showers";
    if (code >= 71 && code <= 86) return currentLanguage === "hi" ? "बर्फबारी" : "Snow";
    if (code >= 95) return currentLanguage === "hi" ? "आंधी-तूफान" : "Thunderstorm";

    return currentLanguage === "hi" ? "बादल" : "Cloudy";
}


/* -----------------------------------------------------
   NUMBER ANIMATION
----------------------------------------------------- */

function animateNumber(element, newValue) {

    const oldValue = Number(element.textContent);

    if (Number.isNaN(oldValue) || oldValue === newValue) {
        element.textContent = newValue;
        return;
    }

    const duration = 400;
    const start = performance.now();

    function animate(currentTime) {

        const progress = Math.min((currentTime - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = Math.round(oldValue + (newValue - oldValue) * eased);

        if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}


/* -----------------------------------------------------
   FORECAST
----------------------------------------------------- */

function updateForecast(daily) {

    if (!daily) return;

    const rows = document.querySelectorAll(".forecast-row");

    rows.forEach((row, index) => {

        if (!daily.time[index]) return;

        const date = new Date(daily.time[index] + "T12:00:00");
        const englishDay = date.toLocaleDateString("en-US", { weekday: "long" });
        const temp = Math.round(daily.temperature_2m_max[index]);
        const code = daily.weather_code[index];

        row.dataset.englishDay = englishDay;
        row.children[0].textContent = getTranslatedDay(englishDay, currentLanguage);
        row.children[1].textContent = temp + "°";

        const icon = row.children[2];
        icon.className = "fa-solid " + getWeatherIcon(code);

        if (code === 0) icon.classList.add("sunny");
        else if (code <= 3) icon.classList.add("cloudy");
        else icon.classList.add("rainy");

    });
}


/* -----------------------------------------------------
   WEATHER ICON
----------------------------------------------------- */

function getWeatherIcon(code) {

    if (code === 0) return "fa-sun";
    if (code === 1 || code === 2) return "fa-cloud-sun";
    if (code === 3) return "fa-cloud";
    if (code >= 51 && code <= 67) return "fa-cloud-rain";
    if (code >= 71 && code <= 86) return "fa-snowflake";
    if (code >= 95) return "fa-cloud-bolt";

    return "fa-cloud";
}


/* -----------------------------------------------------
   TRANSLATED DAY
----------------------------------------------------- */

function getTranslatedDay(englishDay, language) {

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const index = days.indexOf(englishDay);

    if (index === -1) return englishDay;

    return translations[language].days[index];
}


/* -----------------------------------------------------
   LANGUAGE
----------------------------------------------------- */

function applyLanguage(language, animate = true) {

    const t = translations[language];
    if (!t) return;

    if (animate) {
        document.body.style.opacity = "0.94";
        setTimeout(() => { document.body.style.opacity = "1"; }, 120);
    }

    document.body.classList.toggle("hindi-mode", language === "hi");

    searchInput.placeholder = t.search;
    feelsLabel.textContent = t.feelsLike;

    if (
        !condition.textContent ||
        condition.textContent === "Partly Cloudy" ||
        condition.textContent === "आंशिक रूप से बादल"
    ) {
        condition.textContent = t.condition;
    }

    document.querySelectorAll(".info-box").forEach(box => {

        const type = box.dataset.type;
        const span = box.querySelector("span");
        const strong = box.querySelector("strong");

        if (type === "soil") {
            span.textContent = t.soilMoisture;
            strong.textContent = t.optimal;
        } else if (type === "rainfall") {
            span.textContent = t.rainfall;
            strong.textContent = t.lightShowers;
        } else if (type === "frost") {
            span.textContent = t.frost;
            strong.textContent = t.none;
        } else if (type === "pestNone") {
            span.textContent = t.pest;
            strong.textContent = t.none;
        } else if (type === "pestLow") {
            span.textContent = t.pest;
            strong.textContent = t.low;
        } else if (type === "seasonal") {
            strong.innerHTML = t.seasonal + "<br>" + t.guidance;
        }

    });

    const labels = document.querySelectorAll(".metric-box > div > span");

    if (labels.length >= 2) {
        labels[0].textContent = t.humidity;
        labels[1].textContent = t.wind;
    }

    document.getElementById("recommendationText").textContent = t.recommendation;
    document.getElementById("sunriseText").textContent = t.sunrise;

    document.querySelectorAll(".forecast-row").forEach(row => {
        const englishDay = row.dataset.englishDay;
        if (englishDay) {
            row.children[0].textContent = getTranslatedDay(englishDay, language);
        }
    });

    languageEnglish.classList.toggle("active", language === "en");
    languageHindi.classList.toggle("active", language === "hi");

    localStorage.setItem("goldenHarvestLanguage", language);

    currentLanguage = language;
}


/* -----------------------------------------------------
   LANGUAGE TOGGLE
----------------------------------------------------- */

languageToggle.addEventListener("click", () => {

    const nextLanguage = currentLanguage === "en" ? "hi" : "en";

    applyLanguage(nextLanguage);

    showToast(nextLanguage === "hi" ? "हिन्दी सक्रिय" : "English enabled");
});


/* -----------------------------------------------------
   INFO MODALS
----------------------------------------------------- */

document.querySelectorAll(".info-box").forEach(box => {

    box.addEventListener("click", () => {

        const type = box.dataset.type;
        const info = translations[currentLanguage].info[type];

        if (!info) return;

        modalTitle.textContent = info.title;
        modalDescription.textContent = info.description;
        document.querySelector(".modal-label").textContent = translations[currentLanguage].fieldInformation;
        modalButton.textContent = translations[currentLanguage].done;

        modal.classList.add("open");
    });

});


/* -----------------------------------------------------
   CLOSE MODAL
----------------------------------------------------- */

function closeModal() {
    modal.classList.remove("open");
}

modalClose.addEventListener("click", closeModal);
modalButton.addEventListener("click", closeModal);

modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
});


/* -----------------------------------------------------
   TOAST
----------------------------------------------------- */

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* -----------------------------------------------------
   INITIALIZATION
----------------------------------------------------- */

applyLanguage(currentLanguage, false);


/* -----------------------------------------------------
   IMAGE ERROR HANDLING
----------------------------------------------------- */

weatherBackground.addEventListener("error", () => {
    console.error("card1.png could not be loaded. Make sure card1.png is beside index.html.");
});