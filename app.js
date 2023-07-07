const tempratureDescription = document.querySelector(".temprature-description");
const gustDescription = document.querySelector(".gust-description");
const humidityDescription = document.querySelector(".humidity-description");
const tempratureDegree = document.querySelector(".temprature-degree");
const locationTimezone = document.querySelector(".location-timezone");
const weatherIconImage = document.querySelector(".weather-icon-image");
const degreeSection = document.querySelector(".degree-section");
const tempratureUnit = document.querySelector(".temprature-unit");

const WEATHER_API_KEY = "e06ae411e2964cf18c2105601230707";

window.addEventListener("load", () => {
  let long;
  let lat;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      long = position.coords.longitude;
      lat = position.coords.latitude;
      const locationQuery = lat + "," + long;
      //   const locationQuery = "nairobi";   -> You may do this to develop a weather app query

      const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${locationQuery}`;

      fetch(weatherUrl)
        .then((res) => res.json())

        .then((data) => {
          const {
            temp_c,
            temp_f,
            gust_kph,
            humidity,
            condition: { text: weatherText, icon },
          } = data.current;

          console.log(data);
          const iconPath = icon.replace("//cdn.weatherapi.com", ".");

          const { name, country } = data.location;

          console.log(temp_c, temp_f, weatherText);

          //   render view
          renderView(
            temp_c,
            temp_f,
            gust_kph,
            humidity,
            weatherText,
            iconPath,
            name,
            country
          );
        });
    });
  } else {
    alert("Location permition denied, Please troubleshoot5");
  }
});

const renderView = (
  temp_c,
  temp_f,
  gust_kph,
  humidity,
  weatherText,
  iconPath,
  name,
  country
) => {
  tempratureDegree.textContent = temp_c;
  tempratureUnit.textContent = "°C";
  tempratureDescription.textContent = weatherText;
  gustDescription.textContent = gust_kph + "Km/h";
  humidityDescription.textContent = humidity + "%";
  locationTimezone.textContent = `${name}, ${country}`;
  weatherIconImage.src = iconPath;

  //   Change weather unit on click
  degreeSection.addEventListener("click", () => {
    let unit = tempratureUnit.textContent.slice(1);

    if (unit == "C") {
      tempratureUnit.textContent = "°F";
      tempratureDegree.textContent = temp_f;
    } else {
      tempratureUnit.textContent = "°F";
      tempratureDegree.textContent = temp_c;
    }
  });
};
