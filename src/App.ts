import {Chart} from 'highcharts-vue';
import {Component, Vue} from 'vue-property-decorator';
import axios, {AxiosResponse, Method} from 'axios';
import debounce from 'lodash/debounce';

@Component({
  components: {
    Chart
  }
})
export default class App extends Vue {
  async created() {
    await this.takeAllImages();
  }

  async mounted() {
    this.tempChart.series.push({
      name: 'Temperature',
      data: [],
      zIndex: 1,
      color: '#ff3333'
    });
    this.windChart.series.push({
      name: 'Wind',
      data: [],
      color: '#eebc06'
    });
    this.feelsLikeChart.series.push({
      name: 'Feels Like',
      data: [],
      color: '#36ef0d'
    });
    this.showOrHideCharts();
    this.resizeChart();
    window.onresize = debounce(() => {
      this.resizeChart();
      this.forceRerender();
      this.showOrHideCharts();
    }, 10);
    // for testing only
    await this.getWeather();
  }

  private blurClass() {
    if (this.hideContent) {
      return 'blur';
    }
    return '';
  }

  private showOrHideCharts() {
    if (window.matchMedia('(min-aspect-ratio: 13/9)').matches) {
      this.showWindChart = true;
      this.showTempChart = true;
      this.showFeelsLikeChart = true;
    } else {
      this.showWindChart = false;
      this.showTempChart = true;
      this.showFeelsLikeChart = false;
    }
  }

  private hideContentTrigger() {
    setTimeout(() => {
      this.hideContent = !this.hideContent;
    }, 100);
  }

  private hideContent: boolean = false;

  private resizeChart() {
    switch (true) {
      // detects landscape mode
      case window.matchMedia('(min-aspect-ratio: 13/9)').matches:
        this.mobileView = false;
        this.windChart.chart.width = (window.innerWidth) * 0.5;
        this.tempChart.chart.width = (window.innerWidth) * 0.5;
        this.feelsLikeChart.chart.width = (window.innerWidth) * 0.5;
        break;
      case window.innerWidth < 500:
        this.mobileView = true;
        this.windChart.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.tempChart.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.feelsLikeChart.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.windChart.chart.height = (window.innerHeight) * 0.5;
        this.tempChart.chart.height = (window.innerHeight) * 0.5;
        this.feelsLikeChart.chart.height = (window.innerHeight) * 0.5;
        break;
      default:
        this.mobileView = true;
        this.windChart.chart.width = window.innerWidth - (0.02 * window.innerWidth);
        this.tempChart.chart.width = window.innerWidth - (0.02 * window.innerWidth);
        this.feelsLikeChart.chart.width = window.innerWidth - (0.02 * window.innerWidth);
    }
  }

  private backgroundImage() {
    const {temp} = this.weather.main;
    let background = '';
    switch (true) {
      default:
        background = '';
        break;
      case temp <= 2:
        background = 'under2';
        break;
      case temp > 2 && temp < 16:
        background = 'over2';
        break;
      case temp >= 16:
        background = 'over16';
        break;
    }
    return background;
  }

  private async takeAllImages() {
    const pictures = require.context(
      './assets/',
      true
    );
    pictures.keys().forEach(key => {
      this.weatherSmallPicture.push(key.substring(2, 6));
    });
  }

  private forceRerender(): void {
    this.componentKey += 1;
  }

  private mobileView: boolean = false;
  private componentKey = 0;
  private showFeelsLikeChart = false;
  private showWindChart = false;
  private showTempChart = true;
  private apiKey = 'cab0c30b1dfc14ce360db2f0b4b5411b';
  private urlBase = 'https://api.openweathermap.org/data/2.5/';
  private query: string = 'sofia';
  private error: string = '';
  private coords: any = {};
  private days = ['Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private weather: any = {};

  private static metricUnitSetter(name: string) {
    let unit;
    switch (true) {
      case name === 'Wind':
        unit = 'm/s';
        break;
      default:
        unit = '°C';
        break;
    }
    return unit;
  }

  private dataChart: any = {
    chart: {
      // type of diagram
      type: 'line',
      marginLeft: 55,
      marginRight: 10,
      height: 0,
      width: 0
    },
    boost: {enabled: true},
    // bottom right credit
    credits: {
      enabled: false
    },
    // bottom legend for different chart
    legend: {
      enabled: false
    },
    title: {
      text: 'Next Week Forecast'
    },
    series: [],
    xAxis: {
      type: 'category',
      categories: App.pastWeekDays(this.days, new Date().getDay()),
      labels: {
        rotation: 0
      }
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)',
        margin: 4
      }
    },
    tooltip: {
      crosshairs: true,
      shared: true,
      formatter() {
        // @ts-ignore
        return this.points.reduce((s, point) => `${s}<br/>${point.series.name}:
        ${(point.y)}${App.metricUnitSetter(point.series.name)}`, `<b>${this.x}</b>`);
        // return `<b>${this.series}</b><br />
        //       value: ${this.y} <br />
        //       time: ${this.x}`;
      }
    }
  };
  private windChart = JSON.parse(JSON.stringify(this.dataChart));
  private tempChart = JSON.parse(JSON.stringify(this.dataChart));
  private feelsLikeChart = JSON.parse(JSON.stringify(this.dataChart));

  private showFeelsLike() {
    this.showWindChart = false;
    this.showTempChart = false;
    this.showFeelsLikeChart = true;
  }

  private showTemp() {
    this.showWindChart = false;
    this.showTempChart = true;
    this.showFeelsLikeChart = false;
  }

  private showWind() {
    this.showWindChart = true;
    this.showTempChart = false;
    this.showFeelsLikeChart = false;
  }

  private static pastWeekDays(array: any[], today: number) {
    const week = array.slice(today - 1, array.length).concat(array.slice(0, today));
    week.push(week[0]);
    return week;
  }

  private weatherSmallPicture: any[] = [];
  private imageNextToDeg = '';

  private request(url: string, method: Method, body?: any): Promise<any> {
    this.error = '';
    const request = axios.request({
      method,
      url,
      timeout: 30000,
      data: body
    });
    return request
      .then((response: AxiosResponse) => response.data)
      .catch((e: Error) => {
        this.error = 'No city was found...';
        throw e;
      });
  }

  private setImageName() {
    this.weatherSmallPicture.forEach((word, index) => {
      if (word.substring(0, 3).toLowerCase() === this.weather.weather[0].main.substring(0, 3).toLowerCase()) {
        const images = require.context('./assets/', true);
        const image = App.requireAll(images);
        this.imageNextToDeg = image[index].substring(2, image[index].length);
      }
    });
  }

  private static requireAll(requireContext: any) {
    return requireContext.keys();
  }

  private getImgPath(pic: any) {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require(`./assets/${pic}`);
  }

  private clearChartData(charts: any) {
    charts.forEach((chart: { series: any[]; }) => {
      chart.series.forEach((obj: any) => {
        // eslint-disable-next-line no-param-reassign
        obj.data = [];
      });
    });
  }

  private async getWeather() {
    this.clearChartData([this.tempChart, this.windChart, this.feelsLikeChart]);
    const results = await this.request(`${this.urlBase}weather?q=${this.query}&units=metric&APPID=${this.apiKey}`, 'GET');
    this.weather = results;
    this.coords = results.coord;
    (this.$refs.input as HTMLInputElement).blur();
    await this.setImageName();
    await this.getWeatherForNextDays();
  }

  private async getWeatherForNextDays() {
    const results = await this.request(`${this.urlBase}forecast?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&cnt=8&APPID=${this.apiKey}`, 'GET');
    results.list.forEach((day: any) => {
      this.tempChart.series[0].data.push(Math.round(day.main.temp));
      this.windChart.series[0].data.push(day.wind.speed);
      this.feelsLikeChart.series[0].data.push(Math.round(day.main.feels_like));
    });
  }

  private dateBuilder() {
    const d = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${date} ${month} ${year}`;
  }
}
