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
