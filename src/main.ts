import {Vue} from 'vue-property-decorator';
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsVue from 'highcharts-vue';
// @ts-ignore
import {library} from '@fortawesome/fontawesome-svg-core';
// @ts-ignore
import {fas} from '@fortawesome/free-solid-svg-icons';
import App from './App.vue';
import router from './router';

library.add(fas);

HighchartsMore(Highcharts);

Vue.use(HighchartsVue);
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h: any) => h(App)
}).$mount('#app');
