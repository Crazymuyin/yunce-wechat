const state = {
  _status: false,
  _token: '',
  _userInfo: {}
};

const getters = {
  status: state => state._status,
  token: state => state._token,
  userInfo: state => state._userInfo,
};

const mutations = {
  changeStatus(state, param) {
    // console.log('param', param);
    state._userInfo = param
  },
  isStatus(state, param) {
    state._status = param
  },
  getToken(state, param) {
    state._token = param
  }
};

const actions = {};

export default {
  state,
  getters,
  mutations,
  actions
}
