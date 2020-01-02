<template name="testing">
    <view>
        <cu-custom bgColor="bg-custom-nav" :isBack="true" :isTarget="true" @targetTap="targetTap">
            <block slot="backText"></block>
            <block slot="targetIcon"><i class="history_icon"></i></block>
            <block slot="content">测试中</block>
        </cu-custom>
        <view class="wrapper" v-if="!noData && !noNet">
            <view class="header-wrapper" id="header-wrapper">
                <view class="header">
                    <image src="../../static/imgs/testing/img_vip_head.png" alt="" v-if="!isVip"></image>
					<image src="../../static/imgs/testing/vip.png" alt="" v-if="isVip"></image>
                    <span>{{profession}}</span>
                    <span>{{userName}}</span>
                    <span>{{mobilePhone}}</span>
                </view>
                <view class="progress">
                    <view class="cu-progress radius striped active">
                        <view class="bg-blue" :style="[{ width: progressLoading ? percent+'%' : '' }]"></view>
                        <view class="progress-desc">{{textDesc}}...{{percent}}%</view>
                    </view>
                </view>
            </view>

             <view class="custom-loading" v-if="typeList.length === 0">
                <img src="../../static/imgs/testing/testinig.gif" alt="">
                <view class="loading">{{textDesc}}...</view>
            </view>

            <view class="type-wrapper" id="type-wrapper" v-if="typeList.length">
                <view class="type-list">
                    <view class="type-item" v-for="(item, index) of typeList" :key="index" v-if="item.number !== 0" @tap="selectSource(item)">
                        <view class="circle" :class="currentSource === item.name ? 'active' : ''">
                            <span class="number">{{item.value}}条</span>
                        </view>
                        <span>{{item.name}}</span>
                    </view>
                </view>
            </view>
			<scroll-view class="list-wrapper" id="list-wrapper" :style="currentHeight" scroll-y="true" @scrolltolower="getMoreSourceList()"
			 :scroll-top="scrollTop" @scroll="scrollFn">
                <view class="list-item" v-for="(list, index) of dataList" :key="index" v-if="typeList.length && dataList.length" @tap="eventDetailClick(list)">
                    <view class="title">
                        <span>{{list.title}}</span>
                    </view>
                    <view class="desc">
                        <span>来源：{{list.sourceName ? list.sourceName : '--'}}</span>
                        <span>{{list.publishDate}}</span>
                    </view>
                </view>
                <uni-load-more :loadingType="loadingType" :contentText="contentText" v-if="typeList.length && dataList.length"></uni-load-more>
                <view class="vip-tip" v-if="(!isVip && typeList.length !== 0) && loadingType === 2">
                    <a @tap="toogleVipTip">
                        <span>下载</span><span style="color: #FCD741">APP</span><span>查看更多数据</span>
                    </a>
                </view>
            </scroll-view>
		</view>
        <toggle :toggle-info="toggleInfo" @toggleTag="toggleTagTest"></toggle>
        <no-data :noData="noData" :noNet="noNet" :errorTip="errorTip" @refreshRequest="refreshRequest"></no-data>
    </view>
</template>

<script>
    import Toggle from '../../components/toggle'
    import uniLoadMore from '../../components/uni-load-more.vue'
    import noData from '../../components/noData'
	import netWork from '../../common/checkNet.js'
    export default {
        name: "testing",
        data() {
            return {
                first: false,
                errorState: false,
                textDesc: '大数据实时处理中',
                timer: '',
                fakeTimer: '',
                fakeNumber: 0,
                userId: '',
                realId: '',
                currentSource: '',
                completed: false,
                profession: '',
                userName: '',
                mobilePhone: '',
                percent: 0,
                percentArr: [],
                toggleInfo: {
                    changeModel: false,
                    isModel: false,
                    index: '',
                    val: "",
                },
                firstLoading: true,
                progressLoading: true,
                currentHeight: '',
                typeList: [],
                dataList: [],
                isVip: this.$store.getters.userInfo.userType,
                pageInfo: {
                    page: 1,
                    size: 10
                },
                loadingText: '加载中...',
                loadingType: 0,  //定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
                contentText: {
                    contentdown:'上拉显示更多',
                    contentrefresh: '正在加载...',
                    contentnomore: '没有更多数据了',
					contentError: '加载失败'
                },
                noData: false,
                noNet: false,
                errorTip: '',
				firstLoadList: true,
				scrollTop: -10
            }
        },
        components: {
            Toggle,
            uniLoadMore,
            noData
        },
        onLoad(options) {
            this.textDesc = '大数据实时处理中';
            this.percent = 0;
            this.completed = false;
            this.profession = options.keywords;
            this.globalData.searchTxt = options.keywords;
            this.userId = options.userId ? options.userId : this.$store.getters.userInfo.client_id;
            this.realId = options.realId;
            this.first = options.first ? options.first : false;
            this.errorState = options.errorState ? options.errorState : false;
            if (this.errorState) {
                this.toggleInfo = { changeModel: true, index: 2, isModel: true, val: '本次测试结果获取失败！', title: "提示" };
                return;
            };
            this.indexProgressRequest();
			this.firstLoadList = true
            // this.getInitSourceList();
            this.setTimer();
            this.firstLoading = true;
            this.fakeNumber = 0;
        },
        onUnload() {
            clearInterval(this.timer);
            clearInterval(this.fakeTimer);
            this.firstLoading = true;
            this.fakeNumber = 0;
            if (this.first) {
              this.first = false;
              this.toggleInfo = { changeModel: true, index: 4, isModel: true, val: '您可以在历史测评中查看本次测试的结果！', title: "提示" }
            }
        },
		onPullDownRefresh: function() {
			//下拉刷新的时候请求一次数据
			this.firstLoadList = true
			this.getInitSourceList()
		},
        methods: {
            /*刷新*/
            refreshRequest() {
                this.indexProgressRequest();
                this.getInitSourceList();
                this.setTimer();
				this.firstLoading = true;
				this.fakeNumber = 0;
            },
            setDomHeight() {
                let clientHeight =  wx.getSystemInfoSync().windowHeight;
                this.getWindowHeight("header-wrapper", (headHeight) => {
                    this.getWindowHeight("type-wrapper", (typeHeight) => {
                        let listWrapperHeight = clientHeight - this.CustomBar - headHeight - typeHeight;
                        this.currentHeight = `height: ${listWrapperHeight}px`;
                    });
                });
            },
            /**
             * 获取元素高度
             * @param id
             * @function callBack
             */
             getWindowHeight(id, callBack) {
                let updateHeight = 0;
                // #ifdef H5
                updateHeight = document.getElementById(id).offsetHeight;
                return updateHeight;
                // #endif
                // #ifdef MP-WEIXIN
                const query = wx.createSelectorQuery();
                query.select(`#${id}`).boundingClientRect();
                query.selectViewport().scrollOffset();
                query.exec(function(res){
                    updateHeight = res[0].height;
                    if (typeof callBack === 'function') callBack(updateHeight);
                });
                // #endif
            },
            targetTap(bool) {
                if (bool) {
                    let url = `../history/index`;
                    uni.navigateTo({url})
                }
            },
            setTimer() {
                this.timer = setInterval(() => {
                    this.indexProgressRequest();
                }, 5000)
            },
            setFakeTimer() {
                this.fakeTimer = setInterval(() => {
                    this.fakeProgressTimer()
                }, 5000)
            },
            /**
             * 进度条
             */
            indexProgressRequest() {
				this.noData = false
				this.noNet = false
				this.errorTip = ''
                const params = {
                    userId: this.userId ? this.userId : this.$store.getters.userInfo.client_id
                };
                const url = `/api/healthmaster/task/indexProgress`;
                this.$http.get(url, params).then((res) => {
                    let data = res.data;
                    if (data.status === 1) {
                        if (this.firstLoading) {
                            if (data.data.proScore === 100) {
                                clearInterval(this.timer);
                                clearInterval(this.fakeTimer);
                                this.setFakeTimer();
                                return false;
                            } else {
                                this.firstLoading = false
                            };
                        };
                        this.percent = data.data.proScore;
                        if (data.data.proScore < 100) {
                            if (data.data.proScore < 76) {
                                this.textDesc = '大数据实时处理中';
                            } else {
                                this.textDesc = '大数据实时处理中';
                            }
                        } else {
                            this.textDesc = '处理完成，正在生成报告';
                            this.completed = true;
                            clearInterval(this.timer);
                            clearInterval(this.fakeTimer);
                            this.electDataByIdRequest(this.userId, this.realId);
                        }
                        this.getCounterRequest();
                    } else {
						this.noData = true
						this.errorTip = '加载失败，请稍后重试！'
					}
                }, error => {
					this.noData = true
					this.errorTip = '加载失败，请稍后重试！'
				})
            },
            /**
             * 模拟进度条
             */
            fakeProgressTimer() {
                this.fakeNumber++;
                let curProgress = 10 * this.fakeNumber;
                this.percent = curProgress;
                if (curProgress < 70) {
                    this.textDesc = '大数据实时处理中';
                } else {
                    if (curProgress < 90) {
                        this.textDesc = '大数据实时处理中';
                    } else if (curProgress === 90) {
                        this.textDesc = '处理完成，正在生成报告';
                    } else if (curProgress === 100) {
                        this.completed = true;
                        clearInterval(this.fakeTimer);
                        this.electDataByIdRequest(this.userId, this.realId);
                    };
                };
                this.getCounterRequest();
            },
            /**
             * 获取来源数量
             */
            getCounterRequest() {
				this.noData = false
				this.noNet = false
				this.errorTip = ''
                let self = this;
                const params = {
                    isVip: this.$store.getters.userInfo.userType,
                    realId: this.realId,
                    page: 1,
                    size: this.pageInfo.size
                };
                if (this.currentSource) params.type = this.currentSource;

                const url = `/api/healthmaster/task/dataByType`;
                this.$http.get(url, params).then((res) => {
                    let data = res.data;
                    if (data.status === 1) {
						if (data.hasOwnProperty('data')) {
							let list = data.data;
							if (list.hasOwnProperty('counter')) {
								let counter = list.counter;
								let counterArr = [];
								for (let i in counter) {
									counterArr.push({name: i, value: counter[i]});
								}
								self.typeList = counterArr;
								if (self.firstLoadList) {
									self.firstLoadList = false
									this.getInitSourceList()
								}
								if (counterArr.length) self.setDomHeight();
							}
						}
                    } else {
						this.noData = true
						this.errorTip = '加载失败，请稍后重试！'
					}
                }, error => {
					this.noNet = true
					this.errorTip = '无法连接网络，请检查你的网络设置!'
				})
            },
            selectSource(item) {
                let _this = this
                if (item.hasOwnProperty('name')) {
                    if (_this.currentSource === item.name) {
                        _this.currentSource = '';
                    } else {
                        _this.currentSource = item.name
                    }
                }
				_this.dataList = []
                _this.pageInfo.page = 1
                _this.getInitSourceList();
            },
            /**
             * 获取对应信源列表-初始化
             */
            getInitSourceList() {
                let _self = this;
				_self.noData = false
				_self.noNet = false
				_self.errorTip = ''
				wx.showLoading({title: '玩命加载中'});
				uni.showNavigationBarLoading();
				netWork(function(res) {
					if (res) {
						_self.loadingType = 0;
						_self.dataList = [];
						const params = {
						    isVip: _self.$store.getters.userInfo.userType,
						    realId: _self.realId,
						    page: 1,
						    size: _self.pageInfo.size
						};
						if (_self.currentSource) params.type = _self.currentSource;
						
						const url = `/api/healthmaster/task/dataByType`;
						_self.$http.get(url, params).then((res) => {
						    let data = res.data;
							wx.hideLoading();
						    if (data.status === 1) {
								if (data.hasOwnProperty('data')) {
									let list = data.data;
									if (list.hasOwnProperty('theDatas')) {
										_self.dataList = list.theDatas;
										if (list.theDatas.length < _self.pageInfo.size) {
											_self.loadingType = 2
										} else {
											_self.pageInfo.page++;
										}
										// if (Array.isArray(_self.dataList) && _self.dataList.length === 0) {
										// 	_self.noData = true
										// 	_self.errorTip = '加载失败，请稍后重试！'
										// }
									} else {
										_self.loadingType = 2
									}
									uni.stopPullDownRefresh();
								} else {
									_self.loadingType = 2
								}
						    } else {
						        _self.loadingType = 2
						    }
							uni.hideNavigationBarLoading();
						}, error => {
							wx.hideLoading();
							uni.hideNavigationBarLoading();
							_self.noData = true;
							_self.errorTip = '加载失败，请稍后重试！'
						})
					} else {
						wx.hideLoading();
						uni.hideNavigationBarLoading();
						_self.noNet = true;
						_self.errorTip = '无法连接网络，请检查你的网络设置！'
					}
				})
				
            },
            /**
             * 加载更多
             */
            getMoreSourceList() {
				let _self = this
                if (_self.loadingType !== 0) {  //loadingType!=0;直接返回
                	return false
                }
                _self.loadingType = 1
                uni.showNavigationBarLoading()  //显示加载动画
                const params = {
                    isVip: _self.$store.getters.userInfo.userType,
                    realId: _self.realId,
                    page: _self.pageInfo.page,
                    size: _self.pageInfo.size
                };
                if (_self.currentSource) params.type = _self.currentSource;
                const url = `/api/healthmaster/task/dataByType`;
                _self.$http.get(url, params).then((res) => {
                    let data = res.data;
                    if (data.status === 1) {
                        let list = data.data;
						if (list.hasOwnProperty('theDatas')) {
							if (!list.theDatas.length) {
								_self.loadingType = 2
								uni.hideNavigationBarLoading()//关闭加载动画
								return
							}
							_self.pageInfo.page++  //每触底一次 page +1
							_self.dataList = _self.dataList.concat(list.theDatas);  //将数据拼接在一起
							_self.loadingType = 0  //将loadingType归0重置
							uni.hideNavigationBarLoading()  //关闭加载动画
							uni.stopPullDownRefresh();  //得到数据后停止下拉刷新
						} else {
							_self.loadingType = 2;
							uni.hideNavigationBarLoading();
						}
					} else {
						_self.loadingType = 3;
						uni.hideNavigationBarLoading();
					}
                }, error => {
					_self.loadingType = 3;
					uni.hideNavigationBarLoading();
				})
            },
            /**
             * 对象数组排序
             * @param property
             */
            compare(property) {
                return function (a, b) {
                    let value1 = a[property];
                    let value2 = b[property];
                    return value1 - value2;
                }
            },
            /**
             * 跳转报告页面
             * @param userId
             * @param realId
             */
            electDataByIdRequest(userId, realId) {
                let params = {
                    userId: userId,
                    realId: realId
                };
                let url = "/api/healthmaster/task/getLast";
                this.$http.get(url, params).then((res) => {
                    let data = res.data;
                    if (data.status === 1) {
                        if (data.data.hasOwnProperty('isUpdate') && data.data.hasOwnProperty('resultType') && data.data.hasOwnProperty('userRealId')) {
                            let isUpdate = data.data.isUpdate;
                            let resultType = data.data.resultType;
                            let userRealId = data.data.userRealId;
                            clearInterval(this.timer);
                            clearInterval(this.fakeTimer);
                            const url = '../myReport/index?isUpdate=' + isUpdate + "&resultType=" + resultType + "&realId=" + userRealId;
                            uni.redirectTo({ url })
                        } else if (data.hasOwnProperty('data') && JSON.stringify(data.data) === "{}") {
                            clearInterval(this.timer);
                            clearInterval(this.fakeTimer);
                            this.toggleInfo = { changeModel: true, index: 2, isModel: true, val: '本次测试结果获取失败！', title: "提示" };
                        } else {
                            clearInterval(this.timer);
                            clearInterval(this.fakeTimer);
                            this.toggleInfo = { changeModel: true, index: 2, isModel: true, val: '本次测试结果获取失败！', title: "提示" };
                        }
                    }
                })
            },
            /**
             * 重测
             */
            resSearch() {
                if (this.profession) {
                    if (this.profession.split(" ").length > 1) {
                        let params = {
                            keyWords: this.profession,
                            userId: this.$store.getters.userInfo.client_id,
                            retest: this.realId,
                            isVip: this.$store.getters.userInfo.userType
                        };
                        let url = `/api/healthmaster/search`;
                        const self = this;
                        self.$http.get(url, params).then(function(res) {
                            wx.hideLoading();
                            if (res.data.status === 1) {
                                let data = res.data.data;
                                if (data.hasOwnProperty('date') && data.date > 0) {
                                    self.userId = data.userId ? data.userId : this.$store.getters.userInfo.client_id;
                                    self.realId = data.id;
                                    self.errorState = false;
                                    self.indexProgressRequest();
                                    self.setTimer();
                                } else if (data.hasOwnProperty('canTest') && !data.canTest && res.data.message === '超过测试次数限制') {
                                    self.globalData.searchTxt = "";
                                    self.searchTxt = "";
                                    self.toggleInfo = {
                                        changeModel: true,
                                        index: 3,
                                        isModel: true,
                                        val: '体验测试次数已用完，可通过小米、华为、OPPO、百度应用商店、腾讯应用宝下载云测APP享受更多次数。',
                                        title: "很抱歉"
                                    };
                                } else if (data.hasOwnProperty('canTest') && !data.canTest) {
                                    self.globalData.searchTxt = "";
                                    self.searchTxt = "";
                                    self.toggleInfo = {changeModel: true, index: 3, isModel: true, val: res.data.message, title: "提示"};
                                } else if (data.date === -1) {
                                    self.globalData.searchTxt = "";
                                    self.searchTxt = "";
                                    self.TestProRealId = data.proRealId;
                                    self.TestKeywords = data.keyWords;
                                    self.toggleInfo = {changeModel: true, index: 1, isModel: true, val: res.data.message, title: "提示"};
                                } else {
                                    // self.toggleInfo = { changeModel: true, isModel: true, val: res.data.message, title: "警告" }
                                }
                            } else {
                                self.globalData.searchTxt = "";
                                self.searchTxt = "";
                                wx.showToast({ title: '系统繁忙', icon: 'none', duration: 10000 });
                                setTimeout(function() {wx.hideToast()}, 2000)
                            }
                        })
                    }
                }
            },
            toggleTagTest(boolObj) {
                if(boolObj.state && boolObj.key === 2) {
                    if (this.errorState) {
                        this.resSearch();
                    } else {
                        const url = '../index/main';
                        if (mpvuePlatform === 'wx') {
                            mpvue.reLaunch({ url })
                        }
                    }
                } else if (boolObj.state && boolObj.key === 4) {};

                if (!boolObj.state && boolObj.key === 2) {
                    if (this.errorState) {
                        const url = '../history/main';
                        if (mpvuePlatform === 'wx') {
                            mpvue.navigateBack({ url })
                        }
                    } else {
                        const url = '../index/main';
                        if (mpvuePlatform === 'wx') {
                            mpvue.reLaunch({ url })
                        }
                    };
                };
            },
			eventDetailClick(event) {
				console.log(event)
			    const url = '../eventDetail/index?eventWords=' + event.eventWords + '&newIds=' + event.newIds + '&realId=' + this.realId + "&event=" + event.eventTitle + "&id=" + event.id + "&ids=" + event.ids + "&resultType=" + this.resultType;
			    uni.navigateTo({ url })
			},
            randomFrom(lowerValue, upperValue) {
                return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
            },
			// 点击开通VIP打开提示
			toogleVipTip() {
				this.toggleInfo = {changeModel: true, index: 3, isModel: true, val: '请通过小米、华为、OPPO、百度应用商店、腾讯应用宝下载云测APP查看更多数据。', title: "提示"};
			},
			/**
			 * 关闭弹窗
			 * @param boolObj
			 */
			toggleTagTest(boolObj) {
			    if (boolObj.state && boolObj.key === 3) {
			        this.toggleInfo.changeModel = !boolObj.state;
			        this.toggleInfo.isModel = !boolObj.state;
			    } else {
			        this.toggleInfo.changeModel = boolObj.state;
			        this.toggleInfo.isModel = boolObj.state;
			    }
			},
			scrollFn(e) {
			    if (e.target.scrollTop < this.scrollTop) {
			        this.timer = setTimeout(() => {
			            this.refreshRequest();
			        }, 350)
			    }
				
			    let sh = e.target.scrollHeight;
			    let st = e.target.scrollTop;
			    let ch = Number(this.currentHeight.slice(8).replace('px', ''));
				
			    if (parseInt(st + ch) === sh || Math.ceil(st + ch) === sh || (st + ch) / sh >= 0.92) {
				  this.getMoreSourceList();
			    }
			}
        }
    }
</script>

<style lang="less" scoped>
    .custom-blue {
        background: #1E82D2 !important;
        color: #fff !important;
    }
    .history_icon {
        width: 38rpx;
        height: 36rpx;
        margin-left: 24rpx;
        display: block;
        background: url("../../static/imgs/testing/history.png") no-repeat;
        background-size: 100% 100%;
    }
    .wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        margin-top: -2rpx;
        background-color: #f5f5f5;
        .header-wrapper {
            width: 100%;
            height: 204rpx;
            background: #1E82D2;
            .header {
                height: 140rpx;
                padding: 20rpx 68rpx;
                display: flex;
                flex-direction: row;
                line-height: 100rpx;
                & image {
                    width: 100rpx;
                    height: 100%;
                }
                & span {
                    margin-left: 16rpx;
                    margin-right: 6rpx;
                    font-size: 32rpx;
                    color: #fff;
                }
            }
            .progress {
                height: 44rpx;
                padding: 0 50rpx;
                .cu-progress {
                    background: rgba(238,238,238,0.2) !important;
                    position: relative;
                    .progress-desc {
                        position: absolute;
                        width: 100%;
                        left: 0;
                        top: 0;
                        text-align: center;
                        background: unset;
                    }
                }
                .bg-blue {
                    background-color: unset;
                }
            }
        }
        .custom-loading {
            position: absolute;
            width: 378rpx;
            top: 60%;
            left: 50%;
            transform: translate(-50%, 60%);
            text-align: center;
            & img {
                width: 100%;
            }
            .loading {
                font-size: 30rpx;
                color: #333;
                margin-top: 25rpx;
            }
        }
        .type-wrapper {
            padding: 16rpx 22rpx;
            .type-list {
                padding: 10px 9px;
                background-color: rgba(30,130,210,0.05);
                display: flex;
                flex-flow: row wrap;
                .type-item {
                    width: 25%;
                    text-align: center;
                    .circle {
                        width: 110rpx;
                        height: 110rpx;
                        border: 6rpx solid #1E82D2;
                        border-radius: 50%;
                        margin: 10rpx auto;
                        & span {
                            font-size: 26rpx;
                            color: #666;
							display: block;
							width: 90rpx;
							height: 80rpx;
							margin: 12rpx auto;
							display: flex;
							flex-flow: row wrap;
							justify-content: center;
							align-items: center;
                        }
                    }
					.circle.active {
						background: rgba(30,130,210,0.2);
					}
					& span {
                        font-size: 24rpx;
                        color: #333;
                        margin-top: 4rpx;
                    }
                }
            }
        }
        .list-wrapper {
            padding: 0 22rpx 16rpx 22rpx;
            overflow: auto;
            .list-item {
                width: 100%;
                background-color: #fff;
                border-radius: 10rpx;
                margin-bottom: 29rpx;
                padding: 28rpx 34rpx;
                .title {
                    width: 100%;
                    color: #333;
                    font-size: 28rpx;
                    font-weight: 400;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
                .desc {
                    margin-top: 21rpx;
                    font-size: 24rpx;
                    color: #808080;
                    display: flex;
                    justify-content: space-between;
                    line-height: 35rpx;
                    & span:first-child {
                        display: block;
                        width: 50%;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
            }
            .list-item:last-child {
                margin-bottom: 0;
            }
            .vip-tip {
                margin: 14rpx auto;
                text-align: center;
                & a {
                    color: #1E82D2;
                }
                & a:hover {
                    color: #1E82D2;
                }
                & a:active {
                    color: #1E82D2;
                }
            }
        }
    }
</style>
