import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, EMPTY, map, Observable, Subscription } from 'rxjs';
import { GeocodeCity, Weather } from 'src/app/common/model';
import { GeocoderService } from 'src/app/common/services/geocoder.service';
import { WeatherService } from 'src/app/common/services/weather.service';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityListComponent implements OnInit {
  weatherCache: { [key: string]: Promise<Weather> } = {};
  @Input() cities: string[] = [
    'My Location',
    'Singapore, SG',
    'Seoul, KR',
    'Kuala Lumpur, MY',
    'Hong Kong, CN',
    'London, GB',
    'Washington, US',
  ];
  form!: FormGroup;
  sub = new Subscription();
  citySearchResults!: Observable<GeocodeCity[]>;

  constructor(
    private fb: FormBuilder,
    private geocoderService: GeocoderService,
    private weatherService: WeatherService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
    this.loadCities();
    // this.loadWeatherForCities();
  }

  ngOnInit() {
    this.createForm();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  createForm() {
    this.form = this.fb.group({
      city: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.sub.add(
      this.form
        .get('city')!
        .valueChanges.pipe(debounceTime(1000))
        .subscribe((query) => {
          console.info('city search term: ', query);
          if (query) {
            this.citySearchResults = this.geocoderService.getCities(query);
            this.getGlanceWeatherForSearchResults(this.citySearchResults);
            // since we are not doing change detection always, check it when search value changes
            this.ref.markForCheck();
          } else {
            this.citySearchResults = EMPTY;
          }
        })
    );
  }

  getCityStrWithGeoCode(city: GeocodeCity): string {
    return (
      city.name +
      ',' +
      (city.state ? city.state + ',' : '') +
      city.country +
      '_' +
      city.lat +
      ',' +
      city.lon
    );
  }

  getGlanceWeatherForSearchResults(searchResults: Observable<GeocodeCity[]>) {
    // console.info('getGlanceWeatherForSearchResults');
    this.sub.add(
      searchResults
        .pipe(
          map((cities) => {
            cities.forEach((city) => {
              const weatherSearchString = this.getCityStrWithGeoCode(city);
              // console.info('weatherSearchString: ', weatherSearchString);
              if (!this.weatherCache[weatherSearchString]) {
                const weather = this.getWeatherPromise(weatherSearchString);
                if (weather) {
                  this.weatherCache[weatherSearchString] = weather;
                }
              }
            });
          })
        )
        .subscribe(() => { /* subscribe to call the observable */ })
    );
  }

  getFlagEmoji(countryCode: string) {
    return this.geocoderService.getFlagEmoji(countryCode);
  }

  getCountryName(countryCode: string) {
    return this.geocoderService.getCountryName(countryCode);
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this.router.navigate(['/weatherlocation', '_' + lat + ',' + lon]);
      });
    } else {
      console.info('Geolocation not supported');
    }
    return 'my_location';
  }

  populateLocationCities(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        var results;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        results = this.geocoderService.getCurrentLocationCities(lat, lon);
        if (results) {
          this.citySearchResults = results;
        } else {
          this.citySearchResults = EMPTY;
        }
      });
    } else {
      console.info('Geolocation not supported');
    }
  }

  loadCities() {
    console.info('loadCities');
    let savedCities = localStorage.getItem('cities');
    if (savedCities) {
      JSON.parse(savedCities)
        .filter((c: string) => !this.cities.includes(c))
        .forEach((c: string) => {
          this.cities.push(c);
        });
      console.info(`Loaded ${this.cities.length} cities`);
    }
  }

  loadWeatherForCities() {
    console.info('loadWeatherForCities');
    let savedCities = localStorage.getItem('cities');
    if (savedCities) {
      JSON.parse(savedCities)
        .filter((c: string) => this.cities.includes(c)) // only load weather for loaded cities
        .forEach((c: string) => {
          console.info(`loadWeather: ${c}`);
          if (c != 'My Location') {
            const weather = this.getWeatherPromise(c);
            console.info('typeof weather: ', weather);
            if (weather && !this.weatherCache[c]) {
              this.weatherCache[c] = weather;
            }
          }
        });
      console.info(`Loaded weather for ${this.cities.length} cities`);
      console.info(`weatherCache:`);
      console.dir(this.weatherCache);
      this.ref.markForCheck();
    }
  }

  displayCity(city: string) {
    // console.info('displayCity:', city);
    let lat, lon;
    let geoTokens = city.split('_');
    if (geoTokens.length == 2) {
      [lat, lon] = geoTokens[1].split(',').map((val) => parseFloat(val));
    }
    let nameTokens = geoTokens[0].split(',').map((c: string) => c.trim());
    if (nameTokens.length > 1) {
      if (nameTokens[nameTokens.length - 1].length == 2) {
        let countryCode = nameTokens.pop() || '';
        let state =
          nameTokens.length == 2
            ? ' <small><em>' + nameTokens.pop() + '</em></small>'
            : '';
        return (
          nameTokens[0] +
          state +
          ' <strong>' +
          countryCode +
          '</strong> <span class="flag">' +
          this.geocoderService.getFlagEmoji(countryCode) +
          ' </span>' +
          (lat && lon
            ? '<span class="coordinates">(' +
              lat.toFixed(3) +
              ', ' +
              lon.toFixed(3) +
              ')</span>'
            : '')
        );
      }
    }
    // return it unchanged
    return city;
  }

  getWeatherPromise(city: string): Promise<Weather> {
    // console.info('getWeatherPromise:', city);
    // if (city == 'My Location') {
    //   return {} as Weather;
    // }
    return this.weatherService.getCachedWeatherGlance(city);
  }

  addCity(formDirective: FormGroupDirective) {
    // let city = this.form.value.city.trim().toLowerCase();
    let city = this.form.value.city.trim();
    console.info(city);
    if (!this.cities.includes(city)) {
      this.cities.push(city);
      localStorage.setItem('cities', JSON.stringify(this.cities));
    }
    console.info(this.cities);
    this.form.reset();
    formDirective.resetForm();
  }

  deleteCity(city: string): void {
    this.cities = this.cities.filter((c) => c != city);
    localStorage.setItem('cities', JSON.stringify(this.cities));
  }
}
