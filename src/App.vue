<template>
  <div id="app" :class="typeof weather.main != 'undefined' && weather.main.temp > 16 ? 'warm' : ''">
    <main>
      <div class="search-box">
        <input
          v-model="query"
          type="text"
          class="search-bar"
          placeholder="Search City..."
          @keypress.enter="getWeather"
        >
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
      <Chart v-if="chartData.series[0].data.length!==0" class="diagram" :options="chartData"
             :height="'150px'"
             width="100%"/>
    </main>
  </div>
</template>

<script lang="ts">
import {Chart} from 'highcharts-vue';
import {Component, Vue} from 'vue-property-decorator';
import axios, {Method, AxiosResponse} from 'axios';

@Component({
  components: {
    Chart
  }
})
export default class App extends Vue {
  async created() {
    await this.takeAllImages();
  }

  private async takeAllImages() {
    const pictures = require.context(
      '@/assets/',
      true
      // /^.*\.gif$/
    );
    pictures.keys().forEach(key => {
      this.weatherSmallPicture.push(key.substring(2, 6));
    });
  }

  private apiKey = 'cab0c30b1dfc14ce360db2f0b4b5411b';
  private urlBase = 'https://api.openweathermap.org/data/2.5/';
  private query = '';
  private coords = {};
  private days = ['Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private weather: any = {};
  private chartData = {
    title: {
      text: 'Weekly forecast'
    },
    series: [
      {
        name: 'Past week - today forecast',
        data: []
      },
      {
        name: 'Next week - today forecast',
        data: []
      }
    ],
    xAxis: {
      type: 'category',
      categories: App.pastWeekDays(this.days, new Date().getDay()),
      title: {
        text: 'Days'
      }
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      }
    }
  };

  private static pastWeekDays(array: [], today: number) {
    const week = array.slice(today, array.length + 1).concat(array.slice(0, today));
    week.push(week[0]);
    return week;
  }

  private weatherSmallPicture: any[] = [];
  private imageNextToDeg = '';

  public request(url: string, method: Method, body?: any): Promise<any> {
    const request = axios.request({
      method,
      url,
      timeout: 30000,
      data: body
    });
    return request
      .then((response: AxiosResponse) => response.data)
      .catch((e: Error) => {
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
    const results = await this.request(`${this.urlBase}weather?q=${this.query}&units=metric&APPID=${this.apiKey}`, 'GET');
    console.log(results, 'Get weather');
    this.weather = results;
    this.coords = results.coord;
    await this.setImageName();
    await this.getWeatherForPastDays();
    await this.getWeatherForNextDays();
  }

  private async getWeatherForPastDays() {
    const results = await this.request(`${this.urlBase}onecall?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&APPID=${this.apiKey}`, 'GET');
    console.log(results, 'Get past days weather');
    results.daily.forEach((day: any) => {
      const averageForDay: number = Math.round((day.temp.day + day.temp.night) / 2);
      this.chartData.series[0].data.push(averageForDay);
    });
  }

  private async getWeatherForNextDays() {
    const results = await this.request(`${this.urlBase}forecast?lat=${this.coords.lat}&lon=${this.coords.lon}&units=metric&cnt=8&APPID=${this.apiKey}`, 'GET');
    results.list.forEach(day => {
      // console.log(day.main.temp, 'temp');
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'montserrat', sans-serif;
}

#app {
  background-image: url('assets/background.gif');
  background-size: cover;
  background-position: bottom;
  transition: 0.4s;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  overflow: hidden;
}

#app.warm {
  background-image: url('./assets/warm.gif');
}

main {
  min-height: 100vh;
  padding: 25px;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75));
}

.search-box {
  width: 100%;
  margin-bottom: 10px;
}

.search-box .search-bar {
  display: block;
  width: 100%;
  padding: 15px;

  color: #313131;
  font-size: 20px;
  appearance: none;
  border: none;
  outline: none;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.5) none;
  border-radius: 0 16px 0 16px;
  transition: 0.4s;
}

.search-box .search-bar:focus {
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 16px 0px 16px 0px;
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

.weather-box {
  text-align: center;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;

  & > .temp {
    display: inline-block;
    padding: 10px 25px;
    color: #FFF;
    font-size: 102px;
    font-weight: 900;
    text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
    background-color: rgba(255, 255, 255, 0.25);
    border-radius: 16px;
    margin: 5px 0;
    box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  }

  & > .weather {
    color: #FFF;
    font-size: 48px;
    font-weight: 700;
    justify-content: center;
    display: flex;
    font-style: italic;
    align-items: center;
    height: 18vh;
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

.diagram {
  border-radius: 16px !important;
}
</style>
