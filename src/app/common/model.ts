export interface Weather {
  cityName: string;
  country: string;
  main: string;
  description: string;
  icon: string;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  gif_title: string;
  gif_url: string;
  cached: boolean;
  timestamp: number;
  query_timestamp: number;
}

export interface Giphy {
	title: string
	imageUrl: string
}
