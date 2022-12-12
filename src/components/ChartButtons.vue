<template>
  <div class="chartButtons">
    <button
      v-for="chartType in chartTypes" :key="chartType.title" :chartTypes="chartTypes" class="buttons"
      :class="{'selected':chartType.selected}"
      @click="onClick(chartType)">
      {{ chartType.title }}
    </button>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {Buttons} from '@/commonconstants';

@Component
export default class ChartButtons extends Vue {
  @Prop()
  private chartTypes!: Buttons[];

  private onClick(chartType: Buttons) {
    this.$emit('button-click', chartType);
  }
}
</script>

<style scoped lang="scss">
@import "../colors";

.chartButtons {
  display: grid;
  grid-template-columns: 33.3% 33.3% 33.3%;
  grid-column-gap: 1px;
  height: 25px;

  & > button {
    box-sizing: border-box;
    border: 0;
    align-items: center;
    font-family: Nunito-Regular, sans-serif !important;
    justify-content: center;
    border: none;
    outline: none;
    user-select: none;
    white-space: nowrap;
    cursor: pointer;
    color: black;
    min-height: 25px;
    font-size: 1rem;
    background-color: #cccccc;
    top: 0;
    left: 0;
    transition: all .15s linear 0s;
    position: relative;
    display: inline-block;
    letter-spacing: 1px;
  }

  @media screen and (max-width: 500px) {
    button {
      font-size: 1rem;
    }
  }

  & > .selected {
    color: black;
    background-color: white;
  }
}

@media screen and (min-aspect-ratio: 13/9) {
  .chartButtons {
    width: 100%;
    height: 20px;
    margin-bottom: 10px;
  }
}
</style>
