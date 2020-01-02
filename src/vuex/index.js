import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import defaultState from './state'
import defaultMutations from './mutations'
import defaultGetters from './getters'
import defaultActions from './actions'

const store = new Vuex.Store({
    // 当这个值为true，就不允许使用this.$store.state.count=3这样的方式修改count的值，
    // 如果要修改，必须使用这样的方法this.$store.commit('updateCount', 3)
    strict: true,
    state: defaultState,
    mutations: defaultMutations,
    getters: defaultGetters,
    actions: defaultActions
})

export default store