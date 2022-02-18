const express = require("express");
const fetch = require("node-fetch");
const { textChangeRangeNewSpan } = require("typescript");
const withQuery = require("with-query").default;

// configure the environment variables
require("dotenv").config();

const OPENWEATHERMAP_KEY = process.env.OPENWEATHERMAP_KEY;
const GIPHY_KEY = process.env.GIPHY_KEY;

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
      console.info(cleanedResults);
      res.status(200).type("application/json");
      res.json(cleanedResults);
    })
    .catch((err) => {
      res.status(400).type("text/html");
      res.send("error: " + JSON.stringify(err));
    });
});

app.get("/api/search-giphy", (req, res) => {
  const url = withQuery("https://api.giphy.com/v1/gifs/search", {
    api_key: GIPHY_KEY,
    q: req.query.q,
    rating: 'g',
    lang: 'en',
    offset: Math.floor(Math.random() * 100),
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
      res.status(400).type("text/html");
      res.send("error: " + JSON.stringify(err));
    });
});

// Export Express app to module.exports
module.exports = app;
