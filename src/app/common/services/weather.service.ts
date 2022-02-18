import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Weather } from '../model';

const URL_API_BASE = '/api/weather/';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<Weather[]> {
    return this.http.get<any>(this.getUrl(city));
  }

  getUrl(city: string) {
    return `${URL_API_BASE}${city}`;
  }
}
