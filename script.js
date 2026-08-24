/* =====================================================
   WEATHER CODES
===================================================== */

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

    61: "LIGHT RAIN",

    63: "RAIN",

    65: "HEAVY RAIN",

    71: "LIGHT SNOW",

    73: "SNOW",

    75: "HEAVY SNOW",

    80: "RAIN SHOWERS",

    81: "RAIN SHOWERS",

    82: "HEAVY SHOWERS",

    95: "THUNDERSTORM",

    96: "THUNDERSTORM",

    99: "THUNDERSTORM"

};


/* =====================================================
   ELEMENTS
===================================================== */

const app =
    document.querySelector(".weather-app");


const temperatureElement =
    document.getElementById(
        "temperature"
    );


const feelsElement =
    document.getElementById(
        "feels"
    );


const conditionElement =
    document.getElementById(
        "condition"
    );


const precipitationElement =
    document.getElementById(
        "precipitation"
    );


const windSpeedElement =
    document.getElementById(
        "windSpeed"
    );


const locationElement =
    document.getElementById(
        "location"
    );


const searchButton =
    document.getElementById(
        "searchButton"
    );


const searchPanel =
    document.getElementById(
        "searchPanel"
    );


const searchElement =
    document.getElementById(
        "search"
    );


const closeSearch =
    document.getElementById(
        "closeSearch"
    );


const compass =
    document.getElementById(
        "compass"
    );


const compassHeading =
    document.getElementById(
        "compassHeading"
    );


const compassPermission =
    document.getElementById(
        "compassPermission"
    );


const agrometButton =
    document.getElementById(
        "agrometButton"
    );


/* =====================================================
   OPEN SEARCH
===================================================== */

searchButton.addEventListener(
    "click",
    function () {

        app.classList.add(
            "search-open"
        );

        searchPanel.classList.add(
            "active"
        );

        /*
         * Wait for the opening animation
         * before focusing.
         */

        setTimeout(
            function () {

                searchElement.focus();

            },
            250
        );

    }
);


/* =====================================================
   CLOSE SEARCH
===================================================== */

function closeSearchPanel() {

    /*
     * First close the search panel.
     */

    searchPanel.classList.remove(
        "active"
    );


    /*
     * Remove search-open slightly
     * after the panel begins closing.
     *
     * This allows the precipitation
     * percentage to return smoothly.
     */

    setTimeout(
        function () {

            app.classList.remove(
                "search-open"
            );

        },
        100
    );


    searchElement.value = "";

}


closeSearch.addEventListener(
    "click",
    closeSearchPanel
);


/* =====================================================
   ESCAPE TO CLOSE SEARCH
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            searchPanel.classList.contains(
                "active"
            )
        ) {

            closeSearchPanel();

        }

    }
);


/* =====================================================
   WEATHER API
===================================================== */

async function getWeather(
    latitude,
    longitude,
    cityName = null
) {

    try {

        /*
         * Wind speed has been added
         * to the current weather request.
         */

        const url =

            `https://api.open-meteo.com/v1/forecast` +

            `?latitude=${latitude}` +

            `&longitude=${longitude}` +

            `&current=` +

            `temperature_2m,` +

            `relative_humidity_2m,` +

            `apparent_temperature,` +

            `weather_code,` +

            `wind_speed_10m` +

            `&hourly=precipitation_probability` +

            `&timezone=auto`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather request failed"
            );

        }


        const data =
            await response.json();


        const current =
            data.current;


        /* =========================================
           TEMPERATURE
        ========================================== */

        temperatureElement.textContent =
            Math.round(
                current.temperature_2m
            );


        /* =========================================
           FEELS LIKE
        ========================================== */

        feelsElement.textContent =
            Math.round(
                current.apparent_temperature
            );


        /* =========================================
           CONDITION
        ========================================== */

        conditionElement.textContent =
            weatherCodes[
                current.weather_code
            ] || "UNKNOWN";


        /* =========================================
           WIND SPEED
        ========================================== */

        if (
            typeof current.wind_speed_10m ===
            "number"
        ) {

            windSpeedElement.textContent =
                Math.round(
                    current.wind_speed_10m
                );

        }


        /* =========================================
           PRECIPITATION
        ========================================== */

        if (

            data.hourly &&

            data.hourly
                .precipitation_probability

        ) {

            const precipitation =
                data.hourly
                    .precipitation_probability[0];


            if (
                typeof precipitation ===
                "number"
            ) {

                precipitationElement.textContent =
                    precipitation + "%";

            }

        }


        /* =========================================
           LOCATION
        ========================================== */

        if (cityName) {

            locationElement.textContent =
                cityName;

        }

    }

    catch (error) {

        console.error(
            "Weather error:",
            error
        );

    }

}


/* =====================================================
   SEARCH LOCATION
===================================================== */

searchElement.addEventListener(
    "keydown",
    async function (event) {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        const city =
            searchElement.value.trim();


        if (!city) {

            return;

        }


        try {

            const url =

                `https://geocoding-api.open-meteo.com/v1/search` +

                `?name=${encodeURIComponent(city)}` +

                `&count=1` +

                `&language=en` +

                `&format=json`;


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    "Search failed"
                );

            }


            const data =
                await response.json();


            if (

                !data.results ||

                data.results.length === 0

            ) {

                alert(
                    "Location not found."
                );

                return;

            }


            const result =
                data.results[0];


            const cityName =
                `${result.name}, ${result.country}`;


            await getWeather(

                result.latitude,

                result.longitude,

                cityName

            );


            closeSearchPanel();

        }

        catch (error) {

            console.error(
                "Search error:",
                error
            );

            alert(
                "Unable to find this location."
            );

        }

    }
);


/* =====================================================
   CURRENT LOCATION
===================================================== */

function getCurrentLocation() {

    if (
        !navigator.geolocation
    ) {

        /*
         * Default location:
         * Hope, British Columbia
         */

        getWeather(

            49.38,

            -121.44,

            "Hope, British"

        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            getWeather(

                position.coords.latitude,

                position.coords.longitude

            );

        },


        function () {

            /*
             * Fallback
             */

            getWeather(

                49.38,

                -121.44,

                "Hope, British"

            );

        }

    );

}


/* =====================================================
   COMPASS DIRECTIONS
===================================================== */

function getDirection(
    degrees
) {

    const directions = [

        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"

    ];


    const index =
        Math.round(
            degrees / 45
        ) % 8;


    return directions[index];

}


/* =====================================================
   UPDATE COMPASS
===================================================== */

function updateCompass(
    heading
) {

    /*
     * Normalize heading
     * between 0 and 360.
     */

    heading =
        ((heading % 360) + 360) % 360;


    /*
     * Rotate compass.
     */

    compass.style.transform =
        `rotate(${-heading}deg)`;


    /*
     * Show heading.
     */

    compassHeading.textContent =

        `${getDirection(heading)}
         ${Math.round(heading)}°`;


    /*
     * Keep text upright.
     */

    compassHeading.style.transform =
        `translateX(-50%) rotate(${heading}deg)`;

}


/* =====================================================
   DEVICE ORIENTATION
===================================================== */

function handleOrientation(
    event
) {

    let heading = null;


    /*
     * iOS Safari
     */

    if (
        typeof event.webkitCompassHeading ===
        "number"
    ) {

        heading =
            event.webkitCompassHeading;

    }


    /*
     * Android / other browsers
     */

    else if (
        typeof event.alpha ===
        "number"
    ) {

        heading =
            360 - event.alpha;

    }


    if (
        heading === null
    ) {

        return;

    }


    updateCompass(
        heading
    );

}


/* =====================================================
   START COMPASS
===================================================== */

function startCompass() {

    window.addEventListener(

        "deviceorientationabsolute",

        handleOrientation,

        true

    );


    window.addEventListener(

        "deviceorientation",

        handleOrientation,

        true

    );

}


/* =====================================================
   COMPASS PERMISSION
===================================================== */

async function enableCompass() {

    try {

        /*
         * iOS requires permission.
         */

        if (

            typeof DeviceOrientationEvent !==
            "undefined"

            &&

            typeof DeviceOrientationEvent
                .requestPermission ===
            "function"

        ) {


            const permission =

                await DeviceOrientationEvent
                    .requestPermission();


            if (
                permission ===
                "granted"
            ) {

                startCompass();

                compassPermission.style.display =
                    "none";

            }

        }

        else {

            /*
             * Android / desktop.
             */

            startCompass();

            compassPermission.style.display =
                "none";

        }

    }

    catch (error) {

        console.error(
            "Compass permission error:",
            error
        );

    }

}


/* =====================================================
   COMPASS PERMISSION BUTTON
===================================================== */

compassPermission.addEventListener(
    "click",
    enableCompass
);


/* =====================================================
   INITIALIZE COMPASS
===================================================== */

if (

    typeof DeviceOrientationEvent ===
    "undefined"

    ||

    typeof DeviceOrientationEvent
        .requestPermission !==
    "function"

) {

    startCompass();

}


/* =====================================================
   AGROMET
===================================================== */

agrometButton.addEventListener(
    "click",
    function () {

        alert(
            "Agromet information will be available here."
        );

    }
);


/* =====================================================
   START APPLICATION
===================================================== */

getCurrentLocation();