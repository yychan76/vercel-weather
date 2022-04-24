export interface Weather {
  cityName: string;
  stateName: string;
  lat: number;
  lon: number;
  timezone_offset: number;
  country: string;
  main: string;
  description: string;
  icon: string;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  dew_point: number;
  wind_speed: number;
  wind_dir: number;
  wind_gust: number;
  uvi: number;
  rain: number;
  snow: number;
  sunrise: number;
  sunset: number;
  next_sunrises: number[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  minutely: MinutelyForecast[];
  alerts: Alert[];
  gif_title: string;
  gif_url: string;
  cached: boolean;
  timestamp: number;
  query_timestamp: number;
}

export interface Alert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  pop: number;
  rain: HourPrecipitation;
  snow: HourPrecipitation;
  weather: HourlyWeather[];
}

export interface HourlyWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface DailyForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  temp: DailyTemperature;
  feels_like: DailyFeelsLike;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: DailyWeather[];
  clouds: number;
  pop: number;
  rain: number;
  snow: number;
  uvi: number;
}

export interface MinutelyForecast {
  dt: number;
  precipitation: number;
}

export interface HourPrecipitation {
  '1h': number;
}
export interface DailyTemperature {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface DailyFeelsLike {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export interface DailyWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface GeocodeCity {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Giphy {
  title: string;
  imageUrl: string;
}
