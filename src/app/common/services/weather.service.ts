import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { Weather } from '../model';

const URL_API_BASE = '/api/weather/v2/';
const GLANCE_URL_API_BASE = '/api/weatherglance/';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  weatherCache: { [key: string]: any };
  constructor(private http: HttpClient) {
    this.weatherCache = {};
  }

  getWeather(city: string): Observable<Weather[]> {
    console.info('getWeather: ', city);
    return this.http.get<any>(this.getUrl(city));
  }

  getUrl(city: string) {
    return `${URL_API_BASE}${city}`;
  }

  getGlanceUrl(city: string) {
    return `${GLANCE_URL_API_BASE}${city}`;
  }

  getWeatherGlance(city: string): Observable<Weather[]> {
    let url = this.getGlanceUrl(city);
    // console.info(`getWeatherGlance: ${city} ${url}`);
    return this.http.get<any>(url);
  }

  async getCachedWeatherGlance(city: string): Promise<Weather> {
    if (!this.weatherCache[city]) {
      // cache the Promise
      this.weatherCache[city] = firstValueFrom(this.getWeatherGlance(city));
    }

    try {
      const weather = await this.weatherCache[city];
      return weather[0];
    } catch (err) {
      delete this.weatherCache[city];
      console.error(err);
      return {} as Weather;
    }
  }
}
