import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, EMPTY, Observable, of, Subscription } from 'rxjs';
import { GeocodeCity } from 'src/app/common/model';
import { GeocoderService } from 'src/app/common/services/geocoder.service';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.scss'],
})
export class CityListComponent implements OnInit {
  cities: string[] = [
    'My Location',
    'Singapore, SG',
    'Seoul, KR',
    'Kuala Lumpur, MY',
    'Hong Kong, CN',
    'London, GB',
    'Washington, US',
  ];
  form!: FormGroup;
  sub!: Subscription;
  citySearchResults!: Observable<GeocodeCity[]>;

  constructor(
    private fb: FormBuilder,
    private geocoderService: GeocoderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createForm();
    this.loadCities();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  createForm() {
    this.form = this.fb.group({
      city: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.sub = this.form
      .get('city')!
      .valueChanges.pipe(debounceTime(1000))
      .subscribe((query) => {
        console.log('city search term: ', query);
        if (query) {
          this.citySearchResults = this.geocoderService.getCities(query);
        } else {
          this.citySearchResults = EMPTY;
        }
      });
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
    let savedCities = localStorage.getItem('cities');
    if (savedCities) {
      JSON.parse(savedCities)
        .filter((c: string) => !this.cities.includes(c))
        .forEach((c: string) => {
          this.cities.push(c);
        });
    }
  }

  displayCity(city: string) {
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

  addCity(formDirective: FormGroupDirective) {
    // let city = this.form.value.city.trim().toLowerCase();
    let city = this.form.value.city.trim();
    console.log(city);
    if (!this.cities.includes(city)) {
      this.cities.push(city);
      localStorage.setItem('cities', JSON.stringify(this.cities));
    }
    console.log(this.cities);
    this.form.reset();
    formDirective.resetForm();
  }

  deleteCity(city: string): void {
    this.cities = this.cities.filter((c) => c != city);
    localStorage.setItem('cities', JSON.stringify(this.cities));
  }
}
