import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { icon, Icon, latLng, marker, tileLayer } from 'leaflet';
import * as _moment from 'moment';
import { catchError, lastValueFrom, map, of, Subscription } from 'rxjs';
import { Coordinates, MinutelyForecast, Weather } from 'src/app/common/model';
import { GeocoderService } from 'src/app/common/services/geocoder.service';
import { GiphyService } from 'src/app/common/services/giphy.service';
import { WeatherService } from 'src/app/common/services/weather.service';
import { environment } from 'src/environments/environment';

const moment = _moment;

@Component({
  selector: 'app-weather-detail',
  templateUrl: './weather-detail.component.html',
  styleUrls: ['./weather-detail.component.scss'],
})
export class WeatherDetailComponent implements OnInit, OnDestroy {
  city!: string;
  coordinates!: Coordinates;
  weatherList!: Weather[];
  sub$!: Subscription;
  mapOptions: any;
  mapLayers: any;
  mapLayersControl: any;
  appid = environment.openweathermapKey;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private geocoderService: GeocoderService,
    private weatherService: WeatherService,
    private giphyService: GiphyService
  ) {}

  ngOnInit(): void {
    this.populateWeather();
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }

  populateWeather() {
    // this.city = this.activatedRoute.snapshot.params['city'];
    this.activatedRoute.paramMap.subscribe((params) => {
      this.city = params.get('city') || '';
      this.sub$ = this.weatherService
        .getWeather(this.city)
        .pipe(
          catchError((err) => {
            console.error('observable error: ', err);
            return of([err.error]);
          }),
          map((weathers) => {
            // the array of weather results from openweathermap
            // console.info('weathers: ', weathers);
            weathers.forEach((weather) => {
              // go through each member of the array and look for a giphy image
              // console.info('weather: ', weather);
              let giphy_search_term = '';
              if (weather.cod == '404') {
                giphy_search_term = '404 not found';
              } else {
                giphy_search_term =
                  'weather ' + weather.main + ' ' + weather.description;
              }
              lastValueFrom(this.giphyService.search(giphy_search_term)).then(
                (result) => {
                  // apply the giphy image result to the weather object
                  // console.info('giphy: ', result);
                  weather.gif_title = result[0].title;
                  weather.gif_url = result[0].imageUrl;
                }
              );
            });
            // make sure to return the result for the map as not using implicit return
            return weathers;
          })
        )
        .subscribe((result) => {
          console.info('subscribe: ', result);
          this.weatherList = result;
          // initialise the map
          this.initMap(result[0].lat, result[0].lon);
        });
    });
  }

  initMap(lat: number, lon: number): void {
    this.mapOptions = {
      layers: [
        tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors.',
        }),
      ],
      zoom: 12,
      center: latLng(lat, lon),
    };

    // define this here and add to the mapLayers so that it will be selected by default
    var precipitationLayer = tileLayer(
      `http://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${this.appid}`,
      {
        maxZoom: 18,
        attribution: '&copy; <a href="http://owm.io">VANE</a>',
        id: 'precipitation',
      }
    );

    var cloudsLayer = tileLayer(
      `http://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${this.appid}`,
      {
        maxZoom: 18,
        attribution: '&copy; <a href="http://owm.io">VANE</a>',
        id: 'clouds',
      }
    );

    this.mapLayers = [
      // circle([lat, lon], { radius: 5000 }),
      marker([lat, lon], {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      }),
      // here it will be selected and displayed by default
      precipitationLayer,
      cloudsLayer,
    ];

    this.mapLayersControl = {
      overlays: {
        Temperature: tileLayer(
          `http://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${this.appid}`,
          {
            maxZoom: 18,
            attribution: '&copy; <a href="http://owm.io">VANE</a>',
            id: 'temp',
          }
        ),
        // shows the control for the layer
        Clouds: cloudsLayer,
        Precipitation: precipitationLayer,
        Wind: tileLayer(
          `http://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${this.appid}`,
          {
            maxZoom: 18,
            attribution: '&copy; <a href="http://owm.io">VANE</a>',
            id: 'wind',
          }
        ),
        Pressure: tileLayer(
          `http://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${this.appid}`,
          {
            maxZoom: 18,
            attribution: '&copy; <a href="http://owm.io">VANE</a>',
            id: 'pressure',
          }
        ),
      },
    };
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getFlagEmoji(countryCode: string) {
    return this.geocoderService.getFlagEmoji(countryCode);
  }

  getCountryName(countryCode: string) {
    return this.geocoderService.getCountryName(countryCode);
  }

  getCacheAge(timestamp: number) {
    let timestampDate = moment(timestamp * 1000);
    let timeDiff = moment.duration(timestampDate.diff(moment())).humanize(true);
    return `${timeDiff} at ${timestampDate}`;
  }

  isDayTime(
    sunrise: number,
    sunset: number,
    utcOffsetSeconds: number,
    timestamp: number = 0
  ): boolean {
    const timeFormat = 'HH:mm:ss';
    const utcOffsetHours = utcOffsetSeconds / 3600;
    var momentObj;
    if (timestamp == 0) {
      momentObj = moment(
        moment().utcOffset(utcOffsetHours).format(timeFormat),
        timeFormat
      );
    } else {
      momentObj = moment(
        moment.unix(timestamp).utcOffset(utcOffsetHours).format(timeFormat),
        timeFormat
      );
    }
    const sunriseMoment = moment(
      moment.unix(sunrise).utcOffset(utcOffsetHours).format(timeFormat),
      timeFormat
    );
    const sunsetMoment = moment(
      moment.unix(sunset).utcOffset(utcOffsetHours).format(timeFormat),
      timeFormat
    );
    if (momentObj.isBetween(sunriseMoment, sunsetMoment)) {
      return true;
    } else {
      return false;
    }
  }

  getTimeOfDayColor(
    sunrise: number,
    sunset: number,
    utcOffsetSeconds: number,
    timestamp: number = 0
  ): string {
    if (this.isDayTime(sunrise, sunset, utcOffsetSeconds, timestamp)) {
      return 'burlywood';
    } else {
      return 'steelblue';
    }
  }

  degreeToDirection(degree: number) {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    // offset for fitting into the cardinal brackets
    // N: 348.75 - 11.25
    // NNE: 11.25 - 33.75
    // http://snowfence.umn.edu/Components/winddirectionanddegrees.htm
    degree += 11.25;
    // conform to 0-360
    degree = degree < 0 ? 360 - (Math.abs(degree) % 360) : degree % 360;
    return `${directions[(degree / 22.5) | 0]}`;
  }

  uvIndexLabel(uvIndex: number) {
    if (uvIndex < 3) {
      return 'Low';
    } else if (uvIndex < 6) {
      return 'Moderate';
    } else if (uvIndex < 8) {
      return 'High';
    } else if (uvIndex < 11) {
      return 'Very High';
    } else {
      return 'Extreme';
    }
  }

  uvIndexLabelStyle(uvIndex: number) {
    if (uvIndex < 3) {
      return 'color: #579c00;font-weight: bold;';
    } else if (uvIndex < 6) {
      return 'color: #f8ce09;font-weight: bold;';
    } else if (uvIndex < 8) {
      return 'color: #ff8400;font-weight: bold;';
    } else if (uvIndex < 11) {
      return 'color: #d83030;font-weight: bold;';
    } else {
      return 'color: #a061d1;font-weight: bold;';
    }
  }

  hasPrecipitation(minutelyForecast: MinutelyForecast[]) {
    if (minutelyForecast == undefined) {
      return false;
    }
    for (let forecast of minutelyForecast) {
      if (forecast.precipitation > 0) {
        return true;
      }
    }
    return false;
  }
}
