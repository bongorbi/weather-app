<template>
  <div id="app" :class="typeof weather.main != 'undefined' && backgroundImage()">
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
              <div class="weather">
                <span class="temp">{{ Math.round(weather.main.temp) }}°C</span>
              </div>
              <div class="weather">
                {{ weather.weather[0].main }}
                <img :src="getImgPath(imageNextToDeg)" :alt="imageNextToDeg">
              </div>
            </div>
          </div>
          <div v-if="typeof weather.main != 'undefined' && error===''" class="weather-wrap">
            <div class="secondWeatherWindow">
              <span>Minimum temp.:</span>
              <span>{{ Math.round(weather.main.temp_min) }}°C</span>
            </div>
            <div class="secondWeatherWindow">
              <span>Feels like:</span>
              <span>{{ Math.round(weather.main.feels_like) }}°C</span>
            </div>
            <div class="secondWeatherWindow">
              <span>Maximum temp.:</span>
              <span>{{ Math.round(weather.main.temp_max) }}°C</span>
            </div>
            <div class="secondWeatherWindow">
              <span>Wind speed:</span>
              <span>{{ weather.wind.speed }}m/s</span>
            </div>
          </div>
        </div>
        <div v-if="!hideContent && error===''" class="downButton">
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
    <footer>
      <p><a href="mailto:andonov225@gmail.com">andonov225@gmail.com</a></p>
    </footer>
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

$thelightestgreen: rgb(171, 221, 134);
$lightgreen: rgb(163, 220, 2);
$darkgreen: rgb(30, 85, 49);

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
  padding-top: 10px;
  justify-content: center;

  .diagram {
    //border-radius: 16px;

    .highcharts-root {
      //border-radius: 16px;
    }

    .highcharts-plot-background {
      fill: aliceblue;
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
      fill: rgb(171, 221, 134);
    }

    .highcharts-plot-border {
      stroke-width: 2px;
      stroke: $darkgreen;
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
  width: 98%;
  font-family: Nunito-Regular, sans-serif !important;

  & > .buttons {
    box-sizing: border-box;
    border: 0;
    align-items: center;
    justify-content: center;
    border: none;
    outline: none;
    user-select: none;
    white-space: nowrap;
    cursor: pointer;
    color: black;
    min-height: 35px;
    font-size: 1.5rem;
    background-color: $lightgreen;
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
    background-color: $darkgreen;
    transition: 0.4s;
  }
}

#app {
  background-image: url(../public/assets/warm.jpg);
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
  background-image: url(../public/assets/coldBackground.jpg);
  background-size: cover;
}

#app.over2 {
  background-image: url(../public/assets/2-.jpg);
  background-size: cover;
}

#app.over16 {
  background-image: url(../public/assets/warm.jpg);
  background-size: cover;
}

main {
  display: grid;
  grid-template-rows: 100vh 87vh;
  scroll-behavior: smooth;
  overflow: auto;
  text-align: center;
  width: 100vw; /* percentage fixes the X axis white space when zoom out */
  height: 100vh; /* this is still an issue where you see white space when zoom out in the Y axis */
  padding: 5vh 10vw;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75));
  background-repeat: no-repeat;

  & > .infoForecast {
    grid-row: 1;
  }

  & > .downPage {
    grid-row: 2;
  }

  .weather-wrap {
    display: inline-block;
    padding: 5px 10px;
    background-color: rgba(255, 255, 255, 0.75);
    border-radius: 16px;
    min-height: 15vh;
    margin-bottom: 10px;
    box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
    width: 80%;

    @media screen and (max-width: 500px) {
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

      & > * {
        font-family: Nunito-Regular, sans-serif;
      }

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
        text-align: center;
      }

      & > .date {
        padding: 5px;
        color: #000000;
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

      & .temp {
        margin-left: 5px;
        color: black;
        display: inline-block;
        padding: 10px 25px;
        align-items: center;
        font-size: 3rem;
        font-weight: 900;
        background-color: $lightgreen;
        border-radius: 16px;
        box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
      }

      & .weather {
        color: #050303;
        grid-template-columns: auto 50%;
        align-items: center;
        font-size: 2rem;
        padding: 5px;
        font-weight: 700;
        justify-content: center;
        display: flex;

        & > img {
          margin-left: 10px;
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
        background-color: $lightgreen;
        border: none;
        outline: none;

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
          top: 0;
          right: 100%;
        }
      }
      @media screen and (max-width: 500px), (pointer: none), (pointer: coarse) {
        .search-bar:focus {
          background-color: rgba(255, 255, 255, 0.75);
          font-size: 2rem;
          transition-timing-function: ease-in-out;
          width: 100% !important;
          top: 0;
          right: 100%;
        }
      }
    }
  }

  & > .downPage {
    height: 90vh;
    margin-top: 10px;
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
    //width: 100%;
    //height: 100%;
    //overflow: hidden;
    //display: grid;
    //grid-template-columns:auto auto;
    //grid-template-rows: 50% 50%;
    //
    //.highcharts-root {
    //  border-radius: 16px;
    //}
    //
    //& > .infoForecast {
    //  grid-column: 1;
    //  grid-row: 1;
    //}
    //
    //.chartButtons {
    //  padding-right: 15%;
    //}
    //
    //& .wind {
    //  grid-column: 2;
    //  grid-row: 1;
    //}
    //
    //& .feelslike {
    //  grid-column: 2;
    //  grid-row: 2;
    //}
    //
    //& .temp {
    //  grid-column: 1;
    //  grid-row: 2;
    //}
  }
}

// mobile
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
    padding: 8px;
  }
  #app {
    padding: 0;
  }
}

footer {
  z-index: 1111;
  width: 100%;
  background-color: $darkgreen;
  text-align: right;

  & a {
    color: white;
    align-items: center;
    margin-right: 5px;
  }
}
</style>
