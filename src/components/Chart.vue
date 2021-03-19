<template>
  <div class="chartContainer">
    <Chart ref="highcharts" class="diagram"
           :options="chartOptions"/>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {Chart} from 'highcharts-vue';

@Component({
  components: {
    Chart
  }
})
export default class ChartComponent extends Vue {
  @Prop()
  private chartOptions;
  @Prop()
  private componentKey;
}
</script>

<style scoped lang="scss">
</style>
