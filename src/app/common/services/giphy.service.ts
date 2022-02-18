import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Giphy } from '../model';

@Injectable({
  providedIn: 'root',
})
export class GiphyService {
  constructor(private http: HttpClient) {}

  search(q: string) {
    const params = new HttpParams().set('q', q);
    return this.http.get<Giphy[]>('/api/search-giphy', { params });
  }
}
