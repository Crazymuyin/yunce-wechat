<template name="history">
    <view class="history-box">
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="backText">返回</block>
            <block slot="content">历史测评</block>
        </cu-custom>
        <scroll-view class="historyClass" :style="historyBoxHeight" :scroll-y="true" @scrolltolower="getMoreHistory()">
            <view class="item-list" v-if="!noData && !noNet">
                <view class="item" v-for="(list, index) of historyArr" :key="index">
                    <span class="data-update" v-if="list.isUpdate === 1">有更新</span>
                    <view class="title-dateTime">
                        <view class="title">{{index + 1 + '.' + list.searchKeys}}</view>
                        <view class="dateTime">{{list.dateTime}}</view>
                    </view>
                    <view class="progress-btnList">
						<!-- grayBg -->
                        <view class="progress-parent">
                            <view class="cu-progress round sm striped progress" :class="{active: list.num > 0 && list.num < 100}" v-if="(list.num === 100 && list.score !== -1) || (list.num > 0 && list.num < 100)">
                                <view class="bg-blue" :style="[{ width: '100%'}]" v-if="list.num === 100 && list.score !== -1">
                                    {{list.noVipScore ? list.noVipScore : list.vipScore[0]}}
                                </view>
                                <view class="bg-blue" :style="[{ width: percent+'%'}]" v-if="list.num > 0 && list.num < 100">
                                    {{percent+'%'}}
                                </view>
                            </view>
                            <view class="cu-progress round sm striped progress" v-if="list.score === -1">
                                <view class="bg-blue" :style="[{ width: '100%'}]">
                                    数据获取失败!
                                </view>
                            </view>
                        </view>
                        <view class="tools">
                            <span :class="{'view': list.score > 0 || list.score !== -1 || list.createDate, 'gray': list.score === -1}" @click="electDataByIdRequest(list)">查看</span>
                            <span :class="list.score === -1 || (list.num === 100 && list.createDate + 3600000 < list.currentTime) ? 'reset' : 'gray'" @click="resetTest(list)">重测</span>
                            <span :class="list.num === 100 ? 'delete' : 'gray'" @click="deleteTask(list.id, list.num)">删除</span>
                        </view>
                    </view>
                    <view v-if="!list.noVipScore && list.score !== -1" class="vipScore">
                        <ul class="clearfix">
                            <li v-for="(item, key) of list.vipScore[1]" :key="key">
                                <span></span>{{item}}
                            </li>
                        </ul>
                    </view>
                </view>
				<uni-load-more  :loadingType="loadingType" :contentText="contentText" ></uni-load-more>
			</view>
			<no-data :noData="noData" :noNet="noNet" :noList="noList" :errorTip="errorTip" @refreshRequest="getHistoryList"></no-data>
            <toggle :toggle-info="toggleInfo" @toggleTag="toggleTagTest"></toggle>
        </scroll-view>
    </view>
</template>

<script>
import {formatDate} from '../../utils/formatDate'
import Toggle from '../../components/toggle'
import uniLoadMore from '../../components/uni-load-more.vue'
import noData from '../../components/noData.vue'
import netWork from '../../common/checkNet.js'

export default {
	name: "index",
	data() {
		return {
			historyBoxHeight: `height: ${wx.getSystemInfoSync().windowHeight - this.CustomBar}px`,
			noData: false,
			noNet: false,
			noList: false,
			errorTip: '',
			timer: null,
			percent: '',
			testing: false,
			realWidth: 'width: 0%',
			page: 1,
			pageSize: 8,
			historyArr: [],
			toggleInfo: {
				changeModel: false,
				isModel: false,
				index: '',
				val: "",
			},
			loadingType: 0, //定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
			contentText: {
				contentdown:'上拉显示更多',
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				contentError: '加载失败'
			}
		}
	},
	components: {
		Toggle,
		uniLoadMore,
		noData
	},
	onReady() {
	},
	onLoad() {
		clearInterval(this.timer);
		this.page = 1;
		this.testing = false;
		this.timer = null;
		this.goTop();
		this.getHistoryList();
	},
	onHide() {
		clearInterval(this.timer);
	},
	onUnload() {
		clearInterval(this.timer);
		this.timer = null;
		this.testing = false;
		this.page = 1;
		this.historyArr = [];
	},
	onShow() {		
		this.timer = null;
		this.testing = false;
	},
	onPullDownRefresh() {
		clearInterval(this.timer);
		this.timer = null;
		this.testing = false;
		this.page = 1;
		this.historyArr = [];
		this.getHistoryList();
	},
	methods: {
		setTimer() {
			this.timer = setInterval(() => {
				this.indexProgressRequest();
			}, 5000)
		},
		getHistoryList(keys) {
			let _self = this			
			_self.noData = false
			_self.noNet = false
			_self.noList = false
			_self.errorTip = ''
			netWork(function(res) {
				if (res) {
					_self.loadingType = 1;
					_self.contentText.contentdown = '';
					uni.showNavigationBarLoading();
					let url = `/api/healthmaster/task/search/history`;
					let params = {
						page: 1,
						pageSize: _self.pageSize,
						userId: _self.$store.getters.userInfo.client_id,
						isVip: _self.$store.getters.userInfo.userType
					};
					if (keys) params.keys = keys;
					_self.$http.get(url, params).then(res => {
						let data = res.data;
						if (data.hasOwnProperty("status") && data.status === 1) {
							data.data.forEach((item, index) => {
								if(Number(item.score) === -1) {
									item.dateTime = _self.formatDateTime(item.createDate);
									item.currentTime = new Date().getTime();
									item.score = Number(item.score)
								} else {
									let scoreArr = item.score.split(",");
									scoreArr = _self.unique(scoreArr);
									let minMonth = scoreArr[0].split(":");
									let minNum = minMonth[1];
									let minIndex = 0;
									scoreArr.forEach((item, index) => {
										let sArr = item.split(":");
										if (minNum > sArr[1]) {
											minNum = sArr[1];
											minIndex = index;
										}
									});
									if (_self.$store.getters.userInfo.userType) {
										item.noVipScore = '';
									} else {
										item.noVipScore = scoreArr[0] + "分";
									};
									item.vipScore = [scoreArr[minIndex]+"分"];
									delete scoreArr[minIndex];
									let newScore = [];
									scoreArr.forEach(item => {
										let sArr = item.split(":");
										newScore.push(sArr[0]+":"+sArr[1]+"分");
									});
									item.vipScore.push(newScore);
									item.dateTime = _self.formatDateTime(item.createDate);
									item.currentTime = new Date().getTime();
									if (_self.page !== 1) _self.historyArr.push(item);
									if (index === 0 && item.num > -1 && item.num < 100) {
										_self.testing = true;
										_self.indexProgressRequest();
										_self.setTimer();
									};
								}
							});
							_self.historyArr = data.data;
							if (_self.historyArr.length && _self.historyArr.length < _self.pageSize) {
								_self.loadingType = 2
							} else {
								_self.loadingType = 0
								_self.page++;
							}
							uni.hideNavigationBarLoading();
							uni.stopPullDownRefresh();  //得到数据后停止下拉刷新
							if (Array.isArray(_self.historyArr) && _self.historyArr.length === 0) {
								_self.noList = true
								_self.errorTip = '暂无历史记录！'
							}
						} else {
							_self.loadingType = 0
							_self.noData = true
							_self.errorTip = '加载失败，请稍后重试！'
						}
					}, error => {
						_self.loadingType = 0
						_self.noData = true
						_self.errorTip = '加载失败，请稍后重试！'
					})
				} else {
					_self.loadingType = 0
					_self.noNet = true
					_self.errorTip = '无法连接网络，请检查你的网络设置！'
				}
			})			
		},
		getMoreHistory(keys) {
			if (this.loadingType !== 0) {  //loadingType!=0;直接返回
				return false
			};
			this.loadingType = 1;
			uni.showNavigationBarLoading();  //显示加载动画
			let url = `/api/healthmaster/task/search/history`;
			let params = {
				page: this.page,
				pageSize: this.pageSize,
				userId: this.$store.getters.userInfo.client_id,
				isVip: this.$store.getters.userInfo.userType
			};
			if (keys) params.keys = keys;
			this.$http.get(url, params).then(res => {
				wx.hideLoading();
				let data = res.data;
				if (data.hasOwnProperty("status") && data.status === 1) {
					data.data.forEach((item, index) => {
						let scoreArr = item.score.split(",");
						scoreArr = this.unique(scoreArr);
						let minMonth = scoreArr[0].split(":");
						let minNum = minMonth[1];
						let minIndex = 0;
						scoreArr.forEach((item, index) => {
							let sArr = item.split(":");
							if (minNum > sArr[1]) {
								minNum = sArr[1];
								minIndex = index;
							}
						});
						if (this.$store.getters.userInfo.userType) {
							item.noVipScore = '';
						} else {
							item.noVipScore = scoreArr[0] + "分";
						};
						item.vipScore = [scoreArr[minIndex]+"分"];
						delete scoreArr[minIndex];
						let newScore = [];
						scoreArr.forEach(item => {
							let sArr = item.split(":");
							newScore.push(sArr[0]+":"+sArr[1]+"分");
						});
						item.vipScore.push(newScore);
						item.dateTime = this.formatDateTime(item.createDate);
						item.currentTime = new Date().getTime();
						this.historyArr.push(item);
						if (index === 0 && item.num > -1 && item.num < 100) {
							this.testing = true;
							this.indexProgressRequest();
							this.setTimer();
						}
					});
					if (data.data.length < this.pageSize) {
						this.loadingType = 2
					} else {
						this.page++;
						this.loadingType = 0;
					}
					uni.hideNavigationBarLoading();
					uni.stopPullDownRefresh();  //得到数据后停止下拉刷新
					// if (Array.isArray(this.historyArr) && this.historyArr.length === 0) {
					// 	this.noData = true
					// 	this.errorTip = '加载失败，请稍后重试！'
					// }
				} else if (data.hasOwnProperty("status") && data.status === 2) {
					this.loadingType = 3
					uni.hideNavigationBarLoading()//关闭加载动画
				} else {
					this.loadingType = 3
					uni.hideNavigationBarLoading()//关闭加载动画
				}
			}, error => {
				wx.hideLoading();
				this.loadingType = 3
				uni.hideNavigationBarLoading()//关闭加载动画
			})
		},
		indexProgressRequest() {
			const params = {
				userId: this.userId ? this.userId : this.$store.getters.userInfo.client_id
			};
			const url = `/api/healthmaster/task/indexProgress`;
			this.$http.get(url, params).then((res) => {
				let data = res.data;
				if (data.status === 1) {
					this.percent = data.data.proScore;
					if (data.data.proScore === 100) {
						clearInterval(this.timer);
						this.testing = false;
						this.page = 1;
						// this.historyArr = [];
						this.getHistoryList();
					};
					if (data.data.proScore < 50) {
						this.realWidth = `width:${data.data.proScore * 0.98}%; color: #000`
					} else {
						this.realWidth = `width:${data.data.proScore * 0.98}%`
					}
				}
			})
		},
		/**
		 * 查看详细
		 * @params list
		 */
		electDataByIdRequest(list) {
			let _self = this
			if (Number(list.num) == 100 && list.score !== -1) {
				let realId = list.proRealId;

				this.globalData.searchTxt = list.searchKeys;
				let currentType = list.vipScore[0];
				const url = '../myReport/index?isUpdate=' + list.isUpdate + "&realId=" + realId + "&current=" + currentType.split(":")[0];
				clearInterval(this.timer);
				uni.navigateTo({ url });
				if (list.isUpdate) list.isUpdate = 0
			} else {
				let userId = _self.$store.getters.userInfo.client_id;
				let id = list.proRealId;
				let searchTxt = list.searchKeys;
				let url;
				if (list.score !== -1) {
					url = '../testing/index?first=false&userId=' + userId + "&realId=" + id + "&keywords=" + searchTxt;
				}
				clearInterval(this.timer);
				uni.navigateTo({ url })
			}
		},
		deleteTask(id, num) {
			if (num === 100) {
				wx.showLoading({ title: "删除中" });
				let url = '/api/healthmaster/task/search/delete';
				let params = {
					userId: this.$store.getters.userInfo.client_id,
					isVip: this.$store.getters.userInfo.userType,
					id: id
				};
				this.$http.delete(url, params).then(res => {
					if (res.data.status === 1) {
						wx.hideLoading();
						if (Array.isArray(this.historyArr) && this.historyArr.length) {
							if (this.historyArr.length < 9) {
								clearInterval(this.timer);
								this.page = 1;
								// this.historyArr = [];
								this.getHistoryList();
							} else {
								this.historyArr.forEach((item, index) => {
									if (item.id === id) {
										this.historyArr.splice(index, 1);
									};
								});
							}
						}
						wx.showToast({ title: res.data.message, icon: 'none', duration: 1000 });
					} else {
						wx.showToast({ title: res.data.message, icon: 'none', duration: 1000 });
					}
				}, error => {
					wx.hideLoading()
					wx.showToast({ title: '删除失败，请稍后重试！', icon: 'none', duration: 1000 });
				})
			}
		},
		resetTest(list) {
			if (list.score === -1 || (list.num === 100 && (list.createDate + 3600000 < list.currentTime))) {
				if (!this.testing) {
					let _self = this
					let params = {
						keyWords: list.searchKeys,
						retest: list.id,
						userId: this.$store.getters.userInfo.client_id,
						isVip: this.$store.getters.userInfo.userType
					};
					let url = `/api/healthmaster/search`;
					const self = this;
					self.$http.get(url, params).then(function(res) {
						if (res.data.status === 1) {
							let data = res.data.data;
							if (data.hasOwnProperty('date') && data.date > 0) {
								let id = data.id;
								let userId = data.userId;
								const url = '../testing/index?first=false&userId=' + userId + "&realId=" + id + "&keywords=" + list.searchKeys;
								
								_self.timer = null;
								_self.testing = false;
								_self.page = 1;
								_self.historyArr = [];
								_self.getHistoryList();
									
								clearInterval(self.timer);
								uni.navigateTo({ url })
							} else if (data.hasOwnProperty('canTest') && !data.canTest && res.data.message === '超过测试次数限制') {
								clearInterval(self.timer);
								self.toggleInfo = {
									changeModel: true,
									index: 3,
									isModel: true,
									val: '体验测试次数已用完，可通过小米、华为、OPPO、百度应用商店、腾讯应用宝下载云测APP享受更多次数。',
									title: "很抱歉"
								};
							} else if (data.hasOwnProperty('canTest') && !data.canTest) {
								clearInterval(self.timer);
								self.toggleInfo = {changeModel: true, index: 3, isModel: true, val: res.data.message, title: "提示"};
							} else if (data.date === -1) {
								clearInterval(self.timer);
								self.TestProRealId = data.proRealId;
								self.TestKeywords = data.keyWords;
								self.toggleInfo = {changeModel: true, index: 1, isModel: true, val: res.data.message, title: "提示"};
							}
						} else {
							wx.showToast({ title: '系统繁忙', icon: 'none', duration: 10000 });
							setTimeout(function() {wx.hideToast()}, 2000)
						}
					})
				} else if (this.testing) {
					wx.showToast({ title: '已有测试任务正在测试中', icon: 'none', duration: 1000 });
				}
			}
		},
		toggleTagTest(boolObj) {
			if(boolObj.state && boolObj.key === 1) {
				const url = '../testing/index?first=false&userId='+this.$store.getters.userInfo.client_id+'&realId=' + this.TestProRealId + "&keywords=" + this.TestKeywords;
				// #ifdef H5
					uni.navigateTo({ url })
				// #endif
				// #ifdef MP-WEIXIN
					uni.navigateTo({ url })
				// #endif
			} else if (boolObj.state && boolObj.key === 3) {
                this.toggleInfo.changeModel = !boolObj.state;
                this.toggleInfo.isModel = !boolObj.state;
			} else if (boolObj.state && boolObj.key === 4) {} else {
                this.toggleInfo.changeModel = boolObj.state;
                this.toggleInfo.isModel = boolObj.state;
            };
		},
		formatDateTime(time) {
			let date = new Date(time);
			return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
		},
		/**
		 * 回到顶部
		 * @param e
		 */
		goTop: function (e) {
			if (wx.pageScrollTo) {
				wx.pageScrollTo({
					scrollTop: 0
				})
			}
		},
		/**
		 * 去掉重复选取的数据
		 * @param list
		 * @returns {*}
		 */
		unique(list){
			for (var i = 0; i < list.length; i++) {
				for (var j =i+1; j <list.length; ) {
					if (list[i] === list[j] ) {
						list.splice(j, 1);
					}else {
						j++;
					}
				}
			}
			return list;
		}
	}
}
</script>

<style scoped lang="less">
    .historyClass {
        width: 100%;
        // height: auto;
        background-color: #f5f5f5;
        .item-list {
            width: 100%;
            height: 100%;
            background-color: #f5f5f5;
            padding-top: 20rpx;
            .item {
                position: relative;
                width: auto;
                height: auto;
                background: white;
                border-radius: 10rpx ;
                margin: 20rpx;
                padding: 20rpx;
                .data-update {
                    position: absolute;
                    top: -12rpx;
                    right: -10rpx;
                    font-size: 18rpx;
                    background: red;
                    color: white;
                    padding: 5rpx 10rpx;
                    border-radius: 5rpx;
                }
                .title-dateTime {
                    display: flex;
                    font-size: 27rpx;
                    justify-content: space-between;
                    align-items: center;
                    .title {
                        width: 60%;
                    }
                    .dateTime {
                        width: 40%;
                        color: #808080;
                        font-size: 26rpx;
                    }
                }
                .progress-btnList {
                    display: flex;
                    font-size: 14px;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 25rpx;
                    .progress-parent {
                        position: relative;
                        width: 50%;
                        /*width: 273rpx;*/
                        height: 48rpx;
                        /*border: 2rpx solid #1E82D2;*/
                        border-radius: 24rpx;
						.bg-blue {
							background-color: rgba(30, 130, 210);
						}
                        .progress {
                            height: 25rpx;
                        }
                        .progress-value {
                            width: auto;
                            height: 41rpx;
                            line-height: 41rpx;
                            text-align: center;
                            color: white;
                            background: #1E82D2;
                            border-radius: 19rpx;
                            margin: 5rpx;
                            font-size: 24rpx;
                        }
                        .progress-text {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            z-index: 100;
                        }
                    }
                    .grayBg {
                        border: 2rpx solid #999999;
                        .progress-value {
                            background-color: #999999;
                            color: white;
                        }
                        .progress-text {
                            color: white !important;
                        }
                    }
                    .tools {
                        width: 35%;
                        margin-right: 30rpx;
                        display: flex;
                        justify-content: space-between;
                        font-size: 30rpx;
                        .view {
                            color: #05d522;
                        }
                        .reset {
                            color: #fbbd08;
                        }
                        .delete {
                            color: red;
                        }
                        .gray {
                            color: gray;
                        }
                    }
                }
                .vipScore {
                    width: 50%;
                    height: 30rpx;
                    color: #1E82D2;
                    font-size: 24rpx;
                    text-align: center;
                    padding-top: 5rpx;
                    & ul {
                        width: auto;
                        height: 100%;
                        display: flex;
                        justify-content: space-around;
                        & li {
                            list-style-type: disc;
                            float: left;
                            & span {
                                display: inline-block;
                                width: 15rpx;
                                height: 15rpx;
                                border-radius: 50%;
                                background: #1E82D2;
                                margin-right: 10rpx;
                                margin-bottom: 3rpx;
                            }
                        }
                    }
                }
            }
            .item:first-child {
                margin-top: 0;
            }
        }
        .tooltip {
            display: flex;
            width: 100%;
            height: 100%;
            justify-content: center;
            align-items: center;
            flex-flow: column nowrap;
            font-size: 14px;
            color: #999999;
            .noData {
                width: 188rpx;
                height: 257rpx;
            }
            .netError {
                width: 166rpx;
                height: 215rpx;
            }
            & span {
                margin-top: 20rpx;
                margin-bottom: 50rpx;
            }
            & button {
                width: 190rpx;
                height: 61rpx;
                font-size: 14px;
                text-align: center;
                line-height: 61rpx;
                color: white;
                background: #1e82d2;
                border-radius: 10rpx;
            }
        }
    }
</style>
