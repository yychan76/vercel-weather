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

// Geocoding to find latitude and longitude from city name
app.get("/api/geo/direct/:city(*)", (req, res) => {
  const url = withQuery("http://api.openweathermap.org/geo/1.0/direct", {
    q: req.params.city,
    limit: 5,
    appid: OPENWEATHERMAP_KEY,
  });
  console.info(url);
  fetch(url)
    .then((result) => result.json())
    .then((result) => {
      console.info("Geocoding direct result: ", result);

      res.status(200).type("application/json");
      res.json(result);
    })
    .catch((err) => {
      console.error("openweather geocoding direct api return error:", err);
      res.status(400).type("application/json");
      res.json(JSON.parse(err.message));
    });
});

// Geocoding to find latitude and longitude from zipcode,country code
app.get("/api/geo/zip/:zipCountry", (req, res) => {
  const url = withQuery("http://api.openweathermap.org/geo/1.0/zip", {
    zip: req.params.zipCountry,
    appid: OPENWEATHERMAP_KEY,
  });
  console.info(url);
  fetch(url)
    .then((result) => result.json())
    .then((result) => {
      res.status(200).type("application/json");
      res.json(result);
    })
    .catch((err) => {
      console.error("openweather geocoding zip api return error:", err);
      res.status(400).type("application/json");
      res.json(JSON.parse(err.message));
    });
});

// Reverse Geocoding to find city name from latitude and longitude
app.get("/api/geo/reverse/lat/:lat/lon/:lon", (req, res) => {
  const url = withQuery("http://api.openweathermap.org/geo/1.0/reverse", {
    lat: req.params.lat,
    lon: req.params.lon,
    limit: 5,
    appid: OPENWEATHERMAP_KEY,
  });
  console.info(url);
  fetch(url)
    .then((result) => result.json())
    .then((result) => {
      res.status(200).type("application/json");
      res.json(result);
    })
    .catch((err) => {
      console.error("openweather geocoding reverse api return error:", err);
      res.status(400).type("application/json");
      res.json(JSON.parse(err.message));
    });
});

// app.get("/api/weather/:city", (req, res) => {
//   const url = withQuery("https://api.openweathermap.org/data/2.5/weather", {
//     q: req.params.city,
//     units: "metric",
//     appid: OPENWEATHERMAP_KEY,
//   });
//   let country;
//   let cityName;
//   let temp_min;
//   let temp_max;
//   console.info(url);
//   fetch(url)
//     .then((result) => result.json())
//     .then((result) => {
//       country = result.sys.country;
//       cityName = result.name;
//       temp_min = result.main.temp_min;
//       temp_max = result.main.temp_max;
//       return weatherOneCall(result.coord.lat, result.coord.lon);
//     })
//     .then((result) => {
//       console.info("current weather: ", result);
//       let cleanedResults = [];
//       try {
//         result.current.weather.forEach((weather) => {
//           cleanedResults.push({
//             cityName: cityName,
//             lat: result.lat,
//             lon: result.lon,
//             timezone_offset: result.timezone_offset,
//             country: country,
//             main: weather.main,
//             description: weather.description,
//             icon: weather.icon,
//             temperature: result.current.temp,
//             feels_like: result.current.feels_like,
//             temp_min: temp_min,
//             temp_max: temp_max,
//             humidity: result.current.humidity,
//             pressure: result.current.pressure,
//             dew_point: result.current.dew_point,
//             wind_speed: result.current.wind_speed,
//             wind_dir: result.current.wind_deg,
//             wind_gust: result.current.wind_gust,
//             uvi: result.current.uvi,
//             rain: result.current.rain ? result.current.rain["1h"] : 0,
//             snow: result.current.snow ? result.current.snow["1h"] : 0,
//             sunrise: result.current.sunrise,
//             sunset: result.current.sunset,
//             next_sunrises: [result.daily[0].sunrise, result.daily[1].sunrise],
//             alerts: result.alerts,
//             hourly: result.hourly,
//             daily: result.daily,
//             minutely: result.minutely,
//             timestamp: result.current.dt,
//             query_timestamp: new Date().getTime(),
//           });
//         });
//       } catch (ex) {
//         console.error(ex);
//         throw new Error(JSON.stringify(result));
//       }

//       console.info("cleanedResults: ", cleanedResults);
//       res.status(200).type("application/json");
//       res.json(cleanedResults);
//     })
//     .catch((err) => {
//       console.error("openweather api return error:", err);
//       res.status(400).type("application/json");
//       res.json(JSON.parse(err.message));
//     });
// });

// get the onecall weather for the city by first doing a geocode lookup
// need to use (*) to match all characters as some locations use the hyphen
// that clashes with default express.js hyphen handling for route param
app.get("/api/weather/v2/:city(*)", (req, res) => {
  let country;
  let cityName;
  let stateName;

  getGeocodeLocationFromString(req.params.city)
    .then((result) => {
      console.info("result from getGeocodeLocationFromString:", result);
      return result[0];
    })
    .then((result) => {
      if (result) {
        cityName = result.name;
        country = result.country;
        stateName = result.state;
        return weatherOneCall(result.lat, result.lon);
      } else {
        throw new Error(JSON.stringify({ message: "Location not found" }));
      }
    })
    .then((result) => {
      console.info("onecall current weather: ", result);
      let cleanedResults = [];
      try {
        result.current.weather.forEach((weather) => {
          cleanedResults.push({
            cityName: cityName,
            stateName: stateName,
            lat: result.lat,
            lon: result.lon,
            timezone_offset: result.timezone_offset,
            country: country,
            main: weather.main,
            description: weather.description,
            icon: weather.icon,
            temperature: result.current.temp,
            feels_like: result.current.feels_like,
            temp_min: result.daily[0].temp.min,
            temp_max: result.daily[0].temp.max,
            humidity: result.current.humidity,
            pressure: result.current.pressure,
            dew_point: result.current.dew_point,
            wind_speed: result.current.wind_speed,
            wind_dir: result.current.wind_deg,
            wind_gust: result.current.wind_gust,
            uvi: result.current.uvi,
            rain: result.current.rain ? result.current.rain["1h"] : 0,
            snow: result.current.snow ? result.current.snow["1h"] : 0,
            sunrise: result.current.sunrise,
            sunset: result.current.sunset,
            next_sunrises: [result.daily[0].sunrise, result.daily[1].sunrise],
            alerts: result.alerts,
            hourly: result.hourly,
            daily: result.daily,
            minutely: result.minutely,
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
      console.error("openweather onecall api return error:", err);
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

// determine which lookup to use
function getGeocodeLocationFromString(string) {
  // if the string only has the coordinates, use that
  if (string.startsWith("_")) {
    const [lat, lon] = string.substr(1).split(",");
    return getGeocodeLocationFromLocation(lat, lon);
  } else if (string.includes("_")) {
    // if string includes the coordinates,

    const [lat, lon] = string.substr(string.indexOf("_") + 1).split(",");
    let city = string.split("_")[0] || "";
    let result = getGeocodeLocationFromCity(city);

    // console.info("getGeocodeLocationFromCity:", result);

    console.info("lat: " + lat + ", lon: " + lon);
    return result
      .then((resolved) => {
        // console.info("resolved promise: ", resolved);
        // filter to the result that matches the coordinates
        let filtered = resolved.filter((item) => {
          return floatsEqual(item.lat, lat) && floatsEqual(item.lon, lon);
        });
        console.info(`filtered promise ${filtered.length}: ${filtered}`);
        return filtered;
      })
      .then((filtered) => {
        if (Array.isArray(filtered) && filtered.length) {
          console.info(
            `Filtered contains ${
              filtered.length
            } item. Returning: ${JSON.stringify(filtered)}`
          );
          return filtered;
        } else {
          console.error(
            "Filtered has no items. Using location geocode instead"
          );
          // fallback to search with coordinates if no results from city name search
          return getGeocodeLocationFromLocation(lat, lon);
        }
      });
  } else {
    // otherwise search with just the name
    return getGeocodeLocationFromCity(string);
  }
}

// returns true if the two floats x, y are equal within tolerance epsilon
function floatsEqual(x, y, epsilon = 1e-9) {
  return Math.abs(parseFloat(x) - parseFloat(y)) < epsilon;
}

// do a direct geocoder lookup to find matching cities
function getGeocodeLocationFromCity(city) {
  console.info("getGeocodeLocationFromCity: ", city);
  const url = withQuery("http://api.openweathermap.org/geo/1.0/direct", {
    q: decodeURI(city),
    limit: 5,
    appid: OPENWEATHERMAP_KEY,
  });
  console.info(url);
  return fetch(url)
    .then((result) => result.json())
    .then((json) => {
      console.info("getGeocodeLocationFromCity result: ", json);
      return json;
    })
    .catch((err) => {
      console.error("getGeocodeLocationFromCity error: ".err);
      return "";
    });
}

// do a reverse geocoder lookup
function getGeocodeLocationFromLocation(lat, lon) {
  const url = withQuery("http://api.openweathermap.org/geo/1.0/reverse", {
    lat: lat,
    lon: lon,
    limit: 5,
    appid: OPENWEATHERMAP_KEY,
  });
  console.info(url);
  return fetch(url)
    .then((result) => result.json())
    .then((json) => {
      console.info(
        `getGeocodeLocationFromLocation result for (${lat}, ${lon}): `,
        json
      );
      return json;
    })
    .catch((err) => {
      console.error("getGeocodeLocationFromLocation error: ", err);
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
