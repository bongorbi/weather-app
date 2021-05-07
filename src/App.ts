import {Chart} from 'highcharts-vue';
import {Component, Vue, Watch} from 'vue-property-decorator';
import axios, {AxiosResponse, Method} from 'axios';
import debounce from 'lodash/debounce';
// @ts-ignore
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import ChartComponent from '@/components/Chart.vue';
import {isMobile} from 'mobile-device-detect';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import ScrollDownButton from '@/components/ScrollDownButton.vue';
import ChartButtons from '@/components/ChartButtons.vue';
import {Buttons, GEOLOCATION_STATUS} from '@/commonconstants';
import {Geolocation} from '@capacitor/core';

@Component({
  components: {
    Chart,
    ChartComponent,
    FontAwesomeIcon,
    LoadingOverlay,
    ScrollDownButton,
    ChartButtons
  }
})
export default class App extends Vue {
  private async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.coords.lon = coordinates.coords.longitude;
      this.coords.lat = coordinates.coords.latitude;
      await this.getWeatherByCoords();
    } catch (e) {
      if (e.message === GEOLOCATION_STATUS.DENIEDGEOLOCATION) {
        this.error = e.message;
      }
    }
  }

  private errImage = '';
  private errorDisplayMsg: string = '';

  @Watch('error')
  private errorTextWatcher() {
    switch (this.error) {
      case GEOLOCATION_STATUS.DENIEDGEOLOCATION:
        this.errImage = `${require('../public/assets/tunrOnGPS.png')}`;
        this.errorDisplayMsg = 'Turn on your location and press the refresh button ->';
        break;
      default:
        this.errImage = `${require('../public/assets/nothingFound.png')}`;
        this.errorDisplayMsg = 'No city results';
        break;
    }
  }

  async created() {
    await this.takeAllImages();
  }

  private windowHeight = 0;

  private keyboardShowHideHandler() {
    App.resizeBackgroundImg(this.windowHeight);
  }

  async mounted() {
    // взима височината на екрана в началото, за да я използваме по-натам,
    // да предотвратим свиване на фона на мобилни устройства, след като кликнем на инпуита
    this.windowHeight = window.innerHeight;
    this.resizeChart();
    window.addEventListener('native.showkeyboard', this.keyboardShowHideHandler);
    window.addEventListener('native.hidekeyboard', this.keyboardShowHideHandler);
    if (!isMobile) {
      window.onresize = debounce(() => {
        this.resizeChart();
      }, 10);
    }
    await this.getCurrentPosition();
  }

  private goFullscreen() {
    if (isMobile) {
      const doc = window.document;
      const docEl = doc.documentElement;
      // @ts-ignore
      const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
      // @ts-ignore
      const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
      // @ts-ignore
      if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
      } else {
        cancelFullScreen.call(doc);
      }
      // чака да стане fullscreen и променя innerHeight да е равна на уголемения прозорец,
      // за да зададе нов размер на бекграунд картинката
      setTimeout(() => {
        App.resizeBackgroundImg(window.innerHeight);
      }, 200);
      this.resizeChart();
    }
  }

  private loading: boolean = false;
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

  private isMobile = isMobile;

  private static resizeBackgroundImg(pixels: number) {
    if (isMobile) {
      document.getElementById('backgroundImg')!.style.setProperty('height', `${pixels}px`);
    }
  }

  private hideAndBlurContent() {
    App.resizeBackgroundImg(this.windowHeight);
    this.blurBackground = !this.blurBackground;
    this.hideContent = !this.hideContent;
  }

  private hideContent: boolean = false;
  private nextWeeksCharts: boolean = false;

  private resizeChart() {
    let chartWidth;
    let chartHeight = (window.innerHeight) * 0.4;
    switch (true) {
      // detects landscape mode
      case window.matchMedia('(min-aspect-ratio: 13/9)').matches:
        chartWidth = window.innerWidth * 0.715;
        chartHeight = window.innerHeight * 0.4;
        this.windChart.chart.width = chartWidth;
        this.tempChart.chart.width = chartWidth;
        this.feelsLikeChart.chart.width = chartWidth;
        this.hourlyForecast.chart.width = chartWidth;
        this.hourlyForecast.chart.height = chartHeight;
        break;
      default:
        chartWidth = window.innerWidth - 2;
        this.windChart.chart.width = chartWidth;
        this.tempChart.chart.width = chartWidth;
        this.hourlyForecast.chart.width = chartWidth;
        this.hourlyForecast.chart.height = chartHeight;
        this.feelsLikeChart.chart.width = chartWidth;
        this.feelsLikeChart.chart.height = chartHeight;
        this.tempChart.chart.height = chartHeight;
        this.windChart.chart.height = chartHeight;
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

  private backgroundImgSrc = '';

  private backgroundImage() {
    const {temp} = this.weather.main;
    if (temp <= 2) {
      this.backgroundImgSrc = `url(${require('../public/assets/coldBackground.jpg')})`;
    } else if (temp > 2 && temp < 16) {
      this.backgroundImgSrc = `url(${require('../public/assets/over2background.jpg')})`;
    } else if (temp >= 16) {
      this.backgroundImgSrc = `url(${require('../public/assets/over16background.jpg')})`;
    }
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

  private blurBackground: boolean = false;
  private apiKey = 'cab0c30b1dfc14ce360db2f0b4b5411b';
  private urlBase = 'https://api.openweathermap.org/data/2.5/';
  private query: string = '';
  private error: string = '';
  private coords: any = {};
  private days = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
  private weather: any = {};

  private reloadPage() {
    window.location.reload();
  }

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

  /*eslint-disable */

  // animation for chart when loads
  private static easeOutBounce(pos: number) {
    if ((pos) < (1 / 2.75)) {
      return (7.5625 * pos * pos);
    }
    if (pos < (2 / 2.75)) {
      return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
    }
    if (pos < (2.5 / 2.75)) {
      return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
    }
    return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
  };

  /* eslint-enable */

  private hourlyForecast: any = {
    chart: {
      // type of diagram
      type: 'spline',
      marginLeft: 2,
      marginRight: 2,
      marginTop: 2,
      height: 0,
      width: 0,
      panning: true
    },
    plotOptions: {
      spline: {
        dataLabels: {
          style: {
            textOutline: 0,
            fontSize: '0.9rem',
            fontFamily: 'Trebuchet MS'
          },
          format: '{y}°C </br> {x}h',
          borderWidth: 2,
          padding: 5,
          shadow: true,
          allowOverlap: true,
          enabled: true,
          borderRadius: 1,
          y: -15,
          shape: 'callout'
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
      zones: [{
        value: 0,
        color: '#486eb1'
      }, {
        value: 5,
        color: '#fea82f'
      }, {
        color: '#ea515f'
      }],
      color: null
    }],
    xAxis: {
      type: 'categories',
      categories: App.chartHours(),
      min: 0,
      // eslint-disable-next-line no-restricted-globals
      max: (innerWidth > 600) ? 10 : 5,
      scrollbar: {
        enabled: true,
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBorderWidth: 0,
        buttonBorderRadius: 7,
        trackBorderWidth: 1,
        trackBorderRadius: 7
      },
      tickLength: 0,
      rangeSelector: {
        selected: 1
      }
    },
    yAxis: {
      title: {
        text: null
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
        return this.points.reduce((s, point) => `Hour: ${s}<br/>Celsius:${(point.y)}${App.metricUnitSetter(point.series.name)}`, `<b>${this.x}</b>`);
      }
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chart: {
          panning: true
        }
      }]
    }
  };

  private static chartHours() {
    const date = new Date();
    let currentHour = date.getHours();
    const hours = [];
    let n = 0;
    while (n < 48) {
      switch (currentHour) {
        case 23:
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
      type: 'spline',
      marginLeft: 2,
      marginRight: 2,
      marginTop: 2,
      marginBottom: 23,
      height: 0,
      width: 0
    },
    plotOptions: {
      spline: {
        stacking: 'normal',
        dataLabels: {
          color: 'black',
          format: '{y} m/s',
          enabled: true,
          fontSize: '3rem',
          style: {
            textOutline: 0,
            fontSize: '1rem',
            fontFamily: 'Trebuchet MS'
          },
          allowOverlap: true
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
      data: []
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
        // @ts-ignore
        return this.points.reduce((s, point) => `${s}<br/>${point.series.name}:${(point.y)}${App.metricUnitSetter(point.series.name)}`, `<b>${this.x}</b>`);
      }
    }
  };
  private tempChart: any = {
    chart: {
      // type of diagram
      type: 'column',
      marginLeft: 2,
      marginRight: 2,
      marginTop: 2,
      marginBottom: 23,
      height: 0,
      width: 0
    },
    plotOptions: {
      column: {
        dataLabels: {
          style: {
            textOutline: 0
          },
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
      animation: {
        duration: 2000,
        easing: App.easeOutBounce
      },
      color: null,
      stacking: 'normal',
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
  private feelsLikeChart: any = {
    chart: {
      // type of diagram
      type: 'column',
      marginLeft: 2,
      marginRight: 2,
      marginTop: 2,
      marginBottom: 23,
      height: 0,
      width: 0
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          style: {
            textOutline: 0,
            fontSize: '1rem',
            fontFamily: 'Trebuchet MS'
          },
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
      animation: {
        duration: 2000,
        easing: App.easeOutBounce
      },
      color: null
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

  private chartButtons: Buttons[] = [
    {
      title: 'Temperature',
      chartName: this.tempChart,
      selected: true
    }, {
      title: 'Feels Like',
      chartName: this.feelsLikeChart,
      selected: false
    }, {
      title: 'Wind',
      chartName: this.windChart,
      selected: false
    }
  ];

  private onChartButtonClick(buttonType: Buttons) {
    this.chartButtons.forEach(button => {
      if (button.selected) {
        // eslint-disable-next-line no-param-reassign
        button.selected = false;
      }
    });
    const button = this.chartButtons.find(obj => obj.title === buttonType.title);
    button!.selected = true;
  }

  private static pastWeekDays(array: any[], today: number) {
    const week = array.slice(today - 1, array.length).concat(array.slice(0, today));
    week.push(week[0]);
    return week;
  }

  private weatherSmallPicture: any[] = [];
  private imageNextToDeg = '';

  private request(url: string, method: Method, body?: any): Promise<any> {
    this.loading = true;
    this.error = '';
    const request = axios.request({
      method,
      url,
      timeout: 30000,
      data: body
    });
    return request
      .then((response: AxiosResponse) => {
        this.loading = false;
        return response.data;
      })
      .catch((e: Error) => {
        this.error = 'No city results...';
        this.hideContent = true;
        (this.$refs.input as HTMLInputElement).blur();
        this.loading = false;
        throw e;
      });
  }

  private setImageName() {
    this.weatherSmallPicture.forEach((word, index) => {
      if (word.substring(0, 3).toLowerCase() === this.weather.weather[0].main.substring(0, 3).toLowerCase()) {
        const images = require.context('../public/assets/', true);
        const image = images.keys();
        this.imageNextToDeg = image[index].substring(2, image[index].length);
      }
    });
  }

  private getImgPath(pic: string) {
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
    await this.backgroundImage();
  }

  private async getWeatherByCoords() {
    App.clearChartData([this.tempChart, this.windChart, this.feelsLikeChart, this.hourlyForecast]);
    const results = await this.request(`${this.urlBase}weather?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&APPID=${this.apiKey}`, 'GET');
    this.weather = results;
    this.coords = results.coord;
    (this.$refs.input as HTMLInputElement).blur();
    await this.setImageName();
    await this.getWeatherForNextDays();
    await this.backgroundImage();
  }

  private async getWeatherForNextDays() {
    function colorPicker(temp: number) {
      if (temp > 0) {
        return '#ea515f';
      }
      return '#486eb1';
    }

    const results = await this.request(`${this.urlBase}onecall?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&cnt=8&APPID=${this.apiKey}`, 'GET');
    results.hourly.forEach((hour: any) => {
      this.hourlyForecast.series[0].data.push({
        y: Math.round(hour.temp),
        color: colorPicker(Math.round(hour.temp))
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
