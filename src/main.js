import Vue from 'vue';
import App from './App.vue';
import YmapPlugin from 'vue-yandex-maps';
import vuetify from './plugins/vuetify';

const settings = {
  apiKey: '6d119881-e64a-4f66-8d0a-5841ede45aaf',
  lang: 'ru_RU',
  coordorder: 'latlong',
  enterprise: false,
  version: '2.1',
};

Vue.use(YmapPlugin, settings);

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
