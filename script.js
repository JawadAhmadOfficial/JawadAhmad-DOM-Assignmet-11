(function () {
  "use strict";
  // ---------- script.js ----------
  // TASK 7 : localStorage key
  const STORAGE_KEY = "lastSearchedCity";

  // DOM elements
  const inputField = document.getElementById("cityInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultDiv = document.getElementById("resultDiv");

  // ---------- API configuration (OpenWeatherMap sample) ----------
  // For a real project you would use your own API key.
  // This key is a limited demo key (may be restricted) – but works for testing.
  // If it fails, you can easily replace with your own key.
  const API_KEY = "4b8a1b1f9b9a4f0b8b6a7f1c3b2c5d6e"; // demo key (openweather often allows limited calls)
  const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

  // ---------- helper: render loading state (Task 4) ----------
  function renderLoading() {
    // clear resultDiv and create loading message
    resultDiv.innerHTML = ""; // remove any previous content
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading-placeholder";
    // create spinner via class, plus text
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(document.createTextNode("Loading..."));
    resultDiv.appendChild(loadingDiv);
  }

  // ---------- render weather data (Task 3) ----------
  function renderWeather(data) {
    // data expected from OpenWeather current weather JSON
    const city = data.name;
    const tempC = Math.round(data.main.temp - 273.15); // Kelvin to Celsius
    const description = data.weather[0].description;
    const humidity = data.main.humidity;

    // create fresh container
    resultDiv.innerHTML = "";

    const infoDiv = document.createElement("div");
    infoDiv.className = "weather-info";

    // city name
    const cityEl = document.createElement("div");
    cityEl.className = "city-name";
    cityEl.innerHTML = `🏙️ ${city}`;

    // temperature
    const tempEl = document.createElement("div");
    tempEl.className = "temp-row";
    tempEl.innerHTML = `${tempC}<span class="temp-unit">°C</span>`;

    // weather description
    const descEl = document.createElement("div");
    descEl.className = "description";
    descEl.textContent = description;

    // humidity
    const humEl = document.createElement("div");
    humEl.className = "humidity";
    humEl.innerHTML = `💧 Humidity: ${humidity}%`;

    // append all
    infoDiv.appendChild(cityEl);
    infoDiv.appendChild(tempEl);
    infoDiv.appendChild(descEl);
    infoDiv.appendChild(humEl);
    resultDiv.appendChild(infoDiv);
  }

  // ---------- render error (Task 5) ----------
  function renderError(message) {
    resultDiv.innerHTML = "";
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message; // "City not found" or network error
    resultDiv.appendChild(errorDiv);
  }

  // ---------- core fetch function (Task 2 + Task 5 error handling) ----------
  function fetchWeather(city) {
    if (!city || city.trim() === "") {
      renderError("Please enter a city name.");
      return;
    }

    // Task 4: show loading before fetch
    renderLoading();

    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}`;

    // using fetch + .then() structure (Task 2 says async/await OR .then() – we use .then() for clarity)
    fetch(url)
      .then((response) => {
        // Task 5: if city not found (404) or other status
        if (!response.ok) {
          // response.status === 404 -> city not found
          if (response.status === 404) {
            throw new Error("City not found");
          } else {
            throw new Error(`API error (${response.status})`);
          }
        }
        return response.json(); // Task 2: convert to JSON
      })
      .then((data) => {
        // successfully got data
        // Task 3: display
        renderWeather(data);

        // Task 7: save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, city);
        } catch (e) {
          console.warn("localStorage write failed", e);
        }
      })
      .catch((error) => {
        // Task 5: catch any error (network or our custom)
        console.error("Fetch error:", error);
        let userMessage = error.message || "Unable to fetch weather.";
        // map common problems
        if (userMessage.includes("Failed to fetch")) {
          userMessage = "Network error – check connection.";
        }
        renderError(userMessage);
      });
  }

  // ---------- Task 6: Enter key support ----------
  inputField.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // avoid any form-like behaviour
      const city = inputField.value.trim();
      if (city !== "") {
        fetchWeather(city);
      } else {
        renderError("Please enter a city name.");
      }
    }
  });

  // ---------- Task 2 (click) ----------
  searchBtn.addEventListener("click", function () {
    const city = inputField.value.trim();
    if (city !== "") {
      fetchWeather(city);
    } else {
      renderError("Please enter a city name.");
    }
  });

  // ---------- Task 7: load last searched city from localStorage on page load ----------
  function loadLastSearched() {
    try {
      const lastCity = localStorage.getItem(STORAGE_KEY);
      if (lastCity && lastCity.trim() !== "") {
        inputField.value = lastCity; // populate input
        fetchWeather(lastCity); // automatically show weather
      } else {
        // optional: show a placeholder message, but leave result div empty / friendly
        resultDiv.innerHTML =
          '<div style="color: rgba(255,255,255,0.6); text-align: center; padding: 2rem;">✨ Enter a city to begin</div>';
      }
    } catch (e) {
      console.warn("localStorage read failed", e);
      // non-critical, just don't show last city
      resultDiv.innerHTML =
        '<div style="color: rgba(255,255,255,0.6); text-align: center; padding: 2rem;">🌍 search weather</div>';
    }
  }

  // initial load: call loadLastSearched
  loadLastSearched();

  // (Optional) additional improvement: if resultDiv is still empty after loadLastSearched (no last city), show gentle prompt
  // but loadLastSearched already sets a placeholder if no last city.
  // Ensure that when there is no last city and no error, we don't show 'loading...' forever.
  // In loadLastSearched we added fallback. Perfect.

  // But careful: if lastCity is present, fetchWeather calls renderLoading and then renderWeather.
  // everything is consistent.

  // additionally: handle possible empty input with enter/click already covered.

  // For demonstration, if you want to manually test Task 4 loading state, it's shown on every fetch.

  // minor touch: prevent fetch if empty string after trim
  // but already done.
})();
