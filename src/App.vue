<template>
  <div id="app" :class="typeof weather.main != 'undefined' && weather.main.temp < 16 ? 'cold' : ''">
    <main>
      <div style="height: 40vh">
        <div class="search-box">
          <label>
            <input
              ref="input"
              v-model="query"
              type="text"
              class="search-bar"
              placeholder="Search City..."
              @keypress.enter="getWeather">
          </label>
        </div>
        <div v-if="error!==''" class="error">
          <p> {{ error }} </p>
        </div>
        <div v-if="typeof weather.main != 'undefined'" class="weather-wrap">
          <div class="location-box">
            <div class="location">
              {{ weather.name }}, {{ weather.sys.country }}
            </div>
            <div class="date">
              {{ dateBuilder() }}
            </div>
          </div>
          <div class="weather-box">
            <div class="temp">
              {{ Math.round(weather.main.temp) }}°c
            </div>
            <div class="weather">
              {{ weather.weather[0].main }}
              <img :src="getImgPath(imageNextToDeg)" :alt="imageNextToDeg">
            </div>
          </div>
        </div>
      </div>
      <Chart v-if="chartData.series[0].data.length!==0" class="diagram" :options="chartData"/>
    </main>
  </div>
</template>

<script lang="ts">
import {Chart} from 'highcharts-vue';
import {Component, Vue} from 'vue-property-decorator';
import axios, {AxiosResponse, Method} from 'axios';
import Highcharts from 'highcharts';

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
    Highcharts.setOptions({});
    // for testing only
    await this.getWeather();
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

  private apiKey = 'cab0c30b1dfc14ce360db2f0b4b5411b';
  private urlBase = 'https://api.openweathermap.org/data/2.5/';
  private query: string = 'sofia';
  private error: string = '';
  private coords: any = {};
  private days = ['Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private weather: any = {};
  private chartData: any = {
    // type of diagram
    // chart: {
    //   type: 'column'
    // },
    title: {
      text: 'Weekly forecast'
    },
    series: [
      {
        name: 'Past Week',
        data: []
      },
      {
        name: 'Next Week',
        data: []
      }
    ],
    xAxis: {
      type: 'category',
      categories: App.pastWeekDays(this.days, new Date().getDay()),
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      }
    },
    tooltip: {
      crosshairs: true,
      shared: true,
      split: true
    }
  };

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
    this.chartData.series[0].data = [];
    this.chartData.series[1].data = [];
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
      const averageForDay: number = Math.trunc((day.temp.morn + day.temp.night) / 2);
      this.chartData.series[0].data.push(averageForDay);
    });
    this.chartData.series[0].data.reverse();
  }

  private async getWeatherForNextDays() {
    const results = await this.request(`${this.urlBase}forecast?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&cnt=8&APPID=${this.apiKey}`, 'GET');
    results.list.forEach((day: any) => {
      this.chartData.series[1].data.push(Math.trunc(day.main.temp));
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
</script>

<style lang="scss">
@import 'https://code.highcharts.com/css/highcharts.css';

.highcharts-container {
  height: 100% !important;
  width: 100vw !important;
}

.highcharts-plot-background {
  fill: #efffff;
}

.highcharts-xaxis-labels {
  & > * {
    fill: black !important;
    font-size: 0.8rem !important;
  }
}

.highcharts-yaxis {
  & > * {
    fill: black !important;
    font-size: 0.8rem !important;
  }
}

.highcharts-yaxis-labels {
  & > * {
    fill: black !important;
    font-size: 0.8rem !important;
  }
}

.highcharts-background {
  fill: rgba(255, 255, 255, 0.75)
}

.highcharts-plot-border {
  stroke-width: 2px;
  stroke: #7cb5ec;
}

.error {
  height: 90vh;
  padding: 10px 25px;
  display: flex;
  justify-content: center;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);

  & > p {
    font-size: 3rem;
    align-items: center;
    display: flex;
    font-weight: 900;
    color: #000000;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'montserrat', sans-serif;
}

#app {
  background-image: url(./assets/warm.jpg);
  background-size: cover;
  -webkit-background-size: cover;
  background-position: bottom;
  transition: 0.4s;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
  color: #2c3e50;
  overflow-y: hidden;
  overflow-x: hidden;
}

#app.cold {
  background-image: url(./assets/background.gif);
  background-size: cover;
}

main {
  min-height: 100vh;
  width: 100vw;
  padding: 8px 8px 0 8px;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75));
}

.search-box {
  width: 100%;
  margin-bottom: 10px;
}

.search-box .search-bar {
  display: block;
  width: 100%;
  padding: 10px;
  color: #313131;
  font-size: 20px;
  appearance: none;
  border: none;
  outline: none;
  border-radius: 16px;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.5) none;
  transition: 0.4s;
}

.search-box .search-bar:focus {
  background-color: rgba(255, 255, 255, 0.75);
}

.location-box .location {
  color: #FFF;
  font-size: 32px;
  font-weight: 500;
  text-align: center;
  text-shadow: 1px 3px rgba(0, 0, 0, 0.25);
}

.location-box .date {
  color: #FFF;
  font-size: 20px;
  font-weight: 300;
  font-style: italic;
  text-align: center;
}

.weather-wrap {
  height: 30%;

  & > .weather-box {
    text-align: center;
    align-items: center;
    margin: 5px 0;
    justify-content: center;
    display: flex;
    flex-direction: column;

    & > .temp {
      display: inline-block;
      padding: 10px 25px;
      color: #FFF;
      font-size: 3rem;
      font-weight: 900;
      text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
      background-color: rgba(255, 255, 255, 0.25);
      border-radius: 16px;
      box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
    }

    & > .weather {
      color: #FFF;
      height: 13vh;
      font-size: 2rem;
      font-weight: 700;
      justify-content: center;
      display: flex;
      font-style: italic;
      align-items: center;
      text-shadow: 3px 6px rgba(0, 0, 0, 0.25);

      & > img {
        border-radius: 16px;
        margin-left: 10px;
        max-width: 100%;
        height: 60%;
      }

      & img::after {
        background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0, #fff 100%);
      }
    }
  }
}

.diagram {
  height: 58vh;
  //border-radius: 16px !important;
}
</style>
