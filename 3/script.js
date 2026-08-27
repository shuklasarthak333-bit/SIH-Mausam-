//    WEATHER CODES
//    (merged/expanded code map used by both the current
//    conditions widget and the 6-day forecast)
// =====================================================

const weatherCodes = {
    0: "CLEAR",
    1: "MAINLY CLEAR",
    2: "PARTLY CLOUDY",
    3: "OVERCAST",
    45: "FOG",
    48: "FOG",
    51: "LIGHT DRIZZLE",
    53: "DRIZZLE",
    55: "HEAVY DRIZZLE",
    56: "FREEZING DRIZZLE",
    57: "FREEZING DRIZZLE",
    61: "LIGHT RAIN",
    63: "RAIN",
    65: "HEAVY RAIN",
    66: "FREEZING RAIN",
    67: "FREEZING RAIN",
    71: "LIGHT SNOW",
    73: "SNOW",
    75: "HEAVY SNOW",
    77: "SNOW GRAINS",
    80: "RAIN SHOWERS",
    81: "RAIN SHOWERS",
    82: "HEAVY SHOWERS",
    85: "SNOW SHOWERS",
    86: "HEAVY SNOW SHOWERS",
    95: "THUNDERSTORM",
    96: "THUNDERSTORM",
    99: "THUNDERSTORM"
};


/* =====================================================
   CURRENT CONDITIONS WIDGET — ELEMENTS
===================================================== */

const app = document.querySelector(".weather-app");
const temperatureElement = document.getElementById("temperature");
const feelsElement = document.getElementById("feels");
const conditionElement = document.getElementById("condition");
const precipitationElement = document.getElementById("precipitation");
const windSpeedElement = document.getElementById("windSpeed");
const locationElement = document.getElementById("location");
const searchButton = document.getElementById("searchButton");
const searchPanel = document.getElementById("searchPanel");
const searchElement = document.getElementById("search");
const closeSearch = document.getElementById("closeSearch");
const compass = document.getElementById("compass");
const compassHeading = document.getElementById("compassHeading");
const compassPermission = document.getElementById("compassPermission");
const agrometButton = document.getElementById("agrometButton");

/* OPEN SEARCH */

searchButton.addEventListener("click", function () {
    app.classList.add("search-open");
    searchPanel.classList.add("active");
    setTimeout(function () { searchElement.focus(); }, 250);
});

/* CLOSE SEARCH */

function closeSearchPanel() {
    searchPanel.classList.remove("active");
    setTimeout(function () { app.classList.remove("search-open"); }, 100);
    searchElement.value = "";
}

closeSearch.addEventListener("click", closeSearchPanel);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && searchPanel.classList.contains("active")) {
        closeSearchPanel();
    }
});

/* CURRENT WEATHER API */

async function getWeather(latitude, longitude, cityName = null) {
    try {
        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
            `&hourly=precipitation_probability` +
            `&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather request failed");

        const data = await response.json();
        const current = data.current;

        temperatureElement.textContent = Math.round(current.temperature_2m);
        feelsElement.textContent = Math.round(current.apparent_temperature);
        conditionElement.textContent = weatherCodes[current.weather_code] || "UNKNOWN";

        if (typeof current.wind_speed_10m === "number") {
            windSpeedElement.textContent = Math.round(current.wind_speed_10m);
        }

        if (data.hourly && data.hourly.precipitation_probability) {
            const precipitation = data.hourly.precipitation_probability[0];
            if (typeof precipitation === "number") {
                precipitationElement.textContent = precipitation + "%";
            }
        }

        if (cityName) locationElement.textContent = cityName;

    } catch (error) {
        console.error("Weather error:", error);
    }
}

/* SEARCH LOCATION */

searchElement.addEventListener("keydown", async function (event) {
    if (event.key !== "Enter") return;

    const city = searchElement.value.trim();
    if (!city) return;

    try {
        const url =
            `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            alert("Location not found.");
            return;
        }

        const result = data.results[0];
        const cityName = `${result.name}, ${result.country}`;

        await getWeather(result.latitude, result.longitude, cityName);
        closeSearchPanel();

    } catch (error) {
        console.error("Search error:", error);
        alert("Unable to find this location.");
    }
});

/* CURRENT LOCATION */

function getCurrentLocation() {
    if (!navigator.geolocation) {
        getWeather(49.38, -121.44);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            getWeather(position.coords.latitude, position.coords.longitude);
        },
        function () {
            getWeather(49.38, -121.44, "Hope, British");
        }
    );
}

/* COMPASS DIRECTIONS */

function getDirection(degrees) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function updateCompass(heading) {
    heading = ((heading % 360) + 360) % 360;
    compass.style.transform = `rotate(${-heading}deg)`;
    compassHeading.textContent = `${getDirection(heading)} ${Math.round(heading)}°`;
    compassHeading.style.transform = `translateX(-50%) rotate(${heading}deg)`;
}

function handleOrientation(event) {
    let heading = null;

    if (typeof event.webkitCompassHeading === "number") {
        heading = event.webkitCompassHeading;
    } else if (typeof event.alpha === "number") {
        heading = 360 - event.alpha;
    }

    if (heading === null) return;
    updateCompass(heading);
}

function startCompass() {
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
}

async function enableCompass() {
    try {
        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === "granted") {
                startCompass();
                compassPermission.style.display = "none";
            }
        } else {
            startCompass();
            compassPermission.style.display = "none";
        }
    } catch (error) {
        console.error("Compass permission error:", error);
    }
}

compassPermission.addEventListener("click", enableCompass);

if (
    typeof DeviceOrientationEvent === "undefined" ||
    typeof DeviceOrientationEvent.requestPermission !== "function"
) {
    startCompass();
}

/* AGROMET BUTTON (weather widget) */

agrometButton.addEventListener("click", function () {
    alert("Agromet information will be available here.");
});


/* =====================================================
   6-DAY FORECAST — ELEMENTS
===================================================== */

const forecastRows = [
    {
        day: document.getElementById("day1"),
        temp: document.getElementById("temp1"),
        icon: document.getElementById("icon1"),
        description: document.getElementById("description1")
    },
    {
        day: document.getElementById("day2"),
        temp: document.getElementById("temp2"),
        icon: document.getElementById("icon2"),
        description: document.getElementById("description2")
    },
    {
        day: document.getElementById("day3"),
        temp: document.getElementById("temp3"),
        icon: document.getElementById("icon3"),
        description: document.getElementById("description3")
    },
    {
        day: document.getElementById("day4"),
        temp: document.getElementById("temp4"),
        icon: document.getElementById("icon4"),
        description: document.getElementById("description4")
    },
    {
        day: document.getElementById("day5"),
        temp: document.getElementById("temp5"),
        icon: document.getElementById("icon5"),
        description: document.getElementById("description5")
    },
    {
        day: document.getElementById("day6"),
        temp: document.getElementById("temp6"),
        icon: document.getElementById("icon6"),
        description: document.getElementById("description6")
    }
];


/* =====================================================
   GET FORECAST
===================================================== */

async function getForecast() {
    try {
        /*
         * Default coordinates:
         * Hope, British Columbia
         */

        const latitude = 49.38;
        const longitude = -121.44;

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&daily=` +
            `temperature_2m_max,` +
            `temperature_2m_min,` +
            `weather_code` +
            `&forecast_days=7` +
            `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to fetch forecast");
        }

        const data = await response.json();

        updateForecast(data.daily);

    } catch (error) {
        console.error("Forecast error:", error);
    }
}


/* =====================================================
   UPDATE FORECAST
===================================================== */

function updateForecast(daily) {
    const maxTemps = daily.temperature_2m_max;
    const minTemps = daily.temperature_2m_min;
    const codes = daily.weather_code;
    const dates = daily.time;

    /*
     * We display the next 6 days.
     */

    for (let i = 0; i < 6; i++) {
        const row = forecastRows[i];

        if (!row) {
            continue;
        }

        /* DATE */

        if (dates[i]) {
            const date = new Date(dates[i] + "T12:00:00");

            row.day.textContent = date.toLocaleDateString("en-US", {
                weekday: "long"
            });
        }

        /* TEMPERATURE */

        if (maxTemps[i] !== undefined && minTemps[i] !== undefined) {
            row.temp.textContent =
                `${Math.round(maxTemps[i])}° / ${Math.round(minTemps[i])}°`;
        }

        /* DESCRIPTION */

        row.description.textContent = getDescription(codes[i]);

        /* ICON */

        setWeatherIcon(row.icon, codes[i]);
    }
}


/* =====================================================
   DESCRIPTION
===================================================== */

function getDescription(code) {
    if (code === 0) {
        return "SUNNY";
    }

    if (code === 1) {
        return "MAINLY SUNNY";
    }

    if (code === 2) {
        return "PARTLY CLOUDY";
    }

    if (code === 3) {
        return "CLOUDY";
    }

    if (code === 45 || code === 48) {
        return "FOG";
    }

    if (code >= 51 && code <= 57) {
        return "DRIZZLE";
    }

    if (code >= 61 && code <= 67) {
        return "RAIN";
    }

    if (code >= 71 && code <= 77) {
        return "SNOW";
    }

    if (code >= 80 && code <= 82) {
        return "SHOWERS";
    }

    if (code >= 85 && code <= 86) {
        return "SNOW SHOWERS";
    }

    if (code >= 95) {
        return "STORM";
    }

    return "CLOUDY";
}


/* =====================================================
   SET WEATHER ICON
===================================================== */

function setWeatherIcon(image, code) {
    /*
     * Sunny / cloudy:
     * use your C.svg
     */

    if (code === 0 || code === 1 || code === 2 || code === 3) {
        image.src = "./C.svg";
        return;
    }

    /* Rain */

    if (code >= 51 && code <= 67) {
        image.src = createIcon("rain");
        return;
    }

    /* Snow */

    if (code >= 71 && code <= 86) {
        image.src = createIcon("snow");
        return;
    }

    /* Thunderstorm */

    if (code >= 95) {
        image.src = createIcon("storm");
        return;
    }

    /* Fallback */

    image.src = "./C.svg";
}


/* =====================================================
   CREATE WEATHER ICONS
===================================================== */

function createIcon(type) {
    let svg = "";

    /* RAIN */

    if (type === "rain") {
        svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <path
                    d="
                        M18 39
                        C10 39
                        7 34
                        7 29
                        C7 23
                        12 18
                        18 18
                        C20 10
                        27 6
                        35 8
                        C42 9
                        47 15
                        48 22
                        C54 22
                        58 26
                        58 32
                        C58 37
                        54 40
                        48 40
                        Z
                    "
                    fill="white"
                />
                <path d="M22 47 L19 55" stroke="#9edcff" stroke-width="3" stroke-linecap="round" />
                <path d="M34 47 L31 55" stroke="#9edcff" stroke-width="3" stroke-linecap="round" />
                <path d="M46 47 L43 55" stroke="#9edcff" stroke-width="3" stroke-linecap="round" />
            </svg>
        `;
    }

    /* SNOW */

    else if (type === "snow") {
        svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <path
                    d="
                        M18 38
                        C10 38
                        7 33
                        7 28
                        C7 22
                        12 18
                        18 18
                        C20 10
                        27 7
                        35 8
                        C42 9
                        47 14
                        48 21
                        C54 21
                        58 25
                        58 31
                        C58 36
                        54 39
                        48 39
                        Z
                    "
                    fill="white"
                />
                <circle cx="22" cy="50" r="2" fill="white" />
                <circle cx="32" cy="55" r="2" fill="white" />
                <circle cx="43" cy="49" r="2" fill="white" />
            </svg>
        `;
    }

    /* STORM */

    else {
        svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <path
                    d="
                        M18 38
                        C10 38
                        7 33
                        7 28
                        C7 22
                        12 18
                        18 18
                        C20 10
                        27 7
                        35 8
                        C42 9
                        47 14
                        48 21
                        C54 21
                        58 25
                        58 31
                        C58 36
                        54 39
                        48 39
                        Z
                    "
                    fill="white"
                />
                <path
                    d="
                        M34 40
                        L26 52
                        H33
                        L29 62
                        L43 47
                        H36
                        Z
                    "
                    fill="#f4d35e"
                />
            </svg>
        `;
    }

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}


/* =====================================================
   START WEATHER (current conditions + forecast)
===================================================== */

getCurrentLocation();
getForecast();


/* =====================================================
   PRELOADER ANIMATION
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


/* =====================================================
   NAV MENU
===================================================== */

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


/* =====================================================
   AMBIENT MUSIC
===================================================== */

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