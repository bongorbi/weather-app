export enum CHARTBUTTONS {
  WIND = 'Wind',
  TEMPERATURE = 'Temperature',
  FEELSLIKE = 'FeelsLike'
}

export type Buttons = {
  title: string,
  chartName: string,
  selected: boolean
}

export enum GEOLOCATION_STATUS {
  DENIEDGEOLOCATION = 'User denied Geolocation'
}

export enum SCROLL_BUTTON_POSITION {
  UP = 'scrollUp',
  DOWN = 'scrollDown'
}
