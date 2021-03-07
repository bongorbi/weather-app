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
              <div class="date">
                {{ dateBuilder() }}
              </div>
            </div>
            <div class="weather-box">
              <div class="firstColumn">
                <span class="weather">Temp now:<span class="temp">{{ Math.round(weather.main.temp) }}°c</span></span>
                <div class="weather">
                  Weather: {{ weather.weather[0].main }}
                  <img :src="getImgPath(imageNextToDeg)" :alt="imageNextToDeg">
                </div>
              </div>
              <div class="secondColumn">
                <span class="weather">Feels like: <span class="temp">
                  {{ Math.round(weather.main.feels_like) }}°c</span>
                </span>
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
      fill: rgba(255, 255, 255, 0.75);
    }

    .highcharts-plot-border {
      stroke-width: 2px;
      stroke: rgb(253, 65, 14);
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
  grid-column-gap: 1%;

  & > button {
    box-sizing: border-box;
    border: 0;
    align-items: center;
    justify-content: center;
    user-select: none;
    white-space: nowrap;
    outline: none;
    cursor: pointer;
    width: 100%;
    min-height: 35px;
    font-size: 1.5rem;
    background-color: rgb(247, 136, 101);
    top: 0;
    left: 0;
    transition: all .15s linear 0s;
    position: relative;
    display: inline-block;
    color: #160c0c;
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
    background-color: rgb(253, 65, 14);
    transition: 0.7s;
  }
}

#app {
  background: url(./assets/warm.jpg) no-repeat center center fixed;
  background-size: cover;
  overflow: hidden;
  -webkit-background-size: cover;
  transition: 0.4s;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
  color: #2c3e50;
  overflow-y: auto;
}

.infoForecast {
  height: 40vh;
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
  overflow: scroll; /* needed for safari to show the x axis scrollbar */
  padding: 8px;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75));
  background-repeat: no-repeat;
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
  font-size: 1.4rem;
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
  font-size: 2rem;
}

.location-box .location {
  color: #070303;
  font-size: 2em;
  font-weight: 600;
  font-family: Nunito-Regular, sans-serif;
  text-align: center;
}

.location-box .date {
  color: #000000;
  font-size: 1.5rem;
  font-family: Nunito-Regular, sans-serif;
  text-align: center;
}

.weather-wrap {
  display: inline-block;
  padding: 5px 10px;
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 16px;
  width: 100%;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);

  & > .weather-box {
    display: grid;
    grid-template-columns: 50% 50%;
    text-align: center;
    align-items: center;
    margin: 5px 0;

    & .temp {
      margin-left: 5px;
      font-family: Nunito-Regular, sans-serif;
      font-size: 2rem;
    }

    & .weather {
      color: #050303;
      height: 10vh;
      font-size: 1.6rem;
      justify-content: center;
      display: flex;
      font-family: Nunito-Regular, sans-serif;
      align-items: center;

      & img {
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

@media screen and (min-aspect-ratio: 13/9) {
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
  .firstColumn {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
  }
}
</style>
