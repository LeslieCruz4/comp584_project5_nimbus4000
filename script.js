import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@12/+esm";

const citySelect = document.getElementById("city");
const searchButton = document.getElementById("search-btn");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weather-icon");
const forecastContainer = document.getElementById("forecast");

// Choose an emoji based on the forecast description.
function getWeatherEmoji(description) {
    const text = description.toLowerCase();

    if (text.includes("thunder")) return "⛈️";
    if (text.includes("snow")) return "❄️";
    if (text.includes("rain") || text.includes("showers")) return "🌧️";
    if (text.includes("fog")) return "🌫️";
    if (text.includes("cloud")) return "☁️";
    if (text.includes("sun") || text.includes("clear")) return "☀️";

    return "🌤️";
}

// Retrieve weather information from the NWS API.
async function getWeather() {
    const coordinates = citySelect.value;
    const selectedCity = citySelect.options[citySelect.selectedIndex].text;

    cityName.textContent = selectedCity;
    temperature.textContent = "--°F";
    conditions.textContent = "Loading weather...";
    wind.textContent = "";
    weatherIcon.textContent = "🌤️";
    forecastContainer.replaceChildren();

    searchButton.disabled = true;

    try {
        // Step 1: Find the forecast URL for these coordinates.
        const pointsResponse = await fetch(
            `https://api.weather.gov/points/${coordinates}`
        );

        if (!pointsResponse.ok) {
            throw new Error("Unable to locate weather forecast.");
        }

        const pointsData = await pointsResponse.json();
        const forecastURL = pointsData.properties.forecast;

        // Step 2: Retrieve the forecast.
        const forecastResponse = await fetch(forecastURL);

        if (!forecastResponse.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        const forecastData = await forecastResponse.json();
        const periods = forecastData.properties.periods;

        if (!periods || periods.length === 0) {
            throw new Error("No forecast information available.");
        }

        // Display the first forecast period.
        const current = periods[0];

        temperature.textContent =
            `${current.temperature}°${current.temperatureUnit}`;

        conditions.textContent = current.shortForecast;
        wind.textContent =
            `Wind: ${current.windSpeed} ${current.windDirection}`;

        weatherIcon.textContent =
            getWeatherEmoji(current.shortForecast);

            animate(
                ".weather-card",
                { opacity: [0, 1], y: [25, 0] },
                { duration: 0.6, ease: "easeOut" }
            );

        // Display the next six forecast periods.
        periods.slice(1, 7).forEach(function(period) {
            const card = document.createElement("article");
            card.className = "forecast-card";

            const heading = document.createElement("h3");
            heading.textContent = period.name;

            const icon = document.createElement("img");
            icon.src = period.icon;
            icon.alt = period.shortForecast;
            icon.loading = "lazy";

            const temp = document.createElement("p");
            temp.textContent =
                `${period.temperature}°${period.temperatureUnit}`;

            const description = document.createElement("p");
            description.textContent = period.shortForecast;

            card.append(heading, icon, temp, description);
            forecastContainer.appendChild(card);
        });

        animate(
            ".forecast-card",
            { opacity: [0, 1], y: [30, 0] },
            {
                duration: 0.6,
                delay: stagger(0.12),
                ease: "easeOut"
            }
        );

    } catch (error) {
        console.error("Weather API error:", error);
        conditions.textContent =
            "Weather unavailable. Please try again.";
        weatherIcon.textContent = "⚠️";
    } finally {
        searchButton.disabled = false;
    }
}

// Get weather when the button is clicked.
searchButton.addEventListener("click", getWeather);

// Load the selected city's forecast automatically.
getWeather();
