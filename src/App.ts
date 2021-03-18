import {Chart} from 'highcharts-vue';
import {Component, Vue} from 'vue-property-decorator';
import axios, {AxiosResponse, Method} from 'axios';
import debounce from 'lodash/debounce';
// @ts-ignore
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

@Component({
  components: {
    Chart,
    FontAwesomeIcon
  }
})
export default class App extends Vue {
  async created() {
    await this.takeAllImages();
  }

  async mounted() {
    this.showOrHideCharts();
    this.resizeChart();
    window.onresize = debounce(() => {
      this.resizeChart();
      this.forceRerender();
      this.showOrHideCharts();
    }, 10);
    await this.getLocation();
  }

  private downButtonIcon: string = 'chevron-down';
  private scrollUpOrDown: string = 'scrollDown';

  private changeScrollBtnIcon(e: { target: HTMLInputElement }) {
    const screenHeight = e.target.offsetHeight;
    const scrollFromTop = e.target.scrollTop;
    if ((screenHeight - 120) > scrollFromTop) {
      this.downButtonIcon = 'chevron-down';
      this.scrollUpOrDown = 'scrollDown';
    } else {
      this.downButtonIcon = 'chevron-up';
      this.scrollUpOrDown = 'scrollUp';
    }
  }

  private scrollButton() {
    const mainEl = document.querySelector('main');
    switch (this.scrollUpOrDown) {
      default:
        mainEl!.scrollBy(0, 1000);
        break;
      case 'scrollUp':
        mainEl!.scrollBy(0, -1000);
        break;
    }
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

  private hideAndBlurContent() {
    this.blurBackground = !this.blurBackground;
    this.hideContent = !this.hideContent;
  }

  private async getLocation() {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const success = async (pos: { coords: any; }) => {
      this.query = '';
      const crd = pos.coords;
      this.coords.lon = crd.longitude;
      this.coords.lat = crd.latitude;
      App.clearChartData([this.tempChart, this.windChart, this.feelsLikeChart]);
      await this.getWeatherByCoords();
    };

    function error(err: any) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
  }

  private hideContent: boolean = false;

  private resizeChart() {
    switch (true) {
      // detects landscape mode
      case window.matchMedia('(min-aspect-ratio: 13/9)').matches:
        this.mobileView = false;
        this.windChart.chart.width = (window.innerWidth) * 0.39;
        this.tempChart.chart.width = (window.innerWidth) * 0.39;
        this.feelsLikeChart.chart.width = (window.innerWidth) * 0.39;
        this.hourlyForecast.chart.width = (window.innerWidth) * 0.39;
        break;
      case window.innerWidth < 500:
        this.mobileView = true;
        this.windChart.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.tempChart.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.hourlyForecast.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.feelsLikeChart.chart.width = window.innerWidth - (0.04 * window.innerWidth);
        this.windChart.chart.height = (window.innerHeight) * 0.3;
        this.tempChart.chart.height = (window.innerHeight) * 0.3;
        this.hourlyForecast.chart.height = (window.innerHeight) * 0.5;
        this.feelsLikeChart.chart.height = (window.innerHeight) * 0.3;
        break;
      default:
        this.mobileView = true;
        this.windChart.chart.width = window.innerWidth - (0.02 * window.innerWidth);
        this.tempChart.chart.width = window.innerWidth - (0.02 * window.innerWidth);
        this.hourlyForecast.chart.width = window.innerWidth - (0.02 * window.innerWidth);
        this.feelsLikeChart.chart.width = window.innerWidth - (0.02 * window.innerWidth);
    }
  }

  private tempClass() {
    const {temp} = this.weather.main;
    let cssClass = '';
    switch (true) {
      default:
        cssClass = '';
        break;
      case temp <= 2:
        cssClass = 'bellow2';
        break;
      case temp > 2 && temp < 16:
        cssClass = 'over2';
        break;
      case temp >= 16:
        cssClass = 'over16';
        break;
    }
    return cssClass;
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
    if (this.blurBackground) {
      background = `${background} blurBackground`;
    }
    return background;
  }

  private async takeAllImages() {
    const pictures = require.context(
      '../public/assets/',
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
  private blurBackground: boolean = false;
  private componentKey = 0;
  private showFeelsLikeChart = false;
  private showWindChart = false;
  private showTempChart = true;
  private apiKey = 'cab0c30b1dfc14ce360db2f0b4b5411b';
  private urlBase = 'https://api.openweathermap.org/data/2.5/';
  private query: string = '';
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

  private hourlyForecast: any = {
    chart: {
      // type of diagram
      type: 'area',
      marginLeft: 25,
      marginRight: 10,
      height: 0,
      width: 0,
      zoomType: 'x',
      panning: true,
      panKey: 'shift'
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        dataLabels: {
          color: 'black',
          format: '{y} °C',
          enabled: true
        }
      }
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
      text: ''
    },
    series: [{
      name: 'Hourly Forecast',
      data: [],
      color: '#74C69D',
      dataLabels: {
        style: {
          fontSize: '1rem',
          fontFamily: 'Trebuchet MS'
        }
      }
    }],
    xAxis: {
      type: 'categories',
      categories: this.chartHours()
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      followPointer: true,
      crosshairs: true,
      shared: true,
      // @ts-ignore
      formatter() {
        // @ts-ignore
        return this.points.reduce((s, point) => `${s}<br/>${point.series.name}:${(point.y)}${App.metricUnitSetter(point.series.name)}`, `<b>${this.x}</b>`);
      }
    }
  };

  private chartHours() {
    const date = new Date();
    let currentHour = date.getHours();
    const hours = [];
    let n = 0;
    while (n < 48) {
      switch (currentHour) {
        case 24:
          currentHour = 0;
          break;
        default:
          currentHour += 1;
          break;
      }
      hours.push(currentHour);
      n += 1;
    }
    return hours.map(x => `${x}:00`);
  }

  private windChart: any = {
    chart: {
      // type of diagram
      type: 'area',
      marginLeft: 25,
      marginRight: 10,
      marginBottom: 25,
      height: 0,
      width: 0
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        dataLabels: {
          color: 'black',
          format: '{y} m/s',
          enabled: true
        }
      },
      series: {
        pointPadding: -0.2
      }
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
      text: ''
    },
    series: [{
      name: 'Wind',
      data: [],
      color: '#74C69D',
      dataLabels: {
        style: {
          fontSize: '1rem',
          fontFamily: 'Trebuchet MS'
        }
      }
    }],
    xAxis: {
      type: 'category',
      categories: App.pastWeekDays(this.days, new Date().getDay()),
      labels: {
        rotation: 0
      }
    },
    yAxis: {
      title: {
        text: 'Metre per second (m/s)'
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      followPointer: true,
      crosshairs: true,
      shared: true,
      // @ts-ignore
      formatter() {
        console.log(this);
        // @ts-ignore
        return this.points.reduce((s, point) => `${s}<br/>${point.series.name}:${(point.y)}${App.metricUnitSetter(point.series.name)}`, `<b>${this.x}</b>`);
      }
    }
  };
  private tempChart: any = {
    chart: {
      // type of diagram
      type: 'column',
      marginLeft: 25,
      marginRight: 10,
      marginBottom: 25,
      height: 0,
      width: 0
    },
    plotOptions: {
      column: {
        dataLabels: {
          color: 'black',
          format: '{y}°C',
          enabled: true
        }
      },
      series: {
        pointPadding: -0.2
      }
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
      text: ''
    },
    series: [{
      name: 'Temperature',
      data: [],
      color: '#1E5531',
      stacking: 'normal',
      minPointWidth: 50,
      dataLabels: {
        style: {
          fontSize: '1rem',
          fontFamily: 'Trebuchet MS'
        }
      }
    }],
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
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      followPointer: true,
      crosshairs: true,
      shared: true,
      // @ts-ignore
      formatter() {
        // @ts-ignore
        return this.points.reduce((s, point) => `${s}<br/>${point.series.name}:${(point.y)}${App.metricUnitSetter(point.series.name)}`, `<b>${this.x}</b>`);
      }
    }
  };
  private feelsLikeChart: any = {
    chart: {
      // type of diagram
      type: 'column',
      marginLeft: 25,
      marginRight: 10,
      marginBottom: 25,
      height: 0,
      width: 0
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          color: 'black',
          format: '{y}°C',
          enabled: true
        }
      },
      series: {
        pointPadding: -0.2
      }
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
      text: ''
    },
    series: [{
      name: 'Feels Like',
      data: [],
      color: '#1E5531',
      dataLabels: {
        style: {
          fontSize: '1rem',
          fontFamily: 'Trebuchet MS'
        }
      }
    }],
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
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      followPointer: true,
      crosshairs: true,
      shared: true,
      // @ts-ignore
      formatter() {
        // @ts-ignore
        return this.points.reduce((s, point) => `${s}<br/>${point.series.name}:${(point.y)}${App.metricUnitSetter(point.series.name)}`, `<b>${this.x}</b>`);
      }
    }
  };

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
        this.hideContent = true;
        (this.$refs.input as HTMLInputElement).blur();
        throw e;
      });
  }

  private setImageName() {
    this.weatherSmallPicture.forEach((word, index) => {
      if (word.substring(0, 3).toLowerCase() === this.weather.weather[0].main.substring(0, 3).toLowerCase()) {
        const images = require.context('../public/assets/', true);
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
    return require(`../public/assets/${pic}`);
  }

  private static clearChartData(charts: any) {
    charts.forEach((chart: { series: any[]; }) => {
      chart.series.forEach((obj: any) => {
        // eslint-disable-next-line no-param-reassign
        obj.data = [];
      });
    });
  }

  private async getWeather() {
    App.clearChartData([this.tempChart, this.windChart, this.feelsLikeChart, this.hourlyForecast]);
    const results = await this.request(`${this.urlBase}weather?q=${this.query}&units=metric&APPID=${this.apiKey}`, 'GET');
    this.weather = results;
    this.coords = results.coord;
    (this.$refs.input as HTMLInputElement).blur();
    await this.setImageName();
    await this.getWeatherForNextDays();
  }

  private async getWeatherByCoords() {
    App.clearChartData([this.tempChart, this.windChart, this.feelsLikeChart, this.hourlyForecast]);
    const results = await this.request(`${this.urlBase}weather?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&APPID=${this.apiKey}`, 'GET');
    this.weather = results;
    this.coords = results.coord;
    (this.$refs.input as HTMLInputElement).blur();
    await this.setImageName();
    await this.getWeatherForNextDays();
  }

  private async getWeatherForNextDays() {
    function colorPicker(temp: number) {
      if (temp > 0) {
        return '#74C69D';
      }
      return '#E63946';
    }

    const results = await this.request(`${this.urlBase}onecall?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&cnt=8&APPID=${this.apiKey}`, 'GET');
    results.hourly.forEach((hour: any) => {
      this.hourlyForecast.series[0].data.push({
        y: Math.round(hour.temp),
        color: colorPicker(Math.round(hour.temp)),
      });
    });
    results.daily.forEach((day: any) => {
      this.tempChart.series[0].data.push({
        y: Math.round(day.temp.day),
        color: colorPicker(Math.round(day.temp.day))
      });
      this.windChart.series[0].data.push(Math.round(day.wind_speed));
      this.feelsLikeChart.series[0].data.push({
        y: Math.round(day.feels_like.day),
        color: colorPicker(Math.round(day.feels_like.day))
      });
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
