export interface Weather {
  cityName: string;
  lat: number;
  lon: number;
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
  sunrise: number;
  sunset: number;
  next_sunrises: number[];
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

export interface Giphy {
	title: string
	imageUrl: string
}
