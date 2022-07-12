<template>
  <div id="backgroundImg" :style="{ 'background-image': backgroundImgSrc }">
    <loading-overlay v-if="loading" />
    <main @scroll.passive="changeScrollBtnIcon">
      <div id="infoForecast" class="infoForecast">
        <div class="search-box">
          <label for="search-bar">
            <input
              id="search-bar"
              ref="input"
              v-model="query"
              type="text"
              class="search-bar"
              placeholder="Search City..."
              @focus="hideAndBlurContent"
              @focusout="hideAndBlurContent"
              @keypress.enter="getWeatherBySearching"
            >
          </label>
          <button v-if="!hideContent && isMobile" class="fullscreen" @click="goFullscreen">
            <font-awesome-icon ref="functionButton" aria-hidden="true" icon="expand-alt" class="icon" />
          </button>
        </div>
        <div v-if="error !== ''" class="error" :class="{ nothingFoundErr: error === 'No city results...' }">
          <div>
            <p>
              {{ errorDisplayMsg }}
            </p>
            <font-awesome-icon
              v-show="error === deniedLocation"
              color="#3f52d8"
              aria-hidden="true"
              icon="hand-point-right"
              class="handIcon"
            />
            <button v-show="error === 'User denied Geolocation'" class="refreshBtn" @click="reloadPage">
              <font-awesome-icon aria-hidden="true" icon="redo" class="icon" />
            </button>
          </div>
          <img id="errImage" :src="errImage" :alt="imageNextToDeg" >
        </div>
        <div v-if="!hideContent" class="contentContainer">
          <div v-if="typeof weather.main != 'undefined' && error === ''" class="weather-wrap">
            <div class="location-box">
              <div class="location">
                {{ weather.name }}, {{ weather.sys.country }}
              </div>
              <div class="date">
                {{ dateBuilder() }}
              </div>
              <div class="alert">
                {{ weatherAlerts }}
              </div>
            </div>
            <div class="weather-box">
              <div class="weather">
                <span class="temp" :class="typeof weather.main != 'undefined' && tempClass()">
                  {{ Math.round(weather.main.temp) }}°C</span
                >
              </div>
              <div class="weather">
                {{ weather.weather[0].main }}
                <img :src="getImgPath(imageNextToDeg)" :alt="imageNextToDeg" >
              </div>
            </div>
          </div>
          <div
            v-if="typeof weather.main != 'undefined' && error === '' && tempLabels.length > 0"
            class="weather-wrap"
            :class="tempClass()"
          >
            <div v-for="row in tempLabels" :key="row.label" class="secondWeatherWindow">
              <span>{{ row.label }}</span>
              <span>{{ row.value }}</span>
            </div>
          </div>
        </div>
        <div v-if="!hideContent && typeof weather.main != 'undefined' && error === '' && isMobile">
          <ScrollDownButton
            :down-button-icon="downButtonIcon"
            :custom-class="typeof weather.main != 'undefined' && tempClass()"
            @emit-scroll="scrollButton"
          />
        </div>
      </div>
      <div v-show="!hideContent && error === '' && typeof weather.main != 'undefined'" class="chartPage">
        <div class="buttonContainer">
          <button
            v-show="!isMobile"
            class="chartButtons"
            :class="{ selectedNextChartButton: !nextWeeksCharts }"
            @click="nextWeeksCharts = false"
          >
            48 hours forecast
          </button>
          <button
            v-show="!isMobile"
            class="chartButtons"
            :class="{ selectedNextChartButton: nextWeeksCharts }"
            @click="nextWeeksCharts = true"
          >
            Next week's forecast
          </button>
        </div>
        <div v-show="!nextWeeksCharts || isMobile" class="tableAndTitleContainer">
          <p>48 hours forecast:</p>
          <ChartComponent :chartOptions="hourlyForecast" :class="typeof weather.main != 'undefined' && tempClass()" />
        </div>
        <div v-show="nextWeeksCharts || isMobile" class="tableAndTitleContainer">
          <p>Next week's:</p>
          <div>
            <ChartButtons :chart-types="chartButtons" @button-click="onChartButtonClick" />
            <ChartComponent
              v-for="(chart, index) in chartButtons"
              v-show="chart.selected"
              :key="index"
              :class="typeof weather.main != 'undefined' && tempClass()"
              :chartOptions="chart.chartName"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Chart } from 'highcharts-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import axios, { AxiosResponse, Method } from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { isMobile } from 'mobile-device-detect';
import { Buttons, GEOLOCATION_STATUS, SCROLL_BUTTON_POSITION } from '@/commonconstants';
import { Geolocation } from '@capacitor/core';

const ChartComponent = () => import('@/components/Chart.vue');
const LoadingOverlay = () => import('@/components/LoadingOverlay.vue');
const ScrollDownButton = () => import('@/components/ScrollDownButton.vue');
const ChartButtons = () => import('@/components/ChartButtons.vue');

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
  private deniedLocation = GEOLOCATION_STATUS.DENIEDGEOLOCATION;

  private async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.coords.lon = coordinates.coords.longitude;
      this.coords.lat = coordinates.coords.latitude;
      await this.getWeatherByCoords();
    } catch (e: any) {
      if (e.message === this.deniedLocation) {
        this.error = e.message;
      }
    }
  }

  private errImage = '';
  private errorDisplayMsg: string = '';
  private weatherAlerts: string = '';

  @Watch('error')
  private errorTextWatcher() {
    switch (this.error) {
      case this.deniedLocation:
        this.errImage = `${require('../public/assets/tunrOnGPS.png')}`;
        this.errorDisplayMsg = 'Turn on your location and press the refresh button';
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

  private tempLabels: { label: string; value: any }[] = [];

  private async mounted() {
    // взима височината на екрана в началото, за да я използваме по-натам,
    // да предотвратим свиване на фона на мобилни устройства, след като кликнем на инпуита
    this.windowHeight = window.innerHeight;
    this.resizeChart();
    // предотвратява фоновата картинка да се свива при поява на клавиатурата, защото vh се сменя
    window.addEventListener('native.showkeyboard', this.keyboardShowHideHandler);
    window.addEventListener('native.hidekeyboard', this.keyboardShowHideHandler);
    await this.getCurrentPosition();
  }

  private goFullscreen() {
    if (isMobile) {
      const doc = window.document;
      const docEl = doc.documentElement;
      // @ts-ignore
      const requestFullScreen = docEl.requestFullscreen
        || docEl.mozRequestFullScreen
        || docEl.webkitRequestFullScreen
        || docEl.msRequestFullscreen;
      // @ts-ignore
      const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
      // @ts-ignore
      if (
        !doc.fullscreenElement
        && !doc.mozFullScreenElement
        && !doc.webkitFullscreenElement
        && !doc.msFullscreenElement
      ) {
        requestFullScreen.call(docEl);
      } else {
        cancelFullScreen.call(doc);
      }
      // чака да стане fullscreen и променя innerHeight да е равна на уголемения прозорец,
      // за да зададе нов размер на бекграунд картинката
      App.resizeBackgroundImg(window.innerHeight);
      this.resizeChart();
    }
  }

  private loading: boolean = false;
  private downButtonIcon: string = 'chevron-down';
  private scrollUpOrDown: string = SCROLL_BUTTON_POSITION.DOWN;

  private changeScrollBtnIcon(e: { target: HTMLInputElement }) {
    const screenHeight = e.target.offsetHeight;
    const scrollFromTop = e.target.scrollTop;
    if (screenHeight - 120 > scrollFromTop) {
      this.downButtonIcon = 'chevron-down';
      this.scrollUpOrDown = SCROLL_BUTTON_POSITION.DOWN;
    } else {
      this.downButtonIcon = 'chevron-up';
      this.scrollUpOrDown = SCROLL_BUTTON_POSITION.UP;
    }
  }

  private scrollButton() {
    const mainEl = document.querySelector('main');
    switch (this.scrollUpOrDown) {
      case SCROLL_BUTTON_POSITION.UP:
        mainEl!.scrollBy(0, -1000);
        break;
      default:
        mainEl!.scrollBy(0, 1000);
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

  // setting width and height of charts depending on screen of the device
  private resizeChart() {
    let chartWidth;
    let chartHeight = window.innerHeight * 0.4;
    switch (true) {
      // detects landscape mode
      case window.matchMedia('(min-aspect-ratio: 13/9)').matches:
        // 60% from window width
        chartWidth = window.innerWidth * 0.6;
        // 40% from window height
        chartHeight = window.innerHeight * 0.4;
        this.windChart.chart.width = chartWidth;
        this.windChart.chart.height = chartHeight - 40;
        this.tempChart.chart.width = chartWidth;
        this.tempChart.chart.height = chartHeight - 40;
        this.feelsLikeChart.chart.width = chartWidth;
        this.feelsLikeChart.chart.height = chartHeight - 40;
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
    const { temp } = this.weather.main;
    let cssClass = '';
    switch (true) {
      case temp <= 2:
        cssClass = 'bellow2';
        break;
      case temp > 2 && temp < 16:
        cssClass = 'over2';
        break;
      case temp >= 16:
        cssClass = 'over16';
        break;
      default:
        cssClass = '';
        break;
    }
    return cssClass;
  }

  private backgroundImgSrc = '';

  private backgroundImage() {
    const { temp } = this.weather.main;
    if (temp <= 2) {
      this.backgroundImgSrc = `url(${require('../public/assets/coldBackground.jpg')})`;
    } else if (temp > 2 && temp < 16) {
      this.backgroundImgSrc = `url(${require('../public/assets/over2background.jpg')})`;
    } else if (temp >= 16) {
      this.backgroundImgSrc = `url(${require('../public/assets/over16background.jpg')})`;
    }
  }

  private async takeAllImages() {
    const pictures = require.context('../public/assets/', true);
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
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    }
    if (pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    }
    if (pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    }
    return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
  }

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
            textOutline: 0
          },
          enabled: true,
          formatter(): any {
            const color = 'black';
            // @ts-ignore
            return `<span style="color: ${color}">${this.y}°C</span>`;
          },
          shadow: false,
          inside: true
        }
      }
    },
    boost: { enabled: true },
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
    series: [
      {
        name: 'Hourly Forecast',
        data: [],
        pointWidth: 50,
        zones: [
          {
            value: 0,
            color: '#486eb1'
          },
          {
            value: 5,
            color: '#fea82f'
          },
          {
            color: '#BA181B'
          }
        ],
        color: null
      }
    ],
    xAxis: {
      type: 'categories',
      categories: App.chartHours(),
      min: 0,
      // eslint-disable-next-line no-restricted-globals
      max: innerWidth > 600 ? 10 : 5,
      scrollbar: {
        enabled: true,
        barBorderWidth: 0,
        buttonBorderWidth: 0,
        barBackgroundColor: 'gray',
        buttonBackgroundColor: 'silver',
        trackBorderWidth: 1,
        trackBorderColor: 'gray',
        height: 30
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
        return this.points.reduce(
          (s: any, point: { y: any; series: { name: string } }) => `Hour: ${s}<br/>Celsius:${point.y}${App.metricUnitSetter(point.series.name)}`,
          `<b>${this.x}</b>`
        );
      }
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chart: {
            panning: true
          }
        }
      ]
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
          style: {
            textOutline: 0,
            fontSize: '1rem'
          },
          allowOverlap: true
        }
      },
      series: {
        pointPadding: -0.2
      }
    },
    boost: { enabled: true },
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
    series: [
      {
        name: 'Wind',
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
        return this.points.reduce(
          (s: any, point: { series: { name: string }; y: any }) => `${s}<br/>${point.series.name}:${point.y}${App.metricUnitSetter(point.series.name)}`,
          `<b>${this.x}</b>`
        );
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
          formatter(): any {
            const color = this.y === 0 ? 'black' : 'white';
            // @ts-ignore
            return `<span style="color: ${color}">${this.y}°C</span>`;
          },
          enabled: true
        }
      },
      series: {
        pointPadding: -0.2
      }
    },
    boost: { enabled: true },
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
    series: [
      {
        name: 'Temperature',
        data: [],
        animation: {
          duration: 2000,
          easing: App.easeOutBounce
        },
        color: null,
        stacking: 'normal',
        dataLabels: {
          color: 'whitesmoke',
          style: {
            fontSize: '1rem',
            fontFamily: 'Trebuchet MS'
          }
        }
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
        return this.points.reduce(
          (s: any, point: { series: { name: string }; y: any }) => `${s}<br/>${point.series.name}:${point.y}${App.metricUnitSetter(point.series.name)}`,
          `<b>${this.x}</b>`
        );
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
          formatter(): any {
            // @ts-ignore
            const color = this.y === 0 ? 'black' : 'white';
            // @ts-ignore
            return `<span style="color: ${color}">${this.y}°C</span>`;
          },
          enabled: true
        }
      },
      series: {
        pointPadding: -0.2
      }
    },
    boost: { enabled: true },
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
    series: [
      {
        name: 'Feels Like',
        data: [],
        animation: {
          duration: 2000,
          easing: App.easeOutBounce
        },
        color: null
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
        console.log(this);
        // @ts-ignore
        return this.points.reduce(
          (s: any, point: { series: { name: string }; y: any }) => `${s}<br/>${point.series.name}:${point.y}${App.metricUnitSetter(point.series.name)}`,
          `<b>${this.x}</b>`
        );
      }
    }
  };

  private chartButtons: Buttons[] = [
    {
      title: 'Temperature',
      chartName: this.tempChart,
      selected: true
    },
    {
      title: 'Feels Like',
      chartName: this.feelsLikeChart,
      selected: false
    },
    {
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
    let week: any[];
    if (today === 0) {
      const firstEl = array[array.length - 1];
      week = array.slice(0);
      week.unshift(firstEl);
    } else {
      week = array.slice(today - 1, array.length).concat(array.slice(0, today));
      week.push(week[0]);
    }
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
    charts.forEach((chart: { series: any[] }) => {
      chart.series.forEach((obj: any) => {
        // eslint-disable-next-line no-param-reassign
        obj.data = [];
      });
    });
  }

  private async getWeather(results: any) {
    this.weather = results;
    this.coords = results.coord;
    this.tempLabels = [
      {
        label: 'Minimum temperature:',
        value: `${Math.round(this.weather.main.temp_min)}°C`
      },
      {
        label: 'Feels like:',
        value: `${Math.round(this.weather.main.feels_like)}°C`
      },
      {
        label: 'Maximum temperature:',
        value: `${Math.round(this.weather.main.temp_max)}°C`
      },
      {
        label: 'Humidity:',
        value: `${Math.round(this.weather.main.humidity)}%`
      },
      {
        label: 'Pressure:',
        value: `${Math.round(this.weather.main.pressure)}hPa`
      },
      {
        label: 'Wind speed:',
        value: `${Math.round(this.weather.wind.speed)}m/s`
      }
    ];
    (this.$refs.input as HTMLInputElement).blur();
    await this.setImageName();
    await this.getWeatherForNextDays();
    await this.backgroundImage();
  }

  private async getWeatherBySearching() {
    App.clearChartData([this.tempChart, this.windChart, this.feelsLikeChart, this.hourlyForecast]);
    const results = await this.request(
      `${this.urlBase}weather?q=${this.query}&units=metric&APPID=${this.apiKey}`,
      'GET'
    );
    await this.getWeather(results);
  }

  private async getWeatherByCoords() {
    App.clearChartData([this.tempChart, this.windChart, this.feelsLikeChart, this.hourlyForecast]);
    const results = await this.request(
      `${this.urlBase}weather?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&APPID=${this.apiKey}`,
      'GET'
    );
    await this.getWeather(results);
  }

  private async getWeatherForNextDays() {
    function colorPicker(temp: number) {
      if (temp > 0) {
        return '#BA181B';
      }
      return '#486eb1';
    }

    const results = await this.request(
      `${this.urlBase}onecall?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&cnt=8&APPID=${this.apiKey}`,
      'GET'
    );

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
    if (results.alerts) {
      const { alerts } = results;
      if (alerts[1]) {
        if (alerts[1].description !== '') {
          this.weatherAlerts = results.alerts[1].description;
        }
      } else if (alerts[0]) {
        if (alerts[0].description !== '') {
          this.weatherAlerts = results.alerts[0].description;
        }
      } else {
        this.weatherAlerts = '';
      }
    } else {
      this.weatherAlerts = '';
    }
  }

  private dateBuilder() {
    const d = new Date();
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${date} ${month} ${year}`;
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: 'Nunito-Regular';
  src: url('../public/fonts/Nunito/Nunito-Regular.ttf') format('truetype');
}

@import './src/colors.scss';
@import './src/desktopStyle.scss';
@import './src/mobileStyle.scss';

* {
  box-sizing: border-box;
}

html,
body {
  scroll-behavior: smooth;
  height: 100%;
  margin: 0;
}

.chartContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;

  & > * {
    font-family: 'Times New Roman', sans-serif !important;
  }

  // borders on the chart bars
  & rect {
    stroke-width: 0;
  }

  & path {
  }

  & path:last-child {
    stroke-width: 1;
  }

  .highcharts-data-label-box {
    fill: rgba(253, 251, 251, 0.8);
    stroke: gray;
    stroke-width: 1px;
  }

  .highcharts-plot-background {
    fill: $whitish;
  }

  .highcharts-background {
    fill: $whitish;
  }
}

.error {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 90vw;
  align-items: center;
  background-color: $whitish;
  box-sizing: border-box;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.95);

  & > div {
    display: flex;
    justify-content: center;
    text-align: left;
    padding: 0 15px;

    & > .refreshBtn {
      align-items: center;
      text-align: center;
      border-radius: 10px;
      display: inline-block;
      font-size: 2rem;
      padding: 10px;
      color: #313131;
      width: 60px;
      height: 60px;
      appearance: none;
      border: none;
      outline: none;
      box-shadow: 6px 3px rgb(63, 82, 216);
      background: rgb(24, 196, 90) none;
      cursor: pointer;
    }

    .refreshBtn:hover {
      background-color: $whitish;
    }

    .refreshBtn:active {
      box-shadow: none;
      transform: translate(6px, 3px);
    }

    & > p {
      color: black !important;
      font-size: 1.5rem;
      font-family: Nunito-Regular, sans-serif;
    }
  }

  & > #errImage {
    transition: transform 0.7s ease-in-out;
  }

  & > #errImage:hover {
    transform: rotate(360deg);
  }
}

.nothingFoundErr {
  width: 100%;
}

#backgroundImg {
  display: block;
  position: fixed;
  background: url('../public/assets/over16background.jpg');
  width: 100%;
  min-height: 100vh;
  bottom: 0;
  top: 0;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;

  * {
    font-family: Nunito-Regular, sans-serif;
  }

  .search-box {
    z-index: 1111;

    & .search-bar {
      display: block;
      transition: transform 0.6s; /* Animation */
      padding: 10px;
      color: #313131;
      font-size: 1.5rem;
      appearance: none;
      border: none;
      outline: none;
      border-radius: 16px;
      box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
      background: rgba(255, 255, 255, 0.5) none;
    }

    & .search-bar:focus {
      background-color: rgba(255, 255, 255, 0.75);
      font-size: 2rem;
      transform: translateY(100%);
      width: 100%;
    }
  }

  .over2 {
    background-color: rgb(67, 87, 26) !important;
    color: white !important;

    & > .secondWeatherWindow {
      & > :last-child {
        color: rgb(181, 231, 21);
      }
    }
  }

  .bellow2 {
    background-color: $whitish !important;
    color: black !important;
  }

  .over16 {
    background-color: #8093a2 !important;

    & > .secondWeatherWindow {
      & > :last-child {
        color: white;
      }
    }
  }

  p {
    color: white;
    font-size: 1.2rem;
    font-family: Nunito-Regular, sans-serif !important;
  }
}

.secondWeatherWindow {
  align-items: center;
}
</style>
