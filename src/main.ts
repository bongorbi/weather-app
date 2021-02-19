import {Vue} from 'vue-property-decorator';
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsVue from 'highcharts-vue';
import App from './App.vue';
import router from './router';

HighchartsMore(Highcharts);

Vue.use(HighchartsVue);
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h: any) => h(App)
}).$mount('#app');
