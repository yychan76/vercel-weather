import { Component, Input, OnInit } from '@angular/core';
import * as _moment from 'moment';
const moment = _moment;

@Component({
  selector: 'app-remaining-sun-time',
  templateUrl: './remaining-sun-time.component.html',
  styleUrls: ['./remaining-sun-time.component.scss'],
})
export class RemainingSunTimeComponent implements OnInit {
  @Input() sunrise!: number;
  @Input() sunset!: number;
  @Input() next_sunrises!: number[];

  value!: number;
  nextEvent!: string;
  timeToNextEvent!: string;
  prevEventIcon!: string;
  nextEventIcon!: string;
  class!: string;

  constructor() {}

  ngOnInit(): void {
    this.initLabels();
  }

  isDay(): boolean {
    return moment().isBetween(
      moment(this.sunrise * 1000),
      moment(this.sunset * 1000)
    );
  }

  initLabels(): void {
    // when the current time is before the sunrise time, use the current sunrise
    // time for next sunrise, otherwise need to get the next value from daily values
    let next_sunrise = moment().isBefore(moment(this.sunrise * 1000))
      ? this.sunrise
      : this.next_sunrises[1];
    // assume prev sunset does not change much from current sunset, otherwise
    // need to do another fetch to get historic data
    let prev_sunset = moment(this.sunset * 1000).subtract(1, 'days');
    // console.log('prev_sunset', prev_sunset);
    // console.log('next_sunrise', next_sunrise);
    this.nextEvent = this.isDay() ? 'Sunset' : 'Sunrise';
    this.timeToNextEvent = this.isDay()
      ? moment
          .duration(moment(this.sunset * 1000).diff(moment()))
          .humanize(true, { h: 24 })
      : moment
          .duration(moment(next_sunrise * 1000).diff(moment()))
          .humanize(true, { h: 24 });
    this.prevEventIcon = this.isDay() ? 'light_mode' : 'bedtime';
    this.nextEventIcon = this.isDay() ? 'bedtime' : 'light_mode';
    this.class = this.isDay() ? 'remaining-sun day' : 'remaining-sun night';
    this.value = this.isDay()
      ? (moment(this.sunset * 1000).diff(moment()) * 100) /
        moment(this.sunset * 1000).diff(moment(this.sunrise * 1000))
      : (moment(next_sunrise * 1000).diff(moment()) * 100) /
        moment(next_sunrise * 1000).diff(prev_sunset);
  }
}
