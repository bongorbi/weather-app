<template>
  <div id="main" style="overflow:hidden">
    <loading-overlay v-if="loading"/>
    <div id="backgroundImg" :style="{'background-image': backgroundImgSrc}"
         :class="[blurBackground?'blurBackground fixed':'']"/>
    <main @scroll.passive="changeScrollBtnIcon">
      <div class="infoForecast">
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
            v-if="!hideContent && mobileView"
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
            <p> {{ error }} </p>
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
        <ScrollDownButton v-if="!hideContent && error===''&& mobileView" :down-button-icon="downButtonIcon"
                          :custom-class="typeof weather.main != 'undefined' && tempClass()"
                          @emit-scroll="scrollButton"/>
      </div>
      <div v-show="!hideContent && error===''&& typeof weather.main != 'undefined'"
           class="downPage">
        <div class="tableAndTitleContainer">
          <p>48 hours forecast:</p>
          <ChartComponent :chartOptions="hourlyForecast" :class="typeof weather.main != 'undefined' && tempClass()"
          />
        </div>
        <div class="tableAndTitleContainer">
          <p>Next week's:</p>
          <div>
            <ChartButtons :chart-types="chartButtons" @button-click="onChartButtonClick"/>
            <ChartComponent v-for="chart in chartButtons" v-show="chart.selected"
                            :class="typeof weather.main != 'undefined' && tempClass()"
                            :chartOptions="chart.chartName"/>
          </div>
        </div>
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

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

.blurBackground {
  filter: blur(8px);
  -webkit-filter: blur(8px);
  transition-timing-function: ease-in-out
}

.chartContainer {
  transition: 0.8s;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .diagram {

    .highcharts-data-label-box {
      fill: rgb(253, 251, 251, 0.1);
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

    .highcharts-yaxis {
      & > * {
        fill: #000000 !important;
        font-size: 1rem !important;
      }
    }

    .highcharts-background {
      fill: $whitish;
    }
  }
}

.error {
  height: 29%;
  display: flex;
  justify-content: center;
  width: 93%;
  margin-top: 20px;
  text-shadow: 1px 3px rgb(0 0 0 / 25%);
  background-color: rgb(255 255 255 / 67%);
  border-radius: 16px;
  box-shadow: 3px 6px rgb(0 0 0 / 25%);

  & > p {
    font-size: 3rem;
    align-items: center;
    display: flex;
    font-weight: 700;
    color: black;
  }
}

.fixed {
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: fixed;
}

#backgroundImg {
  display: block;
  width: 100%;
  height: 100vh;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}

main {
  position: fixed;
  display: grid;
  grid-template-rows: 100vh 87vh;
  scroll-behavior: smooth;
  overflow: auto;
  text-align: center;
  width: 100vw;
  padding: 5vh 10vw;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.0));
  background-repeat: no-repeat;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;

  & > .infoForecast {
    grid-row: 1;
  }

  & > .downPage {
    grid-row: 2;
  }

  :first-child.weather-wrap {
    background: transparent;
    box-shadow: none;
  }

  .weather-wrap {
    display: flex;
    padding: 2% 2%;
    background-color: rgba(255, 255, 255, 0.55);
    border-radius: 16px;
    min-height: 39vh;
    margin-bottom: 10px;
    box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
    width: 70%;
    justify-content: space-between;
    flex-direction: column;

    @media screen and (max-width: 683px) {
      & > .secondWeatherWindow {
        font-size: 1.7rem !important;
        padding: 5px 5px !important;
      }
    }

    & > .secondWeatherWindow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 2rem;
      padding: 10px 30px;
      text-align: left;
      border-bottom: 1px solid $whitish !important;
      width: 100%;

      & > * {
        font-family: Nunito-Regular, sans-serif;
      }

    }

    & > .location-box {
      padding: 5px;

      & > .location {
        color: white;
        padding: 5px;
        font-size: 1.4em;
        font-weight: 600;
        text-align: center;
      }

      & > .date {
        padding: 5px;
        color: white;
        font-size: 1.4rem;
        text-align: center;
        font-weight: 300;
        font-style: italic;
      }
    }

    & > .weather-box {
      display: flex;
      justify-content: space-between;
      text-align: left;
      flex-direction: column;

      & > * {
        font-family: Nunito-Regular, sans-serif;
      }

      & .temp {
        margin-left: 5px;
        color: black;
        display: inline-block;
        padding: 10px 25px;
        align-items: center;
        font-size: 5rem;
        font-weight: 900;
        background-color: $darkyellow;
        border-radius: 16px;
        box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
      }

      & .weather {
        color: whitesmoke;
        grid-template-columns: auto 50%;
        align-items: center;
        font-size: 2.5rem;
        padding: 5px;
        font-weight: 700;
        justify-content: center;
        display: flex;

        & > img {
          margin-left: 10px;
          height: 10vh;
        }
      }
    }
  }

  .infoForecast {
    height: 100vh;
    display: grid;
    grid-template-rows: 8% 83.5% 7%;

    & > .contentContainer {
      justify-content: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .search-box {
      height: 7vh;
      width: 100%;
      display: inline-block;
      transition: all 0.4s linear;

      & .search-bar {
        display: block;
        width: 100%;
        padding: 10px;
        color: #313131;
        font-size: 1.4rem;
        appearance: none;
        border: none;
        outline: none;
        border-radius: 16px;
        box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
        background: rgba(255, 255, 255, 0.5) none;
        transition: all 0.4s;
        transition-timing-function: ease-in-out
      }

      @media screen and (min-aspect-ratio: 13/9), (pointer: none), (pointer: coarse) {
        .search-bar:focus {
          background-color: rgba(255, 255, 255, 0.75);
          font-size: 2rem;
          transition-timing-function: ease-in-out;
          top: 0;
          right: 100%;
        }
      }
    }

    @media (pointer: none), (pointer: coarse) {
      .search-bar:focus {
        background-color: rgba(255, 255, 255, 0.75);
        font-size: 2.5rem;
        transition-timing-function: ease-in-out;
        width: 110% !important;
        height: 60px;
      }
      .search-box {
        display: flex;
        height: 50px;
        padding: 10px 10px 0 10px;

        label {
          width: 90%;
          height: 100%;

          & > input {
            height: 100%;
          }
        }

        .fullscreen {
          height: 100%;
          display: flex;
          align-items: center;
          border-radius: 10px;
          font-size: 1.7rem;
          padding: 10px;
          color: #313131;
          appearance: none;
          border: none;
          outline: none;
          margin-left: 3px;
          box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
          background: rgba(255, 255, 255, 0.5) none;
        }
      }
    }
  }

  & > .downPage {
    height: 93vh;
    display: flex;
    justify-content: space-evenly;
    flex-direction: column;
    align-items: center;

    & > .tableAndTitleContainer {
      background-color: $whitish;
      padding: 5px 0 0 0;
    }

    p {
      color: black;
      padding: 0 0 5px 0;
      font-size: 1.5rem;
    }
  }
}

//desktop mode
@media screen and (min-aspect-ratio: 13/9) {
  main {
    display: grid;
    grid-template-rows: 100vh 100vh;
    padding: 3% 20%;

    &.infoForecast {
      height: 100vh;
    }

    :nth-child(2).weather-wrap {
      display: grid;
      grid-template-columns: 50% 50%;
      grid-template-rows: auto auto auto;
    }

    & .downPage {
      height: 100vh;

      & .chartButtons {
        min-height: 40px;

        & > button {
          font-size: 1.8rem !important;
        }
      }

      p {
        font-size: 1.8rem
      }
    }
  }
}

@media screen and (max-width: 360px) {
  .temp {
    font-size: 1.3rem;
  }
  .secondWeatherWindow {
    & > span {
      font-size: 1.3rem;
    }
  }
}

@media (pointer: none), (pointer: coarse) {
  main {
    padding: 0
  }
  #app {
    padding: 0;
  }
}

.over2 {
  background-color: rgb(67, 87, 26) !important;
  color: white !important;

  & > .secondWeatherWindow {
    & > :last-child {
      color: rgb(181, 231, 21);
      font-weight: 600;
      font-size: 1.7rem;
    }
  }
}

.bellow2 {
  background-color: $whitish !important;
  color: black !important;

  & > .secondWeatherWindow {
    & > :last-child {
      font-weight: 600;
    }
  }
}

.over16 {
  background-color: #8093a2 !important;

  & > .secondWeatherWindow {
    & > :last-child {
      color: white;
      font-weight: 600;
    }
  }
}

p {
  color: white;
  font-size: 1.2rem;
  font-family: Nunito-Regular, sans-serif !important;
}
</style>
