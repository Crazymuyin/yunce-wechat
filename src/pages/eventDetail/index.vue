<template name="eventDetail">
    <view>
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="content">事件详情</block>
        </cu-custom>
        <scroll-view class="wrapper" scroll-y="true" :style="currentHeight" v-if="!noData && !noNet">
            <view class="update-wrapper" v-if="newEvent > 0">
                <view class="white-bg">
                    <span>事件有{{newEvent}}条数据更新</span>
                </view>
            </view>
            <view class="title-wrapper">
                <view class="title">{{eventTitle}}</view>
                <i v-if="eventWords !== 'null'  && eventWords.length" class="eventTik" :class="'eventTik' + eventWords.length">{{eventWords}}</i>
            </view>
            <view class="resume-wrapper" v-if="eventSummary != null && eventSummary.length > 0 && eventSummary != 'null'">
                <view class="title">事件概要</view>
                <view class="resume">
                    {{eventSummary}}
                </view>
            </view>
            <view class="trend-wrapper">
                <view class="title-container">
                    <view class="title">舆情趋势&风险趋势</view>
                </view>
                <!-- <view class="tooltip" v-if="touched">
                    <span class="date">{{touchDate}}日</span>
                    <span class="danger">数量：{{touchNumber}}&nbsp;&nbsp;&nbsp;&nbsp;风险度：{{touchDanger}}%</span>
                </view> -->
                <view class="chart-wrapper">
					<!--#ifndef MP-ALIPAY -->
                    <canvas canvas-id="canvasLineA" id="canvasLineA" class="charts" @touchstart="touchLineA" @touchmove="moveLineA" @touchend="touchEndLineA"></canvas>
					<!-- #endif -->
				</view>
            </view>
            <view class="platform-wrapper">
                <view class="title-container">
                    <view class="title">
                        <span>平台分布</span>
                        <view class="btn-group">
                            <view :class="platType === 2 ? 'active' : ''" @click="platformChange(2)">全部</view>
                            <view></view>
                            <view :class="platType === 1 ? 'active' : ''" @click="platformChange(1)">负面</view>
                        </view>
                    </view>
                </view>
                <view class="chart-wrapper">
                    <canvas canvas-id="canvasPie" id="canvasPie" class="rose-charts" @touchstart="touchPie"></canvas>
                </view>
            </view>
            <view class="info-wrapper">
                <view class="title-head">
                    <span>相关信息</span>
                    <view class="btn-group">
                        <view :class="infoType === 2 ? 'active' : ''" @tap="infoChange(2)">时间</view>
                        <view></view>
                        <view :class="infoType === 0 ? 'active' : ''" @tap="infoChange(0)">风险度</view>
                    </view>
                </view>
                <scroll-view class="eventList" style="height: 400px;" :scroll-y="true" @scrolltolower="getMoreEvents()"
				 :scroll-top="scrollTop" @scroll="scrollFn">
                    <view class="eventItem" v-for="(list, index) of eventList" :key="index" @tap="eventDetailView(list)">
                        <view class="titleFire">
                            <span class="number">{{index + 1}}</span>
                            <span class="title">{{list.title}}</span>
                            <span v-if="list.warnLevel" :class="list.warnLevel === '红色' ?'warn-max' : list.warnLevel === '橙色' ? 'warn-middle' : list.warnLevel === '黄色' ? 'warn-min' : ''">
							</span>
                        </view>
                        <view class="sourceTime">
                            <span class="sourceName" v-if="list.sourceName">来源：{{list.sourceName ? list.sourceName : '匿名'}}</span>
                            <span class="dateTime">{{list.publishDate}}</span>
                        </view>
                    </view>
					<uni-load-more  :loadingType="loadingType" :contentText="contentText"></uni-load-more>
                </scroll-view>   
			</view>
        </scroll-view>
		<no-data :noData="noData" :noNet="noNet" :errorTip="errorTip" @refreshRequest="refresh"></no-data>
    </view>
</template>

<script>
import uCharts from '../../common/u-charts/u-charts.min'
import uniLoadMore from '../../components/uni-load-more.vue'
import noData from '../../components/noData.vue'
import netWork from '../../common/checkNet.js'
let lastMoveTime = null
let canvaLineA = null
let canvaPie = null
let _self
export default {
	name: "eventDetail",
	components: {
		uniLoadMore,
		noData
	},
	data() {
		return {
			eventTitle: '',
			eventWords: '',
			eventSummary: '',
			timer: null,
			platType: 2,
			infoType: 2,
			realId: '',
			id: '',
			ids: '',
			newIds: '',
			resultType: 1,
			newEvent: 0,
			eventList: [],
			page: 1,
			currentHeight: '',
			timer: null,
			LineA: {
				categories:[],
				series:[],
			},
			Pie: {
				series:[],
			},
			cWidth: '',
			cHeight: '',
			pixelRatio: 1,
			textarea: '',
			touched: false,
			touchDate: '',
			touchNumber: 0,
			touchDanger: '',
			loadingType: 0,//定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
			contentText: {
				contentdown:'上拉显示更多',
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				contentError: '加载失败'
			},
			noData: false,
			noNet: false,
			errorTip: '',
			scrollTop: -10
		}
	},
	onLoad(options) {
		_self = this;
		_self.id = options.id
		_self.ids = options.ids
		_self.newIds = options.newIds
		_self.realId = options.realId
		if (options.resultType && options.resultType !== null) _self.resultType = options.resultType
		if (options.event) _self.eventTitle = options.event
		if (options.eventWords) _self.eventWords = options.eventWords
		_self.cWidth=uni.upx2px(750)
		_self.cHeight=uni.upx2px(450)
		_self.getEventRequest()
		_self.getChartsData()
	},
	onReady() {
		// #ifdef H5
		let clientHeight =  document.body.clientHeight
		// #endif
		// #ifdef MP-WEIXIN
		let clientHeight =  wx.getSystemInfoSync().windowHeight
		// #endif
		let listWrapperHeight = clientHeight - this.CustomBar
		this.currentHeight = `height: ${listWrapperHeight}px`
	},
	onUnload() {
		this.evenTitle = ""
		this.eventWords = ''
		this.eventList = []
		this.LineA.categories = []
		this.LineA.series = [] 
		this.Pie.series = []
	},
	onPullDownRefresh() {
		//下拉刷新的时候请求一次数据
		this.getEventRequest()
		this.getChartsData()
	},
	methods: {
		refresh() {
			this.getEventRequest()
			this.getChartsData()
		},
		// 获取信息列表第一页数据
		getEventRequest() {
			let _self = this
			_self.noData = false
			_self.noNet = false
			_self.errorTip = ''			
			_self.eventList = []
			_self.loadingType = 1
			uni.showNavigationBarLoading()
			netWork(function(res) {
				if(res) {
					let params = {
						ids: _self.ids,
						newIds: _self.newIds,
						page: 1,
						pageSize: 10,
						type: _self.infoType
					}
					let url = `/api/healthrisk/evaluateResult/getEventDetails`
					_self.$http.post(url, params).then(res => {
						let data = res.data
						if (data.status === 1) {
							if (Array.isArray(data.data) && data.data.length) {
								_self.eventList = data.data
								
								if (data.data.length < 10) {
									_self.loadingType = 2;
								} else {
									_self.page++
									_self.loadingType = 0
								}
								uni.stopPullDownRefresh()  //得到数据后停止下拉刷新
							} else {
								_self.loadingType = 2
							}
						} else {
							_self.loadingType = 0
							_self.noData = true
							_self.errorTip = '加载失败，请稍后重试！'
						}
						uni.hideNavigationBarLoading()
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
		
		// 获取信息列表后续数据
		getMoreEvents() {
			if (this.loadingType !== 0) {  //loadingType!=0;直接返回
				return false
			}
			this.loadingType = 1
			uni.showNavigationBarLoading()  //显示加载动画
			let params = {
				ids: this.ids,
				newIds: this.newIds,
				page: this.page,
				pageSize: 10,
				type: this.infoType
			}
			let url = `/api/healthrisk/evaluateResult/getEventDetails`
			this.$http.post(url, params).then(res => {
				let data = res.data
				if (data.status === 1) {
					if (!data.data.length) {
						this.loadingType = 2
						uni.hideNavigationBarLoading()//关闭加载动画
						return
					}
					this.page++  //每触底一次 page +1
					this.eventList = this.eventList.concat(data.data)  //将数据拼接在一起
					this.loadingType = 0  //将loadingType归0重置
					uni.hideNavigationBarLoading()  //关闭加载动画
					uni.stopPullDownRefresh();  //得到数据后停止下拉刷新
				} else {
					this.loadingType = 3
					uni.hideNavigationBarLoading() 
				}
			}, error => {
				this.loadingType = 3
				uni.hideNavigationBarLoading() 
			})
		},
		
		// 切换平台分布类型
		platformChange(id) {
			this.platType = id
			this.getPieData()
		},
		
		// 切换信息列表类型
		infoChange(id) {
			this.infoType = id
			this.page = 1
			this.getEventRequest()
		},
		
		// 获取统计数据
		getChartsData () {
			let _this = this
			_this.noData = false
			_this.noNet = false
			_this.errorTip = ''	
			wx.showLoading({title: '玩命加载中'})
			netWork(function(res) {
				if(res) {
					let params = {
						id: _this.id,
						realId: _this.realId
					}
					if (_this.resultType) params.resultType = _this.resultType
					let url = `/api/healthrisk/evaluateResult/v2/event/detail`
					_this.$http.post(url, params).then(res => {
						wx.hideLoading()
						let data = res.data
						if (data.status === 1) {
							_this.eventSummary = data.data.summary
							if (data.data.hasOwnProperty('newCount')) {
							    _this.newEvent = data.newCount;
							    setTimeout(function() {
							        _this.newEvent = 0;
							    }, 2000)
							}
							// 舆情趋势&风险趋势数据整理
							let line_risk = data.data.risks
							let line_number = data.data.nums
							let dateArr = []
							let riskArr = []
							let numArr = []
							let series = []
							
							if (line_risk.length) {
								line_risk.forEach(item => {
									dateArr.push(item.date)
									riskArr.push(item.num)
								})
								series.push({name: '风险度', data: riskArr, index: 1})
							}
							if (line_number.length) {
								line_number.forEach((item) => {
									dateArr.push(item.date)
									numArr.push(item.num)
								})
								series.push({name: '数量', data: numArr, index: 0})
							}
							let result = [...new Set(dateArr)]
							_self.LineA.categories = result.sort()
							_self.LineA.series = series
							// 平台分布数据整理
							let pie_all = data.data.allTypes
							let pie_neg = data.data.negTypes
							let allArr = []
							let negArr = []
							pie_all.forEach(item => {
								allArr.push({name: item.type, data: item.percent * 100})
							})
							pie_neg.forEach(item => {
								negArr.push({name: item.type, data: item.percent * 100})
							})
							_self.Pie.series.push(allArr,negArr)
							_self.getLineData()
							_self.getPieData()
						} else {
							_this.noData = true
							_this.errorTip = '加载失败，请稍后重试！'
						}
					}, error => {
						wx.hideLoading()
						_this.noData = true
						_this.errorTip = '加载失败，请稍后重试！'
					})
				} else {
					wx.hideLoading()
					_this.noNet = true
					_this.errorTip = '无法连接网络，请检查你的网络设置！'
				}
			})
		},
		
		// ucharts绘制折线图
		getLineData(){
			_self.showLineA("canvasLineA",_self.LineA)
		},
		showLineA(canvasId,chartData){
			let maxDefault = 5;
			let max = Math.max.apply(null, chartData.series[1].data);
			if (max > 5) maxDefault = max+5-(max%5);
			canvaLineA = new uCharts({
				$this: _self,
				canvasId: canvasId,
				type: 'line',
				colors:['#1E82D2', '#FCC756'],
				fontSize:11,
				padding:[15,15,0,15],
				legend:{
					show: true,
					padding:5,
					lineHeight:11,
					margin:0,
				},
				dataLabel: false,
				dataPointShape: true,
				background:'#FFFFFF',
				pixelRatio: _self.pixelRatio,
				categories: chartData.categories,
				series: chartData.series,
				animation: true,
				xAxis: {
					type: 'grid',
					disableGrid: true,
					gridColor:'#CCCCCC',
					dashLength:8,
					labelCount: 4,
				},
				yAxis: {
					data:[{
						calibration: true,
						position: 'left',
						title: '数量',
						min: 0,
						max: maxDefault,
						titleFontSize: 12
					}, {
						calibration: true,
						position: 'right',
						min: 0,
						max: 100,
						title: '风险度',
						titleFontSize:12,
						format: (val)=>{return val.toFixed(0)+'%'}
					}],
					showTitle:true,
					gridType: 'solid',
					disableGrid: true,
					gridColor: '#CCCCCC',
					dashLength: 8,
					title: '数量'
				},
				width: _self.cWidth * _self.pixelRatio,
				height: _self.cHeight * _self.pixelRatio,
				extra: {
					line:{
						type: 'straight'
					}
				}
			})
		},
		touchLineA(e) {
			//#ifndef H5
			e.changedTouches[0].y+=this.scrollTop;
			e.mp.changedTouches[0].y+=this.scrollTop;
			//#endif
			let currIndex = canvaLineA.getCurrentDataIndex(e)
			if(currIndex > -1 && currIndex < canvaLineA.opts.categories.length) {
				let date = canvaLineA.opts.categories[currIndex]
				let number = canvaLineA.opts.series[1].data[currIndex]
				let shuju = canvaLineA.opts.series[0].data[currIndex]
				_self.touchDate = date
				_self.touchNumber = number
				_self.touchDanger = shuju
			}
			canvaLineA.showToolTip(e, {
				format: function (item, category) {
					if(typeof item.data === 'object'){
						return category + ' ' + item.name + ':' + item.data.value 
					}else{
						return category + ' ' + item.name + ':' + item.data 
					}
				}
			});
			canvaLineA.touchLegend(e,{animation:true});
			lastMoveTime=Date.now()
			_self.touched = true
		},
		moveLineA(e){
			let currMoveTime = Date.now()
			let duration = currMoveTime - lastMoveTime
			if (duration < Math.floor(1000 / 60)) return//每秒60帧
			lastMoveTime = currMoveTime

			let currIndex = canvaLineA.getCurrentDataIndex(e)
			if(currIndex > -1 && currIndex < canvaLineA.opts.categories.length) {
				let date = canvaLineA.opts.categories[currIndex]
				let number = canvaLineA.opts.series[1].data[currIndex]
				let shuju = canvaLineA.opts.series[0].data[currIndex]
				_self.touchDate = date
				_self.touchNumber = number
				_self.touchDanger = shuju
			}
			canvaLineA.showToolTip(e, {
				format: function (item, category) {
					return category + ' ' + item.name + ':' + item.data
				}
			})
		},
		touchEndLineA(e){
			let currIndex=canvaLineA.getCurrentDataIndex(e)
			if(currIndex > -1 && currIndex < canvaLineA.opts.categories.length){
				let date=canvaLineA.opts.categories[currIndex]
				let number=canvaLineA.opts.series[1].data[currIndex]
				let shuju=canvaLineA.opts.series[0].data[currIndex]
				_self.touchDate = date
				_self.touchNumber = number
				_self.touchDanger = shuju
			}
			canvaLineA.touchLegend(e,{animation:true})
			canvaLineA.showToolTip(e, {
				format: function (item, category) {
					return category + ' ' + item.name + ':' + item.data
				}
			})
		},

		// ucharts绘制玫瑰图
		getPieData(){
			if(_self.platType === 2) {
				_self.showPie("canvasPie",_self.Pie.series[0])
			}
			if(_self.platType === 1) {
				_self.showPie("canvasPie",_self.Pie.series[1])
			}
		},
		showPie(canvasId,chartData){
			canvaPie = new uCharts({
				$this: _self,
				canvasId: canvasId,
				type: 'ring',
				fontSize: 11,
				padding: [15,15,0,15],
				legend: {
					show: true,
					padding: 5,
					lineHeight: 11,
					margin: 0,
				},
				background: '#FFFFFF',
				pixelRatio: _self.pixelRatio,
				series: chartData,
				animation: true,
				width: _self.cWidth * _self.pixelRatio,
				height: _self.cHeight * _self.pixelRatio,
				dataLabel: true,
				extra: {
					pie: {
						offsetAngle: -45,
						ringWidth: 35 * _self.pixelRatio,
						labelWidth: 15
					}
				},
			})
		},
		touchPie(e){
			canvaPie.showToolTip(e, {
				format: function (item) {
					return item.name + ':' + item.data / 100 + '%'
				}
			})
		},
		
		// 文章详情页
		eventDetailView(obj) {
		    const url = '../detailView/index?id=' + obj.id		       
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
			  this.getMoreEvents();
		    }
		}
	}
}
</script>

<style scoped lang="less">
    .custom-blue {
        background: #1E82D2 !important;
        color: #fff !important;
    }
    .wrapper {
        width: 100%;
        background-color: #F0F0F0;
        overflow: auto;
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
        .title-wrapper {
            position: relative;
            width: 100%;
            height: 128rpx;
            line-height: 120rpx;
            background-color: white;
            display: flex;
            flex-flow: row nowrap;
            justify-content: space-between;
            .title {
                width: 536rpx;
                display: flex;
                align-items: flex-start;
                justify-content: space-around;
                flex-direction: column;
                font-size: 28rpx;
                font-family: DroidSansFallback;
                color: #333333;
                line-height: 40rpx;
                padding: 22rpx 14rpx 22rpx 40rpx;
                font-weight: 500;
            }
            & i.eventTik {
                text-align: center;
                line-height: 57rpx;
                color: white;
                font-size: 26rpx;
                font-weight: bold;
                display: block;
                font-family: DroidSansFallback;
                position: absolute;
                top: 50%;
                right: 28rpx;
                transform: translateY(-50%);
                font-style: unset;
            }
            & i.eventTik2 {
                width: 112rpx;
                height: 57rpx;
                background: url("../../static/imgs/eventDetail/img_event_tik_2.png") no-repeat;
                background-size: 98rpx 57rpx;
            }
            & i.eventTik3 {
                width: 154rpx;
                height: 57rpx;
                background: url("../../static/imgs/eventDetail/img_event_tik_3.png") no-repeat;
                background-size: 140rpx 57rpx;
            }
            & i.eventTik4 {
                width: 160rpx;
                height: 57rpx;
                background: url("../../static/imgs/eventDetail/img_event_tik_4.png") no-repeat;
                background-size: 148rpx 57rpx;
            }
            & i.eventTik5 {
                width: 188rpx;
                height: 57rpx;
                background: url("../../static/imgs/eventDetail/img_event_tik_5.png") no-repeat;
                background-size: 174rpx 57rpx;
            }
        }
        .resume-wrapper {
            margin-top: 20rpx;
            padding: 0 24rpx;
            background-color: #fff;
            .title {
                height: 90rpx;
                line-height: 100rpx;
                color: #333;
                font-size: 32rpx;
                border-bottom: 2rpx solid #e6e6e6;
                padding: 0 26rpx;
                font-weight: 500;
            }
            .resume {
                padding: 17rpx 20rpx;
                font-size: 28rpx;
                color: #333;
                line-height: 48rpx;
            }
        }
        .trend-wrapper {
            position: relative;
            margin-top: 20rpx;
            background-color: #fff;
            .title-container {
                padding: 0 24rpx;
                .title {
                    height: 90rpx;
                    line-height: 100rpx;
                    color: #333;
                    font-size: 32rpx;
                    border-bottom: 2rpx solid #e6e6e6;
                    padding: 0 26rpx;
                    font-weight: 500;
                }
            }
            .tooltip {
                position: absolute;
                top: 90rpx;
                left: 0;
                padding: 0 41rpx;
                width: 100%;
                height: 54rpx;
                background-color: #f5f5f5;
                display: flex;
                justify-content: space-between;
                z-index: 20000;
                color: #666;
                font-size: 24rpx;
                line-height: 54rpx;
            }
            .chart-wrapper {
                width: 100%;
                height: 450rpx;
                .charts {
                    width: 100%;
                    height: 100%;
                    background-color: #FFFFFF;
                }
            }
        }
        .platform-wrapper {
            margin-top: 20rpx;
            background-color: #fff;
            .title-container {
                padding: 0 24rpx;
                .title {
                    height: 90rpx;
                    line-height: 100rpx;
                    border-bottom: 2rpx solid #e6e6e6;
                    padding: 0 26rpx;
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-between;
                    font-weight: 500;
                    & span {
                        color: #333;
                        font-size: 32rpx;
                    }
                    .btn-group {
                        display: flex;
                        flex-flow: row nowrap;
                        color: #999;
                        & view:first-child {
                            padding: 0 20rpx 0 0;
                        }
                        & view:nth-child(2) {
                            width: 2rpx;
                            height: 24rpx;
                            background-color: #1E82D2;
                            border-radius: 1rpx;
                            margin-top: 38rpx;
                        }
                        & view:last-child {
                            padding: 0 0 0 20rpx;
                        }
                        & view.active {
                            color: #1E82D2
                        }
                    }
                }
            }
            .chart-wrapper {
                width: 100%;
                height: 500rpx;
                .rose-charts {
                    width: 100%;
                    height: 100%;
                    background-color: #FFFFFF;
                }
            }
        }
        .info-wrapper {
            margin-top: 20rpx;
            padding: 0 24rpx;
            .title-head {
                height: 90rpx;
                line-height: 100rpx;
                padding: 0 26rpx;
                display: flex;
                flex-flow: row nowrap;
                justify-content: space-between;
                font-weight: 500;
                & span {
                    color: #333;
                    font-size: 32rpx;
                }
                .btn-group {
                    display: flex;
                    flex-flow: row nowrap;
                    color: #999;
                    & view:first-child {
                        padding: 0 20rpx 0 0;
                    }
                    & view:nth-child(2) {
                        width: 2rpx;
                        height: 24rpx;
                        background-color: #1E82D2;
                        border-radius: 1rpx;
                        margin-top: 38rpx;
                    }
                    & view:last-child {
                        padding: 0 0 0 20rpx;
                    }
                    & view.active {
                        color: #1E82D2
                    }
                }
            }
            .eventList {
                width: 100%;
                .eventItem {
                    height: 127rpx;
                    margin: 15rpx auto;
                    background: rgba(255,255,255,1);
                    border-radius: 10rpx;
                    padding: 0 33rpx;
                    .titleFire{
                        height: 32px;
                        font-size: 24rpx;
                        font-family: DroidSansFallback;
                        font-weight: 400;
                        color: rgba(51,51,51,1);
                        margin: 0 auto 20rpx auto;
                        overflow: hidden;
                        display: flex;
                        flex-flow: row nowrap;
                        & span{
                            display: block;
                        }
                        .number{
                            width: 32rpx;
                            height: 32px;
                            font-size: 20rpx;
                            background: url("../../static/imgs/public/img_result_red1.png") no-repeat center 20rpx;
                            background-size: 32rpx 38rpx;
                            text-align: center;
                            color: white;
                            line-height: 76rpx;
                        }
                        .title{
                            width: 573rpx;
                            line-height: 82rpx;
                            font-size: 28rpx;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
							margin-left: 8rpx;
                        }
                        .warn-max{
                            width: 24rpx;
                            height: 64rpx;
                            background: url("../../static/imgs/eventDetail/level_1.png") no-repeat center 30rpx;
                            background-size: 24rpx 24rpx;
                        }
                        .warn-middle{
                            width: 24rpx;
                            height: 64rpx;
                            background: url("../../static/imgs/eventDetail/level_2.png") no-repeat center 30rpx;
                            background-size: 24rpx 24rpx;
                        }
                        .warn-min{
                            width: 24rpx;
                            height: 64rpx;
                            background: url("../../static/imgs/eventDetail/level_3.png") no-repeat center 30rpx;
                            background-size: 24rpx 24rpx;
                        }
                    }
                    .sourceTime{
                        height: 20rpx;
                        line-height: 20rpx;
                        font-size: 22rpx;
                        font-family: DroidSansFallback;
                        font-weight: 400;
                        color: rgba(128,128,128,1);
                        margin: 0 auto;
						display: flex;
						flex-flow: row nowrap;
						justify-content: space-between;
						align-items: center;
                        .sourceName{
							width: 100%;
							padding-right: 30rpx;
							overflow: hidden;
							white-space: nowrap;
							text-overflow: ellipsis;
                        }
                        .dateTime{
							width: 345rpx;
                        }
                    }
                }
			    .bottom {
				    width: 100%;
				    text-align: center;
				    font-size: 12px;
				    color: #cccccc;
			    }
			}
        }
    }
</style>
