import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeocodeCity } from '../model';

const URL_DIRECT_API_BASE = '/api/geo/direct/';

const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'region' });
const regionNamesInTraditionalChinese = new Intl.DisplayNames(['zh-Hant'], {
  type: 'region',
});

@Injectable({
  providedIn: 'root',
})
export class GeocoderService {
  constructor(private http: HttpClient) {}

  getCities(city: string): Observable<GeocodeCity[]> {
    return this.http.get<GeocodeCity[]>(this.getDirectUrl(city));
  }

  getDirectUrl(city: string) {
    return `${URL_DIRECT_API_BASE}${city}`;
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
}
