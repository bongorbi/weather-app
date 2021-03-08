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
      </div>
      <div v-show="mobileView && !hideContent && error===''" class="chartButtons">
        <button :class="{'selected':showFeelsLikeChart}" @click="showFeelsLike">
          Feels Like
        </button>
        <button :class="{'selected':showWindChart}" @click="showWind">
          Wind
        </button>
        <button :class="{'selected':showTempChart}" @click="showTemp">
          Temperature
        </button>
      </div>
      <div v-show="showTempChart && !hideContent && error===''" class="chartContainer">
        <Chart :key="componentKey" ref="chart"
               class="diagram"
               :options="tempChart"/>
      </div>
      <div v-show="showWindChart && !hideContent && error===''" class="chartContainer">
        <Chart :key="componentKey+1" ref="chart"
               class="diagram"
               :options="windChart"/>
      </div>
      <div v-show="showFeelsLikeChart && !hideContent && error===''" class="chartContainer">
        <Chart :key="componentKey+2" ref="chart"
               class="diagram"
               :options="feelsLikeChart"/>
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

.blurBackground {
  filter: blur(8px);
  -webkit-filter: blur(8px);
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

* {
  margin: 0;
  padding: 0;
  font-family: Nunito-Regular, sans-serif;
  box-sizing: border-box;
}

.chartButtons {
  display: grid;
  grid-template-columns: 33% 33% 33%;
  grid-column-gap: 5px;

  & > button {
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
    button {
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
  background: url(./assets/warm.jpg) no-repeat center center fixed;
  background-size: cover;
  -webkit-background-size: cover;
  transition: 0.4s;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
  color: #2c3e50;
  overflow: hidden;
}

.infoForecast {
  height: 42vh;
}

#app.under2 {
  background: url(./assets/coldBackground.jpeg) no-repeat center center fixed;
  background-size: cover;
  overflow: hidden;
}

#app.over2 {
  background: url(./assets/2-.jpg) no-repeat center center fixed;
  background-size: cover;
  overflow: hidden;
}

#app.over16 {
  background: url(./assets/warm.jpg) no-repeat center center fixed;
  background-size: cover;
  overflow: hidden;
}

main {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  text-align: center;
  width: 100%; /* percentage fixes the X axis white space when zoom out */
  height: 100vh; /* this is still an issue where you see white space when zoom out in the Y axis */
  overflow: hidden; /* needed for safari to show the x axis scrollbar */
  padding: 8px;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75));
  background-repeat: no-repeat;
}

.search-box {
  height: 7vh;
  width: 100%;
  margin-bottom: 10px;

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
    transition: 0.4s;
  }

  & .search-bar:focus {
    background-color: rgba(255, 255, 255, 0.75);
    font-size: 2rem;
  }
}

.weather-wrap {
  display: inline-block;
  padding: 5px 10px;
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 16px;
  height: 32vh;
  width: 100%;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);

  & > .location-box {
    padding-bottom: 5px;

    & > .location {
      color: #070303;
      font-size: 1.4em;
      font-weight: 600;
      font-family: Nunito-Regular, sans-serif;
      text-align: center;
    }

    & > .date {
      color: #000000;
      font-size: 1.4rem;
      font-family: Nunito-Regular, sans-serif;
      text-align: center;
    }
  }

  & > .weather-box {
    display: grid;
    grid-template-columns: 50% 50%;
    text-align: center;
    grid-column-gap: 3%;
    align-items: center;
    height: 23vh;
    margin-bottom: 10px;

    & > :first-child {
      border-right: 1px solid rgb(0, 0, 0);
    }

    & .firstColumn {
      display: grid;
      grid-template-rows: 33% 33% 33%;
      height: 100%;
    }

    & .secondColumn {
      display: grid;
      grid-template-rows: 33% 33% 33%;
      height: 100%;
    }

    & .temp {
      margin-left: 5px;
      font-family: Nunito-Regular, sans-serif;
      font-size: 1.5rem;
      color: #e25800;
    }

    & .weather {
      color: #050303;
      font-size: 1.3rem;
      display: grid;
      grid-template-columns: auto 50%;
      text-align: left;
      font-family: Nunito-Regular, sans-serif;
      align-items: center;

      & > img {
        height: 6vh;
      }
    }
  }
}

@media screen and (min-aspect-ratio: 13/9) {
  .weather-wrap {
    height: 30vh;

    & > .location-box {
      height: 20%
    }

    & > .weather-box {
      height: 80%;

    }
  }
  .chartContainer:nth-child(3):hover {
    & > :first-child {
      transform: translate(-10%, 10%) scale(1.2);
      transition: transform .2s ease;

      .highcharts-background {
        fill: rgba(255, 255, 255, 0.95);
      }

      z-index: 111;
    }
  }

  .chartContainer:nth-child(3) {
    & > :first-child {

      transform: translate(10%, -10%) scale(.8);
      transition: transform .2s ease;

      .highcharts-background {
        fill: rgba(255, 255, 255, 0.95);
      }

      z-index: 111;
    }
  }

  .chartContainer:nth-child(4) {
    & > :first-child {

      transform: translate(-10%, 10%) scale(.8);
      transition: transform .2s ease;
    }
  }

  .chartContainer:nth-child(4):hover {
    & > :first-child {

      transform: translate(10%, -10%) scale(1.2);
      transition: transform .2s ease;

      .highcharts-background {
        fill: rgba(255, 255, 255, 0.95);
      }

      z-index: 111;
    }
  }

  .chartContainer:nth-child(5):hover {
    & > :first-child {

      transform: translate(-10%, -10%) scale(1.2);
      transition: transform .2s ease;

      .highcharts-background {
        fill: rgba(255, 255, 255, 0.95);
      }

      z-index: 111;
    }
  }

  .chartContainer:nth-child(5) {
    & > :first-child {
      transform: translate(10%, 10%) scale(.8);
      transition: transform .2s ease;
    }
  }
  main {
    overflow: hidden;
    display: grid;
    grid-template-columns:auto auto;
    grid-column-gap: 1%;
    grid-row-gap: 1%;
    grid-template-rows: 50% 50%;

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
</style>
