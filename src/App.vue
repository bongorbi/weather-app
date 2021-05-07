<template>
  <div id="backgroundImg" :style="{'background-image': backgroundImgSrc}">
    <loading-overlay v-if="loading"/>
    <main @scroll.passive="changeScrollBtnIcon">
      <div id="infoForecast" class="infoForecast">
        <div class="search-box">
          <label>
            <input
              ref="input"
              v-model="query"
              type="text"
              class="search-bar"
              placeholder="Search City..."
              @focus="hideAndBlurContent"
              @focusout="hideAndBlurContent"
              @keypress.enter="getWeather">
          </label>
          <button
            v-if="!hideContent && isMobile"
            class="fullscreen"
            @click="goFullscreen">
            <font-awesome-icon
              ref="functionButton"
              aria-hidden="true"
              icon="expand-alt"
              class="icon"/>
          </button>
        </div>
        <div v-if="!hideContent" class="contentContainer">
          <div v-if="error!==''" class="error">
            <div>
              <p>{{ errorDisplayMsg }}</p>
              <button v-show="error==='User denied Geolocation'" class="refreshBtn"
                      @click="reloadPage">
                <font-awesome-icon
                  aria-hidden="true"
                  icon="redo"
                  class="icon"/>
              </button>
            </div>
            <img id="errImage" :src="errImage" :alt="imageNextToDeg">
          </div>
          <div v-if="typeof weather.main != 'undefined' && error===''" class="weather-wrap">
            <div class="location-box">
              <div class="location">
                {{ weather.name }}, {{ weather.sys.country }}
              </div>
              <div class="date">
                {{ dateBuilder() }}
              </div>
            </div>
            <div class="weather-box">
              <div class="weather">
                <span class="temp" :class="typeof weather.main != 'undefined' && tempClass()">
                  {{
                    Math.round(weather.main.temp)
                  }}°C</span>
              </div>
              <div class="weather">
                {{ weather.weather[0].main }}
                <img :src="getImgPath(imageNextToDeg)" :alt="imageNextToDeg">
              </div>
            </div>
          </div>
          <div v-if="typeof weather.main != 'undefined' && error===''" class="weather-wrap" :class="tempClass()">
            <div class="secondWeatherWindow">
              <span>Minimum temperature:</span>
              <span>{{ Math.round(weather.main.temp_min) }}°C</span>
            </div>
            <div class="secondWeatherWindow">
              <span>Feels like:</span>
              <span>{{ Math.round(weather.main.feels_like) }}°C</span>
            </div>
            <div class="secondWeatherWindow">
              <span>Maximum temperature:</span>
              <span>{{ Math.round(weather.main.temp_max) }}°C</span>
            </div>
            <div class="secondWeatherWindow">
              <span>Humidity:</span>
              <span>{{ Math.round(weather.main.humidity) }}%</span>
            </div>
            <div class="secondWeatherWindow">
              <span>Pressure:</span>
              <span>{{ Math.round(weather.main.pressure) }} hPa</span>
            </div>
            <div class="secondWeatherWindow">
              <span>Wind speed:</span>
              <span>{{ weather.wind.speed }}m/s</span>
            </div>
          </div>
        </div>
        <div>
          <ScrollDownButton v-if="!hideContent && typeof weather.main != 'undefined'&& error===''&& isMobile"
                            :down-button-icon="downButtonIcon"
                            :custom-class="typeof weather.main != 'undefined' && tempClass()"
                            @emit-scroll="scrollButton"/>
        </div>
      </div>
      <div v-show="!hideContent && error===''&& typeof weather.main != 'undefined'"
           class="chartPage">
        <button v-if="!isMobile" :class="{'selectedNextChartButton':!nextWeeksCharts}" @click="nextWeeksCharts=false">48
          hours forecast
        </button>
        <div v-if="!nextWeeksCharts || isMobile" class="tableAndTitleContainer">
          <p>48 hours forecast:</p>
          <ChartComponent :chartOptions="hourlyForecast" :class="typeof weather.main != 'undefined' && tempClass()"
          />
        </div>
        <div v-if="nextWeeksCharts || isMobile" class="tableAndTitleContainer">
          <p>Next week's:</p>
          <div>
            <ChartButtons :chart-types="chartButtons" @button-click="onChartButtonClick"/>
            <ChartComponent v-for="(chart, index) in chartButtons" v-show="chart.selected"
                            :key="index"
                            :class="typeof weather.main != 'undefined' && tempClass()"
                            :chartOptions="chart.chartName"/>
          </div>
        </div>
        <button v-if="!isMobile" :class="{'selectedNextChartButton':nextWeeksCharts}"
                @click="nextWeeksCharts=true">Next week's forecast
        </button>
      </div>
    </main>
  </div>
</template>

<script src="./App.ts">
</script>

<style lang="scss">
@font-face {
  font-family: "Nunito-Regular";
  src: url("../public/fonts/Nunito/Nunito-Regular.ttf") format("truetype");
}

@font-face {
  font-family: "Nunito-LightItalic";
  src: url("../public/fonts/Nunito/Nunito-LightItalic.ttf") format("truetype");
}

@import './src/colors.scss';
@import './src/desktopStyle.scss';
@import './src/mobileStyle.scss';

* {
  box-sizing: border-box;
}

html, body {
  scroll-behavior: smooth;
  height: 100%;
  margin: 0;
}

.chartContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;

  .highcharts-data-label-box {
    fill: rgba(253, 251, 251, 0.8);
    stroke: gray;
    stroke-width: 1px;
  }

  .highcharts-plot-background {
    fill: $whitish;
  }

  .highcharts-xaxis-labels {
    & > * {
      fill: black !important;
      font-size: 1rem !important;
    }
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
  height: 85vh;
  align-items: center;
  background-color: $whitish;
  border-radius: 16px;
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
      box-shadow: 3px 6px rgb(63, 82, 216);
      background: rgb(24, 196, 90) none;
    }

    & > p {
      color: black !important;
      font-size: 1.5rem;
      font-family: Nunito-Regular, sans-serif;
    }
  }

  & > #errImage {
    width: 40%;
    height: 70%;
  }
}

#backgroundImg {
  display: block;
  position: fixed;
  background: url("../public/assets/over16background.jpg");
  width: 100%;
  min-height: 100vh;
  bottom: 0;
  top: 0;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;

  * {
    font-family: Nunito-Regular, sans-serif !important;
  }

  .search-box {
    & .search-bar {
      display: block;
      transition: transform .4s; /* Animation */
      width: 100%;
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

</style>
