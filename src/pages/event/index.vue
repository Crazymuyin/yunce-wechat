<template name="event">
    <view class="page">
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="content">关联事件</block>
        </cu-custom>
        <!--<view class="nav-wrapper" id="nav-wrapper" v-if="warnNum > 0 || riskNum > 0">-->
        <view class="nav-wrapper" id="nav-wrapper" v-if="!noData && !noNet">
            <scroll-view scroll-x class="bg-white nav">
                <view class="flex text-center">
                    <view class="nav-item" v-for="(item,index) in navList" :key="index" @tap="tabSelect" :data-id="index" :data-value="item.alias" v-if="item.isShow">
                        <view class="border" :style="index === TabCur ? 'color: #1E82D2' : 'color: #999'">
                            {{item.name}}
                            <view class="active" v-if="index === TabCur"></view>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
        <view class="update-wrapper" id="update-wrapper" v-if="newEvent > 0 && !noData && !noNet">
            <view class="white-bg">
                <span>关联事件有{{newEvent}}条更新</span>
            </view>
        </view>
        <view class="event" :style="currentHeight" v-if="!noData && !noNet">
            <scroll-view class="eventList" scroll-y="true" :scroll-top="scrollTop" @scroll="scrollFn">
                <view class="list-item" v-for="(list, index) of eventList" :key="index" @click="eventDetailClick(list)">
                    <i>{{index + 1}}</i>
                    <span>{{list.eventTitle}}</span>
                    <span v-if="list.eventHeat >= 300" class="fire"></span>
                    <span v-if="list.isNew" class="new"></span>
                </view>
				<uni-load-more :loadingType="loadingType" :contentText="contentText" v-if="loadingShow"></uni-load-more>
            </scroll-view>
        </view>
		<no-data :noData="noData" :noNet="noNet" :errorTip="errorTip" @refreshRequest="refresh"></no-data>
	</view>
</template>

<script>
	import uniLoadMore from '../../components/uni-load-more.vue'
	import noData from '../../components/noData.vue'
	import netWork from '../../common/checkNet.js'
    export default {
        name: "event",
        data() {
            return {
                page: 1,
				pageSize: 15,
				loadingShow: false,
				loadingText: '加载中...',
				loadingType: 0,  //定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
				contentText: {
					contentdown:'上拉显示更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多数据了',
					contentError: '加载失败'
				},
				timer: null,
                realId: '',
                eventAppraise: '',
				riskValue: '',
                newEvent: 0,
                eventList: [],
                TabCur: 0,
                navList: [],
                riskNum: 0,
				resultType: 1,
                warnNum: 0,
                currentHeight: '',
                noData: false,
                noNet: false,
                errorTip: '',
				scrollTop: -10
            }
        },
        components: {
			uniLoadMore,
			noData
		},
		onLoad(options) {
            this.realId = options.realId;
			this.resultType = Number(options.resultType)
			let arraise = decodeURIComponent(options.eventAppraise);
			if (Number(arraise) === 12) {
				this.riskValue = 12;
			} else {
				this.eventAppraise = arraise;
			}
			this.riskNum = Number(options.risk);
			this.warnNum = Number(options.warn);
			this.navList = [
                {name: '全部', alias: '', isShow: Number(options.all) ? true : false},
                {name: '风险', alias: '负面', isShow: Number(options.risk) ? true : false},
                {name: '预警', alias: 12, isShow: Number(options.warn) ? true : false}
            ];
			if (options.eventAppraise) {
			    if (Number(options.eventAppraise) === 12) {
			        this.TabCur = 2
                } else {
			        this.TabCur = 1
                }
            } else {
			    this.TabCur = 0
            }

			this.initGetEventRequest();  // //页面一加载时请求一次数据
        },
        onReady() {

        },
        onUnload() {
            this.page = 1;
            this.eventList = [];
            this.realId = '';
            this.eventAppraise = '';
            this.newEvent = 0;
            this.TabCur = 0;
            this.navList = [];
            this.riskNum = 0;
            this.warnNum = 0;
            this.currentHeight = '';
        },
		onPullDownRefresh() {
			//下拉刷新的时候请求一次数据
			this.page = 1;
			this.eventList = [];
			this.initGetEventRequest();
		},
        methods: {
			refresh() {
				this.initGetEventRequest(); 
			},
            getWinHeight: async function() {
                let clientHeight = 0;
                // #ifdef H5
                clientHeight =  document.body.clientHeight;
                // #endif
                // #ifdef MP-WEIXIN
                clientHeight =  wx.getSystemInfoSync().windowHeight;
                // #endif
                let navHeight = 41;
                if (this.warnNum > 0 || this.riskNum > 0) {
                    // #ifdef H5
                    navHeight = document.getElementById('nav-wrapper').offsetHeight;
                    // #endif
                    // #ifdef MP-WEIXIN
                    const query = wx.createSelectorQuery();
                    query.select('#nav-wrapper').boundingClientRect();
                    query.selectViewport().scrollOffset();
                    await query.exec(function(res){
                        navHeight = res[0].height;
                    });
                    // #endif
                }
                let updateHeight = 0;
                if (this.newEvent) {
                    // #ifdef H5
                    updateHeight = document.getElementById('update-wrapper').offsetHeight;
                    // #endif
                    // #ifdef MP-WEIXIN
                    const query = wx.createSelectorQuery();
                    query.select('#update-wrapper').boundingClientRect();
                    query.selectViewport().scrollOffset();
                    await query.exec(function(res){
                        updateHeight = res[0].height;
                    });
                    // #endif
                }
                let listWrapperHeight = clientHeight - this.CustomBar - navHeight - updateHeight;
                this.currentHeight = `height: ${listWrapperHeight}px`;
            },
            tabSelect(e) {
                this.eventList = [];
				let value = e.currentTarget.dataset.value;
				if (Number(value) === 12) {
					this.riskValue = 12
					this.eventAppraise = '';
				} else {
					this.riskValue = ''
					this.eventAppraise = value;
				}
                this.TabCur = e.currentTarget.dataset.id;
				this.page = 1
                this.initGetEventRequest();
            },
			/**
			 * 第一次加载
			 */
			initGetEventRequest() {
			    let _self = this;
				_self.page = 1;
				_self.loadingType = 0;
				_self.eventList = [];
				_self.noData = false
				_self.noNet = false
				_self.errorTip = ''
				_self.loadingShow = false
                wx.showLoading({title: '玩命加载中'});
				uni.showNavigationBarLoading();
				netWork(function(res) {
					if(res) {
						let params = {
						    page: _self.page,
						    pageSize: _self.pageSize,
						    testTime: _self.globalData.testTime,
						    isUpdate: _self.globalData.isUpdate,
						    resultType: _self.resultType,
                            userId: _self.$store.getters.userInfo.client_id
						};
						if (_self.realId) params.realId = _self.realId;
						if (_self.eventAppraise && _self.eventAppraise !== 'undefined') params.eventAppraise = _self.eventAppraise;
						if (_self.riskValue) params.riskValue = _self.riskValue;
						let url = `/api/healthrisk/evaluateResult/getEvent`;
						_self.$http.get(url, params).then(res => {
						    wx.hideLoading();
						    let data = res.data;
						    if (data.hasOwnProperty('newCount')) {
						        _self.newEvent = data.newCount;
						        setTimeout(function() {
						            _self.newEvent = 0;
						        }, 2000)
						    }
						    if (data.status === 1) {
						        if (Array.isArray(data.data) && data.data.length) {
									_self.eventList = data.data;
									
									if (data.data.length < _self.pageSize) {
										_self.loadingType = 2;
									} else {
										_self.page++;
									}
									
									_self.getWinHeight();
									uni.stopPullDownRefresh()   //得到数据后停止下拉刷新
									_self.loadingShow = true
						        } else {
									_self.loadingType = 2
								}
						    } else {
								_self.noData = true
								_self.errorTip = '加载失败，请稍后重试！'
						    }
							uni.hideNavigationBarLoading()
						}, error => {
							wx.hideLoading()
							uni.hideNavigationBarLoading()
							_self.noData = true
							_self.errorTip = '加载失败，请稍后重试！'
						})
					} else {
						wx.hideLoading()
						uni.hideNavigationBarLoading()
						_self.noNet = true
						_self.errorTip = '无法连接网络，请检查你的网络设置!'
					}
				})
			},
            getMoreEventRequest() {
				if (this.loadingType !== 0) {
					return false;
				}
				this.loadingType = 1;
				uni.showNavigationBarLoading();
                let params = {
                    page: this.page,
                    pageSize: 15,
                    testTime: this.globalData.testTime,
                    isUpdate: this.globalData.isUpdate,
                    resultType: this.resultType
                };
                if (this.realId) params.realId = this.realId;
				if (this.eventAppraise && this.eventAppraise !== 'undefined') params.eventAppraise = this.eventAppraise;
				if (this.riskValue) params.riskValue = this.riskValue;
                let url = `/api/healthrisk/evaluateResult/getEvent`;
                this.$http.get(url, params).then(res => {
                    let data = res.data;
                    if (data.status === 1) {
                        if (Array.isArray(data.data) && data.data.length < 15) {
                            this.loadingType = 2;
                        } else {
                            this.page++;
							this.loadingType = 0;
                        }
						this.eventList = this.eventList.concat(data.data)
						uni.hideNavigationBarLoading();
                    } else {
						this.loadingType = 3;
                        uni.hideNavigationBarLoading();
                    }
                }, error => {
					this.loadingType = 3;
					wx.hideLoading()
					uni.hideNavigationBarLoading();
				})
            },
            eventDetailClick(event) {
                const url = '../eventDetail/index?eventWords=' + event.eventWords + '&newIds=' + event.newIds + '&realId=' + this.realId + "&event=" + event.eventTitle + "&id=" + event.id + "&ids=" + event.ids + "&resultType=" + this.resultType;
                uni.navigateTo({ url })
            },
			scrollFn(e) {
			    clearTimeout(this.timer);
			    if (e.target.scrollTop < this.scrollTop) {
			        this.timer = setTimeout(() => {
			            this.refresh();
			        }, 350)
			    }
				
			    let sh = e.target.scrollHeight;
			    let st = e.target.scrollTop;
			    let ch = Number(this.currentHeight.slice(8).replace('px', ''));
				
			    if (parseInt(st + ch) === sh || Math.ceil(st + ch) === sh || (st + ch) / sh >= 0.92) {
				  this.getMoreEventRequest();
			    }
			}
        }
    }
</script>

<style scoped lang="less">
    .page {
        width: 100%;
        height: 100vh;
        background-color: #FFFFFF;
    }
    .nav-wrapper {
        padding: 0 64rpx;
        background-color: #fff;
        border-bottom: 1px solid #f5f5f5;
        .nav-item {
            height: 80rpx;
            line-height: 80rpx;
            display: inline-block;
            flex: 1;
            text-align: center;
            font-size: 30rpx;
            .border {
                position: relative;
                margin: 0 auto;
                width: 80rpx;
                .active {
                    position: absolute;
                    bottom: 0;
                    width: 80rpx;
                    height: 8rpx;
                    border-bottom: 8rpx solid #1E82D2;
                }
            }
        }
    }
    .update-wrapper {
        height: 90rpx;
        background-color: #d5e9f7;
        .white-bg {
            height: 90rpx;
            line-height: 90rpx;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.1);
            font-size: 28rpx;
            color: #1E82D2;
        }
    }
    .event {
        font-size: 28rpx;
        .eventList{
            width: 100%;
            height: 100%;
            overflow-y: auto;
            background-color: #fff;
            padding: 0 38rpx 30rpx 38rpx;
            .list-item {
                height: 100rpx;
                margin: 0 auto;
                line-height: 100rpx;
                border-bottom: 2rpx solid #f0f0f0;
                font-size: 28rpx;
                display: flex;
                flex-flow: row nowrap;
                & i {
                    width: 60rpx;
                    height: 100rpx;
                    display: block;
                    text-align: center;
                    color: white;
                    font-size: 20rpx;
                    line-height: 100rpx;
                    background: url("../../static/imgs/public/img_result_red1.png") no-repeat center center;
                    background-size: 35rpx 38rpx;
                }
                & span {
                    width: 570rpx;
                    display: block;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
                .fire {
                    width: 40rpx;
                    height: 96rpx;
                    background: url("../../static/imgs/public/img_result_hot.png") no-repeat 100% center;
                    background-size: 22rpx 26rpx;
                }
                .new {
                    width: 50rpx;
                    height: 96rpx;
                    background: url("../../static/imgs/public/new.png") no-repeat 100% center    ;
                    background-size: 28rpx 28rpx;
                }
            }
            .list-item:last-child{
                border-bottom: none;
            }
        }
    }
</style>
