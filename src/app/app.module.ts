import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { WeatherDetailComponent } from './components/weather-detail/weather-detail.component';
import { CityListComponent } from './components/city-list/city-list.component';

const appRoutes: Routes = [
  { path: '', component: CityListComponent },
  { path: 'weather/:city', component: WeatherDetailComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

const extraOptions: ExtraOptions = {
 useHash: true
}

@NgModule({
  declarations: [AppComponent, WeatherDetailComponent, CityListComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forRoot(appRoutes, extraOptions),
    FlexLayoutModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
