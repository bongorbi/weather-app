import {Vue} from 'vue-property-decorator';
import HighchartsVue from 'highcharts-vue';
import router from './router';
import App from './App.vue';

Vue.use(HighchartsVue);
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h: any) => h(App)
}).$mount('#app');
