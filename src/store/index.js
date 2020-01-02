import Vue from 'vue'
import Vuex from 'vuex'
import login from './modules/login'
import options from './modules/options'

Vue.use(Vuex);
export default new Vuex.Store({
  modules: {
    login,
    options
  }
})
