import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _moment from 'moment';
import { lastValueFrom, map, Subscription } from 'rxjs';
import { Weather } from 'src/app/common/model';
import { GiphyService } from 'src/app/common/services/giphy.service';
import { WeatherService } from 'src/app/common/services/weather.service';


const moment = _moment;
const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'region' });
const regionNamesInTraditionalChinese = new Intl.DisplayNames(['zh-Hant'], {
  type: 'region',
});

@Component({
  selector: 'app-weather-detail',
  templateUrl: './weather-detail.component.html',
  styleUrls: ['./weather-detail.component.scss'],
})
export class WeatherDetailComponent implements OnInit, OnDestroy {
  city!: string;
  weatherList!: Weather[];
  sub$!: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
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
    this.city = this.activatedRoute.snapshot.params['city'];
    this.sub$ = this.weatherService
      .getWeather(this.city)
      .pipe(
        map((weathers) => {
          // the array of weather results from openweathermap
          // console.info('weathers: ', weathers);
          weathers.forEach((weather) => {
            // go through each member of the array and look for a giphy image
            // console.info('weather: ', weather);
            lastValueFrom(this.giphyService.search('weather ' + weather.main + ' ' + weather.description)).then(
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
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // https://dev.to/jorik/country-code-to-flag-emoji-a21
  getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  getCountryName(countryCode: string) {
    return regionNamesInEnglish.of(countryCode);
  }

  getCacheAge(timestamp: number) {
    let timestampDate = moment(timestamp * 1000);
    let timeDiff = moment.duration(timestampDate.diff(moment())).humanize(true);
    return `${timeDiff} at ${timestampDate}`;
  }
}
