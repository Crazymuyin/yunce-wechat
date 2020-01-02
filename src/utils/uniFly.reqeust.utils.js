import uniFly from 'unifly'
import utils from '../common/utils'
import store from '../vuex'

/**
 * 基础路由
 * @type {getters.baseApiUrl|string}
 */
uniFly.baseUrl = store.getters.baseApiUrl

/**
 * APICloud 签名校验
 * @type {number}
 */
let now = Date.now()
let appId = store.getters.appId
let appKey = store.getters.appKey
appKey = utils.SHA1(appId + 'UZ' + appKey + 'UZ' + now) + '.' + now

/**
 * 设置请求头
 */
uniFly.headers['X-APICloud-AppId'] = appId
uniFly.headers['X-APICloud-AppKey'] = appKey

/**
 * 全局请求超时时间
 * @type {number}
 */
uniFly.timeOut = 20000

/**
 * 自定义请求拦截
 * @param request
 * @returns {*}
 */
uniFly.requestInterceptors.success = function(request) {
    console.log('自定义请求拦截')
    //配置基本信息
    request.headers = uniFly.headers
    uni.showLoading()
    return request
}
uniFly.responseInterceptors.success = function(request) {
    console.log('自定义响应拦截')
    uni.hideLoading()
    return Promise.resolve(request)
}

/**
 * 所有的接口请在此处统一定义
 * @type {{post: (function(*=): *), get: (function(*=): *)}}
 */
const $api = {
    /**
     * post方法
     * @param data
     * @returns {*}
     */
    post: function(url, data) {
        return uniFly.post({
            url: url,
            params: data
        })
    },
    /**
     * get方法
     * @param data
     * @returns {*}
     */
    get: function(url, data) {
        return uniFly.get({
            url: url,
            params: data
        })
    }
}

export default $api