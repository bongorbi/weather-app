<template>
  <div id="app" :class="typeof weather.main != 'undefined' && backgroundImage()">
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
      <div style="height: 40vh">
        <div v-show="error===''" class="chartButtons">
          <button :class="{'selected':showPastWeek}" @click="showPastWeekChart">
            Past Week
          </button>
          <button :class="{'selected':showNextWeek}" @click="showNextWeekChart">
            Next Week
          </button>
        </div>
        <div class="chartContainer">
          <Chart v-if="nextWeekChartData.series[0].data.length!==0 && showNextWeek" :key="componentKey" ref="chart"
                 class="diagram"
                 :options="nextWeekChartData"/>
          <Chart v-if="pastWeekChartData.series[0].data.length!==0 && showPastWeek" :key="componentKey" ref="chart"
                 class="diagram"
                 :options="pastWeekChartData"/>
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

.chartContainer {
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
      stroke: #7cb5ec;
    }

    //.highcharts-tracker-line {
    //  stroke-linejoin: round;
    //  stroke: rgb(78, 56, 102);
    //  stroke-width: 2;
    //  fill: none;
    //}
    .highcharts-color-0 {
      fill: rgb(253, 65, 14);
    }

    .highcharts-plot-border {
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
  display: flex;
  justify-content: space-around;
  align-items: center;

  & > button {
    box-sizing: border-box;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    white-space: nowrap;
    outline: none;
    cursor: pointer;
    padding: 0 5px;
    width: 45%;
    height: 50%;
    min-height: 35px;
    color: #160c0c;
    font-size: 1.5rem;
    background-color: rgb(247, 136, 101);
    transition: 0.7s;
    box-shadow: 2px 4px rgb(0 0 0 / 65%);
    transform: scale(0.9); /* (-9% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
  }

  & > .selected {
    background-color: rgb(253, 65, 14);
    transform: scale(1.08); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
    transition: 0.7s;
    font-size: 1.7rem;
  }
}

#app {
  background-image: url(./assets/warm.jpg);
  background-size: cover;
  -webkit-background-size: cover;
  background-position: bottom;
  transition: 0.4s;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
  color: #2c3e50;
  overflow-y: auto;
  overflow-x: hidden;
}

.infoForecast {
  height: 40vh;
}

#app.under2 {
  background-image: url(./assets/background.gif);
  background-size: cover;
}

#app.over2 {
  background-image: url(./assets/2-15.jpg);
  background-size: cover;
}

#app.over16 {
  background-image: url(./assets/verySunny.jpg);
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
  color: #FFF;
  font-size: 2em;
  font-weight: 600;
  font-family: Nunito-Regular, sans-serif;
  text-align: center;
  text-shadow: 1px 3px rgba(0, 0, 0, 0.25);
}

.location-box .date {
  color: #FFF;
  font-size: 1.5rem;
  font-family: Nunito-Regular, sans-serif;
  text-align: center;
}

.weather-wrap {
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
      text-shadow: 1px 2px rgba(0, 0, 0, 0.25);
    }

    & .weather {
      color: #FFF;
      height: 10vh;
      font-size: 1.6rem;
      justify-content: center;
      display: flex;
      font-family: Nunito-Regular, sans-serif;
      align-items: center;
      text-shadow: 1px 2px rgba(0, 0, 0, 0.25);

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
  main {
    display: grid;
    grid-template-columns:40vw 55vw;
    grid-column-gap: 5%;

    & > .infoForecast {
      grid-column: 1;
    }

    .chartButtons {
      padding-right: 15%;
    }

    .chartContainer {
      display: flex;
      justify-content: center;
      flex-direction: column;
      grid-column: 2;

      & > .diagram {
        grid-column: 2;
      }
    }
  }
}
@media screen and (max-width: 500px) {
  .chartContainer {
    position: fixed;
    bottom: 0;
  }
}
@media screen and (max-width: 360px) {
  .chartContainer{
    position: fixed;
    bottom: 0
  }
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
