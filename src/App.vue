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
        <ScrollDownButton v-if="!hideContent && typeof weather.main != 'undefined'&& error===''&& isMobile"
                          :down-button-icon="downButtonIcon"
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
            <ChartComponent v-for="(chart, index) in chartButtons" v-show="chart.selected"
                            :key="index"
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
  height: 60vh;
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
      color: black;
      font-size: 1.5rem;
      font-family: Nunito-Regular, sans-serif;
    }
  }

  & > #errImage {
    width: 60%;
  }
}

#backgroundImg {
  display: block;
  position: fixed;
  background: url("../public/assets/over16background.jpg");
  width: 100%;
  height: 100vh;
  bottom: 0;
  top: 0;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;

  main {
    display: grid;
    grid-template-rows: 100vh 87vh;
    scroll-behavior: smooth;
    overflow: auto;
    justify-content: center;
    position: relative;
    text-align: center;
    padding: 5vh 10vw;
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0));
    background-repeat: no-repeat;
    height: 100%;

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
        justify-content: space-between;
        font-size: 2rem;
        text-align: left;
        border-bottom: 1px solid $whitish;
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
          background-color: $green;
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
      grid-template-rows:6% 86% 7%;
      grid-row: 1;
      width: 100%;
      align-items: center;

      & > .contentContainer {
        justify-content: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .search-box {
        width: 100%;
        display: inline-block;

        & .search-bar {
          display: block;
          transition: transform .4s; /* Animation */
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
        }
      }

      @media (pointer: none), (pointer: coarse) {
        .search-box {
          display: flex;
          padding: 10px;

          & .search-bar:focus {
            background-color: rgba(255, 255, 255, 0.75);
            width: 100%;
            transform: translateY(100%);
          }

          label {
            width: 100%;
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

        & .secondWeatherWindow:last-child {
          border-bottom: none !important;
        }
      }
    }

    & > .downPage {
      height: 93vh;
      display: grid;
      justify-content: space-evenly;
      grid-template-rows: auto auto;
      grid-row-gap: 5px;
      margin-top: 5px;

      & > .tableAndTitleContainer {
        background-color: $whitish;
        padding: 5px 0 0 0;
      }

      p {
        color: black;
        padding: 0 0 5px 0;
        font-size: 1.2rem;
      }
    }
  }

  //desktop mode
  @media screen and (min-aspect-ratio: 13/9), (pointer: none), (pointer: coarse) {
    main {
      display: grid;
      grid-template-rows: 52vh 100vh;
      padding: 3% 10%;

      & > .infoForecast {
        grid-template-rows: 10% 45%;

        & > .search-box {
          & > .search-bar:focus {
            background-color: rgba(255, 255, 255, 0.75);
            font-size: 2rem;
            width: 70vw !important;
          }
        }

        & > .contentContainer {
          display: grid;
          grid-template-columns: 50% 50%;

          & > .weather-wrap {
            border-radius: 0;

            & .temp {
              border-radius: 0;
            }
          }
        }

        :nth-child(2).weather-wrap {
          display: grid;
          grid-template-columns: 50% 50%;
          grid-template-rows: auto auto auto;

          & > .secondWeatherWindow {
            padding: 0 10px;
          }

          //всяко четно
          & > .secondWeatherWindow:nth-child(2n) {
            border-left: 1px solid $whitish;
          }

          //всяко по-голямо от 4
          & > .secondWeatherWindow:nth-child(n+5) {
            border-bottom: none !important;
          }
        }
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
    .infoForecast {
      display: grid;
      grid-template-rows:5% 88% 7% !important;
      padding-top: 10px;
      width: 100vw !important;
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
