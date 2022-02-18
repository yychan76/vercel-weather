const express = require("express");
const fetch = require("node-fetch");
const { textChangeRangeNewSpan } = require("typescript");
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
    appid: OPENWEATHERMAP_KEY,
    units: "metric",
  });
  console.info(url);
  fetch(url)
    .then((result) => result.json())
    .then((result) => {
      console.info(result);
      let cleanedResults = [];
      try {
        result.weather.forEach((weather) => {
          cleanedResults.push({
            cityName: result.name,
            country: result.sys.country,
            main: weather.main,
            description: weather.description,
            icon: weather.icon,
            temperature: result.main.temp,
            feels_like: result.main.feels_like,
            temp_min: result.main.temp_min,
            temp_max: result.main.temp_max,
            humidity: result.main.humidity,
            timestamp: result.dt,
            query_timestamp: new Date().getTime(),
          });
        });
      } catch (ex) {
        console.error(ex);
        throw new Error(JSON.stringify(result));
      }

      console.info(cleanedResults);
      res.status(200).type("application/json");
      res.json(cleanedResults);
    })
    .catch((err) => {
      console.error("openweather api return error:", err);
      res.status(400).type("application/json");
      res.json(JSON.parse(err.message));
    });
});

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
