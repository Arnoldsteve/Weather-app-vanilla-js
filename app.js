const tempratureDescription = document.querySelector(".temprature-description");
const gustDescription = document.querySelector(".gust-description");
const humidityDescription = document.querySelector(".humidity-description");
const tempratureDegree = document.querySelector(".temprature-degree");
const locationTimezone = document.querySelector(".location-timezone");
const weatherIconImage = document.querySelector(".weather-icon-image");
const degreeSection = document.querySelector(".degree-section");
const tempratureUnit = document.querySelector(".temprature-unit");

const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");

const WEATHER_API_KEY = "e06ae411e2964cf18c2105601230707";
const UNSPLASH_ACCESS_KEY = "CKo2WUbWk3JRrkZhtkN-ViIwX6uQgxS0nmYAMhOvwME"; 

// Cache for storing fetched background images
const backgroundCache = {};

// ========== Fetch Weather Function ==========
const fetchWeather = (query) => {
  const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${query}`;

  fetch(weatherUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert("Location not found. Try another search.");
        return;
      }

      const {
        temp_c,
        temp_f,
        gust_kph,
        humidity,
        condition: { text: weatherText, icon },
        is_day,
      } = data.current;

      const { name, country } = data.location;
      const iconPath = icon.replace("//cdn.weatherapi.com", ".");

      renderView(
        temp_c,
        temp_f,
        gust_kph,
        humidity,
        weatherText,
        iconPath,
        name,
        country,
        is_day
      );
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to fetch weather data.");
    });
};

// ========== Initial Weather (Geolocation) ==========
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const long = position.coords.longitude;
      const lat = position.coords.latitude;
      fetchWeather(`${lat},${long}`);
    });
  } else {
    fetchWeather("Nairobi"); // fallback
  }
});

// ========== Search Feature ==========
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchWeather(query);
    searchInput.value = "";
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// ========== Render Weather ==========
const renderView = (
  temp_c,
  temp_f,
  gust_kph,
  humidity,
  weatherText,
  iconPath,
  name,
  country,
  is_day
) => {
  tempratureDegree.textContent = temp_c;
  tempratureUnit.textContent = "°C";
  tempratureDescription.textContent = weatherText;
  gustDescription.textContent = gust_kph + " Km/h";
  humidityDescription.textContent = humidity + "%";
  locationTimezone.textContent = `${name}, ${country}`;
  weatherIconImage.src = iconPath;

  // Set location-specific background first, fallback to weather-based
  setLocationBackground(name, country, weatherText, is_day);

  // Toggle unit
  degreeSection.onclick = () => {
    let unit = tempratureUnit.textContent.slice(1);

    if (unit === "C") {
      tempratureUnit.textContent = "°F";
      tempratureDegree.textContent = temp_f;
    } else {
      tempratureUnit.textContent = "°C";
      tempratureDegree.textContent = temp_c;
    }
  };
};

// ========== Location Background Function ==========
const setLocationBackground = async (cityName, country, weatherCondition, is_day) => {
  const backgroundContainer = document.querySelector(".background-container");
  const cacheKey = `${cityName}_${country}`.toLowerCase();

  // Check cache first
  if (backgroundCache[cacheKey]) {
    backgroundContainer.style.backgroundImage = `url('${backgroundCache[cacheKey]}')`;
    return;
  }

  // Set weather-based background immediately as fallback
  setDynamicBackground(weatherCondition, is_day);

  // Try to get location-specific background
  try {
    const locationImage = await fetchLocationImage(cityName, country);
    if (locationImage) {
      backgroundCache[cacheKey] = locationImage;
      backgroundContainer.style.backgroundImage = `url('${locationImage}')`;
    }
  } catch (error) {
    console.log("Location image fetch failed, using weather-based background");
    // Weather-based background is already set above
  }
};

// ========== Fetch Location Image from Unsplash ==========
const fetchLocationImage = async (cityName, country) => {
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === "CKo2WUbWk3JRrkZhtkN-ViIwX6uQgxS0nmYAMhOvwME") {
    console.log("Unsplash API key not configured, using weather-based backgrounds");
    return null;
  }

  const queries = [
    `${cityName} landmark`,
    `${cityName} city skyline`,
    `${cityName} ${country}`,
    `${country} landscape`
  ];

  for (const query of queries) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.regular;
        }
      }
    } catch (error) {
      console.log(`Failed to fetch image for query: ${query}`);
      continue;
    }
  }

  return null; // No image found
};

// ========== Original Weather-based Background (Fallback) ==========
const setDynamicBackground = (condition, is_day) => {
  const backgroundContainer = document.querySelector(".background-container");

  const weather = condition.toLowerCase();
  let imageUrl = "";

  if (weather.includes("sun") || weather.includes("clear")) {
    imageUrl = is_day
      ? "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=2000&q=80"
      : "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=2000&q=80";
  } else if (weather.includes("cloud")) {
    imageUrl =
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=2000&q=80";
  } else if (weather.includes("rain")) {
    imageUrl =
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80";
  } else if (weather.includes("snow")) {
    imageUrl =
      "https://images.unsplash.com/photo-1608889175123-6d958a11a2e2?auto=format&fit=crop&w=2000&q=80";
  } else if (weather.includes("storm") || weather.includes("thunder")) {
    imageUrl =
      "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=2000&q=80";
  } else if (
    weather.includes("fog") ||
    weather.includes("mist") ||
    weather.includes("haze")
  ) {
    imageUrl =
      "https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=2000&q=80";
  } else {
    imageUrl =
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=2000&q=80";
  }

  backgroundContainer.style.backgroundImage = `url('${imageUrl}')`;
};