import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.scss'],
})
export class CityListComponent implements OnInit {
  cities: string[] = [
    'singapore',
    'seoul',
    'kuala lumpur',
    'hong kong',
    'london',
    'washington',
  ];
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
    this.loadCities();
  }

  createForm() {
    this.form = this.fb.group({
      city: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    });
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

  addCity() {
    let city = this.form.value.city.trim().toLowerCase();
    console.log(city);
    if (!this.cities.includes(city)) {
      this.cities.push(city);
      localStorage.setItem('cities', JSON.stringify(this.cities));
    }
    console.log(this.cities);
    this.form.reset();
  }

  deleteCity(city: string): void {
    this.cities = this.cities.filter((c) => c != city);
    localStorage.setItem('cities', JSON.stringify(this.cities));
  }
}
