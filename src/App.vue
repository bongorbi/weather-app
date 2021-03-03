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
      <div>
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

.chartContainer {
  display: flex;
  padding-top: 10px;
  justify-content: center;

  .diagram {
    border-radius: 16px;

    .highcharts-root {
      border-radius: 16px;
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
      fill: rgb(78, 56, 102);
    }

    .highcharts-plot-border {
      stroke: rgb(78, 56, 102);
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
  box-sizing: border-box;
}

.chartButtons {
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  :last-child{
    margin-left: 10px;
  }
  :first-child{
    margin-right: 10px;
  }
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
    width: 50%;
    height: 50%;
    min-height: 35px;
    color: #160c0c;
    font-size: 1.5rem;
    background-color: rgb(149, 158, 160, 0.9);
    border-radius: 6px;
    box-shadow: 2px 4px rgb(0 0 0 / 65%);
  }

  & > .selected {
    background-color: rgb(78, 56, 102, 0.9);
    border-radius: 6px;
    transform: scale(1.08); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
    transition: 0.7s;
    color: #e3dddd;
    font-size: 1.7rem;
  }
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

.infoForecast {
  height: 40vh;
}

#app.under2 {
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

@media only screen and (min-width: 1000px) {
  main {
    display: grid;
    grid-template-columns:40vw 60vw;
    grid-column-gap: 5%;

    & > .infoForecast {
      grid-column: 1;
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
</style>
