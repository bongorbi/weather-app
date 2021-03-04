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
    this.resizeChart();
    window.onresize = debounce(() => {
      this.resizeChart();
      this.forceRerender();
    }, 10);
    // for testing only
    await this.getWeather();
  }

  private resizeChart() {
    switch (true) {
      // detects landscape mode
      case window.matchMedia('(min-aspect-ratio: 13/9)').matches:
        this.nextWeekChartData.chart.width = (window.innerWidth) * 0.5;
        this.nextWeekChartData.chart.height = (window.innerHeight) * 0.4;
        this.pastWeekChartData.chart.width = (window.innerWidth) * 0.5;
        this.pastWeekChartData.chart.height = (window.innerHeight) * 0.4;
        break;
      case window.innerWidth < 500:
        this.nextWeekChartData.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.nextWeekChartData.chart.height = (window.innerHeight) * 0.5;
        this.pastWeekChartData.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.pastWeekChartData.chart.height = (window.innerHeight) * 0.5;
        break;
      default:
        this.nextWeekChartData.chart.width = window.innerWidth - (0.02 * window.innerWidth);
        this.nextWeekChartData.chart.height = (window.innerHeight) * 0.51;
        this.pastWeekChartData.chart.width = window.innerWidth - (0.02 * window.innerWidth);
        this.pastWeekChartData.chart.height = (window.innerHeight) * 0.51;
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

  private componentKey = 0;
  private showPastWeek = false;
  private showNextWeek = true;
  private apiKey = 'cab0c30b1dfc14ce360db2f0b4b5411b';
  private urlBase = 'https://api.openweathermap.org/data/2.5/';
  private query: string = 'sofia';
  private error: string = '';
  private coords: any = {};
  private days = ['Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private weather: any = {};
  private pastWeekChartData: any = {
    // type of diagram
    chart: {
      type: 'column',
      width: 0,
      height: 0
    },
    // bottom right credit
    credits: {
      enabled: false
    },
    // bottom legend for different chart
    legend: {
      enabled: false
    },
    title: {
      text: 'Past Week Forecast'
    },
    series: [
      {
        name: 'Past Week',
        data: []
      }
    ],
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
      split: true,
      valueSuffix: '°C'
    }
  };
  private nextWeekChartData: any = {
    chart: {
      // type of diagram
      type: 'column',
      width: 0,
      height: 0
    },
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
    series: [
      {
        name: 'Next Week',
        data: []
      }
    ],
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
      split: true,
      valueSuffix: '°C'
    }
  };

  private showPastWeekChart() {
    this.showNextWeek = false;
    this.showPastWeek = true;
  }

  private showNextWeekChart() {
    this.showPastWeek = false;
    this.showNextWeek = true;
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

  private async getWeather() {
    this.nextWeekChartData.series[0].data = [];
    this.pastWeekChartData.series[0].data = [];
    const results = await this.request(`${this.urlBase}weather?q=${this.query}&units=metric&APPID=${this.apiKey}`, 'GET');
    this.weather = results;
    this.coords = results.coord;
    (this.$refs.input as HTMLInputElement).blur();
    await this.setImageName();
    await this.getWeatherForPastDays();
    await this.getWeatherForNextDays();
  }

  private async getWeatherForPastDays() {
    const results = await this.request(`${this.urlBase}onecall?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&APPID=${this.apiKey}`, 'GET');
    results.daily.forEach((day: any) => {
      // const averageForDay: number = Math.trunc((day.temp.morn + day.temp.night) / 2);
      this.pastWeekChartData.series[0].data.push(Math.trunc(day.temp.day));
    });
    this.pastWeekChartData.series[0].data.reverse();
  }

  private async getWeatherForNextDays() {
    const results = await this.request(`${this.urlBase}forecast?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&cnt=8&APPID=${this.apiKey}`, 'GET');
    results.list.forEach((day: any) => {
      this.nextWeekChartData.series[0].data.push(Math.trunc(day.main.temp));
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
