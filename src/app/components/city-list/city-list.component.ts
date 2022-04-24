import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { debounceTime, EMPTY, Observable, Subscription } from 'rxjs';
import { GeocodeCity } from 'src/app/common/model';
import { GeocoderService } from 'src/app/common/services/geocoder.service';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.scss'],
})
export class CityListComponent implements OnInit {
  cities: string[] = [
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
    private geocoderService: GeocoderService
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

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        let results = this.geocoderService.getCurrentLocationCities(lat, lon);
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
    let tokens = city.split(',').map((c: string) => c.trim());
    if (tokens.length > 1) {
      if (tokens[tokens.length - 1].length == 2) {
        let countryCode = tokens.pop() || '';
        let state =
          tokens.length == 2
            ? ' <small><em>' + tokens.pop() + '</em></small>'
            : '';
        return (
          tokens[0] +
          state +
          ' <strong>' +
          countryCode +
          '</strong> <span class="flag">' +
          this.geocoderService.getFlagEmoji(countryCode) +
          ' </span>'
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
