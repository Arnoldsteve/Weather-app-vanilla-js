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

  // Change background depending on weather + day/night
  setDynamicBackground(weatherText, is_day);

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

// ========== Background ==========
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
