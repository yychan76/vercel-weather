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
import { DarkModeToggleComponent } from './components/dark-mode-toggle/dark-mode-toggle.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoggerService } from './common/services/logger.service';
import { RemainingSunTimeComponent } from './components/remaining-sun-time/remaining-sun-time.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

const appRoutes: Routes = [
  { path: '', component: CityListComponent },
  { path: 'weather/:city', component: WeatherDetailComponent },
  { path: 'weatherlocation/:city', component: WeatherDetailComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

const extraOptions: ExtraOptions = {
  useHash: true,
};

@NgModule({
  declarations: [
    AppComponent,
    WeatherDetailComponent,
    CityListComponent,
    DarkModeToggleComponent,
    RemainingSunTimeComponent,
  ],
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
    FontAwesomeModule,
    LeafletModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [LoggerService],
  bootstrap: [AppComponent],
})
export class AppModule {}
