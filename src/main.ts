import {Vue} from 'vue-property-decorator';
import HighchartsMore from 'highcharts/highcharts-more';
// @ts-ignore
import {library} from '@fortawesome/fontawesome-svg-core';
// @ts-ignore
import {fas} from '@fortawesome/free-solid-svg-icons';
import Highcharts from 'highcharts';
import Stock from 'highcharts/modules/stock';
import HighchartsVue from 'highcharts-vue';
import App from './App.vue';
import router from './router';
// @ts-ignore
import wb from './registerServiceWorker';

Stock(Highcharts);
Vue.use(HighchartsVue);
HighchartsMore(Highcharts);
Vue.use(HighchartsVue);
// @ts-ignore
Vue.prototype.$workbox = wb;
library.add(fas);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h: any) => h(App)
}).$mount('#app');
