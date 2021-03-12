<template>
  <div style="overflow:hidden">
    <div id="app" :class="typeof weather.main != 'undefined' && backgroundImage()"/>
    <main>
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
        </div>
        <div v-if="!hideContent">
          <div v-if="error!==''" class="error">
            <p> {{ error }} </p>
          </div>
          <div v-if="typeof weather.main != 'undefined' && error===''" class="weather-wrap">
            <div class="location-box">
              <div class="location">
                {{ weather.name }}, {{ weather.sys.country }}
              </div>
            </div>
            <div class="weather-box">
              <div class="firstColumn">
                <span class="weather">Temp. now:<span class="temp">{{ Math.round(weather.main.temp) }}°C</span></span>
                <span class="weather">Minimum temp.:<span class="temp">{{ Math.round(weather.main.temp_min) }}°C</span></span>
                <div class="weather">
                  Weather: {{ weather.weather[0].main }}
                  <img :src="getImgPath(imageNextToDeg)" :alt="imageNextToDeg">
                </div>
              </div>
              <div class="secondColumn">
                <span class="weather">Feels like: <span class="temp">
                  {{ Math.round(weather.main.feels_like) }}°C</span>
                </span>
                <span class="weather">Maximum temp.:<span class="temp">{{ Math.round(weather.main.temp_max) }}°C</span></span>
                <span class="weather">Wind speed: <span class="temp">
                  {{ weather.wind.speed }}m/s</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!hideContent" class="downButton">
          <button
            class="scrollButton"
            @click="scrollButton">
            <font-awesome-icon
              ref="functionButton"
              aria-hidden="true"
              :icon="downButtonIcon"
              class="icon"/>
          </button>
        </div>
      </div>
      <div v-show="!hideContent && !hideContent && error===''" class="downPage">
        <div v-show="mobileView" class="chartButtons">
          <button class="buttons" :class="{'selected':showFeelsLikeChart}" @click="showFeelsLike">
            Feels Like
          </button>
          <button class="buttons" :class="{'selected':showWindChart}" @click="showWind">
            Wind
          </button>
          <button class="buttons" :class="{'selected':showTempChart}" @click="showTemp">
            Temperature
          </button>
        </div>
        <div v-show="showTempChart " class="chartContainer">
          <Chart :key="componentKey" ref="chart"
                 class="diagram"
                 :options="tempChart"/>
        </div>
        <div v-show="showWindChart" class="chartContainer">
          <Chart :key="componentKey+1" ref="chart"
                 class="diagram"
                 :options="windChart"/>
        </div>
        <div v-show="showFeelsLikeChart" class="chartContainer">
          <Chart :key="componentKey+2" ref="chart"
                 class="diagram"
                 :options="feelsLikeChart"/>
        </div>
      </div>
    </main>
  </div>
</template>

<script src="./App.ts">
</script>

<style lang="scss">
@import 'https://code.highcharts.com/css/highcharts.css';
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');

@font-face {
  font-family: "Nunito-Regular";
  src: url("../public/fonts/Nunito/Nunito-Regular.ttf") format("truetype");
}

@font-face {
  font-family: "Nunito-LightItalic";
  src: url("../public/fonts/Nunito/Nunito-LightItalic.ttf") format("truetype");
}

* {
  font-family: Nunito-Regular, sans-serif;
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
  padding-top: 10px;
  justify-content: center;

  .diagram {
    //border-radius: 16px;

    .highcharts-root {
      //border-radius: 16px;
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
        fill: #000000 !important;
        font-size: 1rem !important;
      }
    }

    .highcharts-yaxis-labels {
      & > * {
        fill: #000000 !important;
        font-size: 1rem !important;
      }
    }

    .highcharts-background {
      fill: rgba(255, 255, 255, 0.75);
    }

    .highcharts-plot-border {
      stroke-width: 2px;
      stroke: rgb(253, 101, 1, 1);
    }
  }
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

.chartButtons {
  display: grid;
  grid-template-columns: 33% 33% 33%;
  grid-column-gap: 5px;

  & > .buttons {
    box-sizing: border-box;
    border: 0;
    align-items: center;
    justify-content: center;
    user-select: none;
    white-space: nowrap;
    outline: none;
    cursor: pointer;
    color: black;
    min-height: 35px;
    font-size: 1.5rem;
    background-color: rgb(27, 178, 242);
    top: 0;
    left: 0;
    transition: all .15s linear 0s;
    position: relative;
    display: inline-block;
    letter-spacing: 1px;
    box-shadow: 3px 6px 0 rgb(0 0 0 / 65%);

    &:hover {
      top: 3px;
      left: 3px;
      box-shadow: 1px 2px 0 rgb(0, 0, 0);
    }
  }

  @media screen and (max-width: 500px) {
    .buttons {
      font-size: 1rem;
    }
  }

  & > .selected {
    color: white;
    background-color: rgb(253, 101, 1, 1);
    transition: 0.4s;
  }
}

#app {
  background: url(../public/assets/warm.jpg) no-repeat center center fixed;
  background-size: cover;
  -webkit-background-size: cover;
  transition: 0.4s;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
  color: #2c3e50;
  padding: 5vh 10vw;
  overflow: auto;
}

#app.under2 {
  background: url(../public/assets/coldBackground.jpg) no-repeat center center fixed;
  background-size: cover;
}

#app.over2 {
  background: url(../public/assets/2-.jpg) no-repeat center center fixed;
  background-size: cover;
}

#app.over16 {
  background: url(../public/assets/warm.jpg) no-repeat center center fixed;
  background-size: cover;
}

main {
  scroll-behavior: smooth;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  text-align: center;
  width: 100%; /* percentage fixes the X axis white space when zoom out */
  height: 100vh; /* this is still an issue where you see white space when zoom out in the Y axis */
  //overflow: hidden;
  padding: 5vh 10vw;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75));
  background-repeat: no-repeat;

  .weather-wrap {
    display: inline-block;
    padding: 5px 10px;
    background-color: rgba(255, 255, 255, 0.75);
    border-radius: 16px;
    min-height: 15vh;
    margin-bottom: 10px;
    box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
    width: 80%;

    & > .secondWeatherWindow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 2rem;
      padding: 10px 30px;

      & > .temp {
        font-weight: 600;
        font-size: 2.2rem;
      }
    }

    & > .location-box {
      padding: 5px;

      & > .location {
        color: #070303;
        padding: 5px;
        font-size: 1.4em;
        font-weight: 600;
        font-family: Nunito-Regular, sans-serif;
        text-align: center;
      }

      & > .date {
        padding: 5px;
        color: #000000;
        font-size: 1.4rem;
        font-family: Nunito-Regular, sans-serif;
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

      & .temp {
        margin-left: 5px;
        font-family: Nunito-Regular, sans-serif;
        color: black;
        display: inline-block;
        padding: 10px 25px;
        align-items: center;
        font-size: 3rem;
        font-weight: 900;
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 16px;
        box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
      }

      & .weather {
        color: #050303;
        grid-template-columns: auto 50%;
        font-family: Nunito-Regular, sans-serif;
        align-items: center;
        font-size: 2rem;
        padding: 5px;
        font-weight: 700;
        justify-content: center;
        display: flex;

        & > img {
          height: 6vh;
        }
      }
    }
  }

  .infoForecast {
    height: 99vh;
    display: grid;
    grid-template-rows: 10% 80% 10%;

    & > .downButton {
      width: 100%;

      & > .scrollButton {
        width: 100%;
        height: 100%;

        & > * {
          font-size: 3rem;
        }
      }
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

      & .search-bar:focus {
        background-color: rgba(255, 255, 255, 0.75);
        font-size: 2rem;
        transition-timing-function: ease-in-out;
        width: 80vw;
        top: 0;
        right: 100%;
      }

      @media screen and (min-aspect-ratio: 13/9), (pointer: none), (pointer: coarse) {
        .search-bar:focus {
          background-color: rgba(255, 255, 255, 0.75);
          font-size: 2rem;
          transition-timing-function: ease-in-out;
          width: 99vw !important;
          top: 0;
          right: 100%;
        }
      }
      @media screen and (max-width: 500px), (pointer: none), (pointer: coarse) {
        .search-bar:focus {
          background-color: rgba(255, 255, 255, 0.75);
          font-size: 2rem;
          transition-timing-function: ease-in-out;
          width: 100%;
          top: 0;
          right: 100%;
        }
      }
    }
  }

  & > .downPage {
    height: 90vh;
  }
}

@media screen and (min-aspect-ratio: 13/9) {
  .weather-wrap {
    height: 36vh;

    & > .location-box {
      height: 20%
    }

    & > .weather-box {
      height: 80%;
    }
  }
  main {
    width: 100%;
    overflow: hidden;
    display: grid;
    grid-template-columns:auto auto;
    grid-template-rows: 50% 50%;

    .highcharts-root {
      border-radius: 16px;
    }

    & > .infoForecast {
      grid-column: 1;
      grid-row: 1;
    }

    .chartButtons {
      padding-right: 15%;
    }

    & .wind {
      grid-column: 2;
      grid-row: 1;
    }

    & .feelslike {
      grid-column: 2;
      grid-row: 2;
    }

    & .temp {
      grid-column: 1;
      grid-row: 2;
    }
  }
}

@media screen and (max-width: 360px) {
  .weather {
    font-size: 1.2rem !important;
  }
  .temp {
    font-size: 1.3rem !important;
  }
}

@media (pointer: none), (pointer: coarse) {
  main {
    padding: 8px;
  }
  #app {
    padding: 0;
  }
}
</style>
