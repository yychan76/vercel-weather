const express = require("express");
const fetch = require("node-fetch");
const withQuery = require("with-query").default;

// configure the environment variables
require("dotenv").config();

const OPENWEATHERMAP_KEY = process.env.OPENWEATHERMAP_KEY;
const GIPHY_KEY = process.env.GIPHY_KEY;

const GIPHY_RANDOM_RANGE = 200;

// create an instance of Express
const app = express();

app.get("/api/weather/:city", (req, res) => {
  const url = withQuery("https://api.openweathermap.org/data/2.5/weather", {
    q: req.params.city,
    units: "metric",
    appid: OPENWEATHERMAP_KEY,
  });
  let country;
  let cityName;
  let temp_min;
  let temp_max;
  console.info(url);
  fetch(url)
    .then((result) => result.json())
    .then((result) => {
      country = result.sys.country;
      cityName = result.name;
      temp_min = result.main.temp_min;
      temp_max = result.main.temp_max;
      return weatherOneCall(result.coord.lat, result.coord.lon);
    })
    .then((result) => {
      console.info("current weather: ", result);
      let cleanedResults = [];
      try {
        result.current.weather.forEach((weather) => {
          cleanedResults.push({
            cityName: cityName,
            lat: result.lat,
            lon: result.lon,
            country: country,
            main: weather.main,
            description: weather.description,
            icon: weather.icon,
            temperature: result.current.temp,
            feels_like: result.current.feels_like,
            temp_min: temp_min,
            temp_max: temp_max,
            humidity: result.current.humidity,
            pressure: result.current.pressure,
            dew_point: result.current.dew_point,
            wind_speed: result.current.wind_speed,
            wind_dir: result.current.wind_deg,
            wind_gust: result.current.wind_gust,
            uvi: result.current.uvi,
            sunrise: result.current.sunrise,
            sunset: result.current.sunset,
            next_sunrises: [result.daily[0].sunrise, result.daily[1].sunrise],
            alerts: result.alerts,
            timestamp: result.current.dt,
            query_timestamp: new Date().getTime(),
          });
        });
      } catch (ex) {
        console.error(ex);
        throw new Error(JSON.stringify(result));
      }

      console.info("cleanedResults: ", cleanedResults);
      res.status(200).type("application/json");
      res.json(cleanedResults);
    })
    .catch((err) => {
      console.error("openweather api return error:", err);
      res.status(400).type("application/json");
      res.json(JSON.parse(err.message));
    });
});

function weatherOneCall(lat, lon) {
  const url = withQuery("https://api.openweathermap.org/data/2.5/onecall", {
    lat: lat,
    lon: lon,
    units: "metric",
    appid: OPENWEATHERMAP_KEY,
  });
  console.info(url);
  return fetch(url)
    .then((result) => result.json())
    .then((json) => {
      return json;
    })
    .catch((err) => {
      console.error(err);
      return "";
    });
}

app.get("/api/search-giphy", (req, res) => {
  const url = withQuery("https://api.giphy.com/v1/gifs/search", {
    api_key: GIPHY_KEY,
    q: req.query.q,
    rating: "g",
    lang: "en",
    offset: Math.floor(Math.random() * GIPHY_RANDOM_RANGE),
    limit: 1,
  });
  console.info(url);
  fetch(url)
    .then((result) => result.json())
    .then((result) => {
      const gifs = result.data.map((d) => {
        return {
          title: d.title,
          imageUrl: d.images.downsized_large.url,
        };
      });
      console.info("gifs: ", gifs);
      res.status(200).type("application/json");
      res.json(gifs);
    })
    .catch((err) => {
      console.error("giphy api return error:", err);
      res.status(400).type("application/json");
      res.json(err);
    });
});

// Export Express app to module.exports
module.exports = app;
