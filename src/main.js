import Vue from 'vue'
import App from './App'
import store from './store'
import utils from './utils'
import qs from 'qs'
import cuCustom from 'static/colorui/components/cu-custom'

Vue.component('cu-custom', cuCustom);

Vue.config.productionTip = false;
Vue.prototype.$store = store;
App.mpType = 'app';

let Fly = require('flyio/dist/npm/wx');
let fly = new Fly;
fly.interceptors.request.use((config, promise) => {
    config.headers["X-Tag"] = "flyio";
    config.headers["Token"] = store.getters.token;
    if (config.method === 'POST' || config.method === 'post') {
        config.body = qs.stringify(config.body)
    }
    return config
});

const BASE_API = 'https://yunce3.lanjicloud.com';
// const BASE_API = 'http://10.253.254.20:8088';
fly.config.baseURL = BASE_API;
Vue.prototype.$http = fly;

Vue.prototype.$ = utils;

const app = new Vue({
  ...App
})
app.$mount()
Vue.prototype.globalData = getApp().globalData;
