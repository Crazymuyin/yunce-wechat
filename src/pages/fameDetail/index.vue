<template name="fameDetail">
    <view>
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="backText">返回</block>
            <block slot="content">声誉形象详情</block>
        </cu-custom>
        <view class="fameDetail" v-if="!noData && !noNet">
            <view class="fameBtn" id="fameList-wrapper">
                <view :class="fameMore ? 'fameBtnMore' : ''">
                    <ul class="clearfix" v-if="!fameMore">
                        <li v-for="(vo, index) of fameType" :key="index" :class="{'active': fameActive === vo.value}" @tap="fameTagMore(vo, true)">
							{{vo.des}}
							<image src="../../static/imgs/public/new.png" alt="" v-if="vo.isNew"></image>
						</li>
                    </ul>
                    <ul class="clearfix" v-if="fameMore">
                        <li v-for="(vo, index) of fameTypeTotal" :key="index" :class="{'active': fameActive === vo.value}" @tap="fameTagMore(vo, true)">
							{{vo.des}}
							<image src="../../static/imgs/public/new.png" alt="" v-if="vo.isNew"></image>
						</li>
                    </ul>
                </view>
                <view class="fameMore" @tap="fameMoreToggle" v-if="fameTypeTotal.length > 8">
                    <img :class="fameMore ? 'img2' : 'img1'" src="../../static/imgs/public/icon_date_drop_up.png" alt="">
                </view>
            </view>
            <view class="weui-btn btnList">
                <ul class="clearfix">
                    <li :class="sortType === 2 ? 'active' : ''" @tap="orderByClick(2)">时间</li>
                    <li>|</li>
                    <li :class="sortType === 1 ? 'active' : ''" @tap="orderByClick(1)">热度</li>
                </ul>
            </view>
            <scroll-view class="fameList" :style="currentHeight" :class="fameMore ? 'fameList2' : 'fameList1'" ref="fameBox" id="fameBox"
                 :scroll-y="true"
                 :scroll-top="scrollTop"
                 @scrolltolower="loadMore"
                 @scroll="scrollFn">
                <view class="fameItem" v-for="(list, index) of fameList" :key="index" @tap="eventDetailClick(list)">
                    <view class="titleFire clearfix">
                        <span class="number fn_left">{{index + 1}}</span>
                        <span class="title fn_left">{{list.title}}</span>
                        <span v-if="list.heat >= 300" class="fire fn_left"></span>
                    </view>
                    <view class="sourceTime clearfix">
                        <span class="sourceName fn_left" v-if="list.sourceName">来源：{{list.sourceName ? list.sourceName : '匿名'}}</span>
                        <span class="dateTime fn_right">{{list.publishDate}}</span>
                    </view>
                </view>
				<view class="bottom" v-if="hideBottom">
					{{loadMoreData}}
				</view>
            </scroll-view>
        </view>
		<no-data :noData="noData" :noNet="noNet" :errorTip="errorTip" @refreshRequest="refresh"></no-data>
	</view>
</template>

<script>
	import noData from '../../components/noData.vue'
	import netWork from '../../common/checkNet.js'
    export default {
        name: "fameDetail",
		components: {
			noData
		},
        data() {
            return {
                fameMore: false,
                clientHeight: 0,
                scrollTop: -10,
                hideBottom: false,
                loadMoreData: '加载更多……',
                timer: null,
                realId: '',
                word: '',
                isNew: 0,
                page: 1,
                sortType: 2,
                fameType: [{des: "全部", value: "全部"}],
                fameTypeTotal: [{des: "全部", value: "全部"}],
                fameActive: "全部",
                orderByActive: 1,
                fameList: [],
                resultType: 1,
				currentHeight: '',
                noData: false,
                noNet: false,
                errorTip: '',
				fameHeight: 0
            }
        },
        onLoad(options) {
            this.fameType = [{des: "全部", value: "全部"}];
            this.fameTypeTotal = [{des: "全部", value: "全部"}];
            this.fameActive = "全部";
            this.fameList = [];
            this.page = 1;
            this.sortType = 2;

            if (options.hasOwnProperty("resultType")) this.resultType = Number(options.resultType);
            if (options.hasOwnProperty("word")) {
                this.fameActive = options.word;
                this.word = options.word;
				if (options.word !== '全部') {
					this.fameType.push({des: options.word, value: options.word})
					this.fameTypeTotal.push({des: options.word, value: options.word})
				}
            }
            if (options.hasOwnProperty("realId")) this.realId = Number(options.realId);
            if (options.hasOwnProperty("isNew")) this.isNew = Number(options.isNew);
            this.selectAllIdsByIdRequest()
        },
        onUnload() {
            this.fameType = [{des: "全部", value: "全部"}];
            this.fameActive = "";
            this.fameList = [];
            this.fameMore = false;
        },
		onPullDownRefresh() {
			this.selectAllIdsByIdRequest()
		},
        methods: {
			refresh() {
				this.selectAllIdsByIdRequest()
			},
			async getCurrentHeight(value) {
				let _self = this
				// #ifdef H5
				let bodyHeight =  document.body.clientHeight
				// #endif
				// #ifdef MP-WEIXIN
				let bodyHeight =  wx.getSystemInfoSync().windowHeight
				let query = await wx.createSelectorQuery();
				await query.select('#fameList-wrapper').boundingClientRect()
				await query.exec(res => {
					_self.fameHeight = Number(res[0].height)
					let listWrapperHeight = bodyHeight - _self.CustomBar - _self.fameHeight - 70
					_self.currentHeight = `height: ${listWrapperHeight}px;`
				})
				// #endif
			},
            onPullDownRefresh() {
                // 监听该页面用户下拉刷新事件
                // 可以在触发时发起请求，请求成功后调用wx.stopPullDownRefresh()来结束下拉刷新
                //console.log('下拉拉拉');
                //wx.stopPullDownRefresh()
            },
            reFresh() {
                wx.startPullDownRefresh({
                    success(errMsg) {
                        // console.log('开始下拉刷新', errMsg)
                    },
                    complete() {
                        // console.log('下拉刷新完毕');
                        //wx.stopPullDownRefresh()
                    }
                })
            },
            loadMore() {
                if (this.hideBottom) return;
                this.hideBottom = true;
                this.page++;
                this.fameTagMore({des: this.fameActive, value: this.fameActive});
            },
            scrollFn: function(e) {
                // 防抖，优化性能
                // 当滚动时，滚动条位置距离页面顶部小于设定值时，触发下拉刷新
                // 通过将设定值尽可能小，并且初始化scroll-view组件竖向滚动条位置为设定值。来实现下拉刷新功能，但没有官方的体验好
                clearTimeout(this.timer);
                if (e.target.scrollTop < this.scrollTop) {
                    this.timer = setTimeout(() => {
                        this.reFresh();
                    }, 350)
                }
                // let sh = e.target.scrollHeight;
                // let st = e.target.scrollTop;
                // let ch = this.clientHeight;
                //
                // if (parseInt(st + ch) === sh || Math.ceil(st + ch) === sh || (st + ch) / sh >= 0.92) {
                //   if (this.hideBottom) return;
                //   this.hideBottom = true;
                //   this.fameTagMore({des: this.fameActive, value: this.fameActive});
                // }
            },
            /**
             * 加载标签
             */
            async selectAllIdsByIdRequest() {
				let _self = this
				_self.noData = false
				_self.noNet = false
				_self.errorTip = ''
				netWork(function(res) {
					if (res) {
						let params = {
						    realId: _self.realId,
						    isUpdate: _self.globalData.isUpdate,
						    resultType: _self.resultType ? _self.resultType : 1
						};
						const url = `/api/healthrisk/evaluateResult/selectAllIdsById`;
						_self.$http.get(url, params).then(async (res) => {
						    let data = res.data;
						    if (data.status === 1) {
						        await data.data.forEach((item, index) => {
									if(_self.fameActive !== item.des) {
										if (index < 7) _self.fameType.push({des: item.des + "(" + item.value + ")", value: item.des, isNew: item.isNew});
										_self.fameTypeTotal.push({des: item.des + "(" + item.value + ")", value: item.des, isNew: item.isNew});
									} else if (_self.fameActive === item.des) {
										_self.fameType[1] = {des: item.des + "(" + item.value + ")", value: item.des, isNew: item.isNew};
										_self.fameTypeTotal[1] = {des: item.des + "(" + item.value + ")", value: item.des, isNew: item.isNew};
									}
						        })
						        _self.fameTagMore({des: _self.word, value: _self.word, isNew: _self.isNew})
								await _self.getCurrentHeight()
						    } else {
								_self.noData = true
								_self.errorTip = '加载失败，请稍后重试！'
						    }
						}, error => {
							_self.noData = true
							_self.errorTip = '加载失败，请稍后重试！'
						})
					} else {
						_self.noNet = true
						_self.errorTip = '无法连接网络，请检查你的网络设置！'
					}
				})
            },
            /**
             * 加载列表
             * @param word
             * @param bool
             */
            fameTagMore(word, bool) {				
				this.noData = false
				this.noNet = false
				this.errorTip = ''
                if (bool) this.page = 1;
                if (this.page === 1) this.fameList = [];
                wx.showLoading({title: '玩命加载中'});
                this.fameActive = word.value;
                const params = {
                    page: this.page,
                    pageSize: 10,
                    realId: this.realId,
                    sortType: this.sortType,
                    isUpdate: this.globalData.isUpdate,
                    resultType: this.resultType ? this.resultType : 1
                };

                if (word.hasOwnProperty('value') && word.value) params.word = word.value;
                if (word.hasOwnProperty('isNew') && word.isNew) {
                    params.isNew = word.isNew;
                } else {
                    params.isNew = 0
                }

                const url = `/api/healthrisk/evaluateResult/selectNewsById`;
                this.$http.get(url, params).then((res) => {
                    let data = res.data;
                    if (data.status === 1) {
                        if (Array.isArray(data.data) && data.data.length) {
                            data.data.forEach(item => {
                                // if (item.title.length > 12) {
                                //   item.title = item.title.substring(0, 12);
                                // }
                                this.fameList.push(item)
                            });
                            wx.hideLoading();
                            this.hideBottom = false;
                        } else {
                            wx.hideLoading();
                            this.hideBottom = false;
                            wx.showToast({ title: '已经到底了', icon: 'none', duration: 10000 });
                            setTimeout(function() {
                                wx.hideToast()
                            }, 2000)
                        }
                    } else {
						wx.hideLoading()
						this.noData = true
						this.errorTip = '加载失败，请稍后重试！'
				    }
                }, error => {
					wx.hideLoading()
					this.noData = true
					this.errorTip = '加载失败，请稍后重试！'
				})
            },
            orderByClick(id) {
                this.sortType = id;
                this.fameTagMore({des: this.fameActive, value: this.fameActive}, true)
            },
            async fameMoreToggle() {
				this.fameMore = await !this.fameMore
				await this.getCurrentHeight()
            },
            eventDetailClick(obj) {
                const url = '../detailView/index?id=' + obj.id;
                uni.navigateTo({ url })
            }
        }
    }
</script>

<style scoped>
    .fameDetail {
        position: fixed;
        width: 100%;
        height: 100%;
        background-color: #F0F0F0;
    }
    .fameDetail .fameBtn {
        width: 100%;
        background-color: white;
        border-top: 2px solid #F0F0F0;
        overflow-y: auto;
    }
    .fameDetail .fameBtn .fameBtnDefault {
        /* height: 180rpx; */
    }
    .fameDetail .fameBtn .fameBtnMore {
        height: 380rpx;
        overflow-y: auto;
    }
    .fameDetail .fameBtn .fameMore {
        width: 100%;
        height: 36rpx;
        text-align: center;
        line-height: 18rpx;
    }
    .fameDetail .fameBtn .fameMore .img1 {
        display: block;
        width: 18rpx;
        height: 10rpx;
        margin: 15rpx auto 0;
    }
    .fameDetail .fameBtn .fameMore .img2 {
        display: block;
        width: 18rpx;
        height: 10rpx;
        transform: rotate(180deg);
        margin: 15rpx auto 0;
    }
    .fameDetail .fameBtn ul {
        width: 90%;
        height: 90%;
        font-size: 25rpx;
        font-family: DroidSansFallback;
        font-weight: 400;
        line-height: 48rpx;
        margin: 0 auto;
        display: flex;
        justify-content: flex-start;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: flex-start;
        margin-bottom: 30rpx;
    }
    .fameDetail .fameBtn ul li {
		position: relative;
        width: auto;
        height: 56rpx;
        line-height: 56rpx;
        color: rgba(51,51,51,1);
        border: 2rpx solid rgba(30,130,210,1);
        border-radius: 10rpx;
        padding: 0 14rpx;
        margin: 20rpx 10rpx 0 0;
    }
    .fameDetail .fameBtn ul li.active{
        background-color: #1E82D2;
        color: rgba(255,255,255,1);
    }
	.fameDetail .fameBtn ul li image{
		position: absolute;
		top: -9rpx;
		right: -9rpx;
		width: 26rpx;
		height: 26rpx;
	}
    .fameDetail .btnList {
        width: 100%;
        height: 48rpx;
        margin-top: 20rpx;
    }
    .fameDetail .btnList ul {
        float: right;
        font-size: 30rpx;
        font-family: DroidSansFallback;
        font-weight: 400;
        color: rgba(153,153,153,1);
        line-height: 48rpx;
        margin-right: 20rpx;
    }
    .fameDetail .btnList ul li{
        float: left;
        margin: 0 10rpx;
    }
    .fameDetail .btnList ul li.active {
        color: #1E82D2;
    }
    .fameDetail .bottom {
        width: 100%;
        text-align: center;
        font-size: 12px;
        color: #cccccc;
    }
    .fameDetail .fameList {
        width: 100%;
        overflow-y: auto;
    }
    .fameDetail .fameList1 {
        height: 75%;
    }
    .fameDetail .fameList2 {
        height: 57%;
    }
    .fameDetail .fameList .fameItem {
        width: 700rpx;
        height: 127rpx;
        margin: 15rpx auto;
        background: rgba(255,255,255,1);
        border-radius: 10rpx;
    }
    .fameDetail .fameList .fameItem .titleFire{
        width: 90%;
        height: 32px;
        font-size: 24rpx;
        font-family: DroidSansFallback;
        font-weight: 400;
        color: rgba(51,51,51,1);
        margin: 0 auto;
        overflow: hidden;
        margin-bottom: 20rpx;
    }
    .fameDetail .fameList .fameItem .titleFire span{
        display: block;
    }
    .fameDetail .fameList .fameItem .titleFire span.number{
        width: 31rpx;
        height: 32px;
        font-size: 20rpx;
        background: url("../../static/imgs/public/img_result_red1.png") no-repeat center 22rpx;
        background-size: 35rpx 38rpx;
        text-align: center;
        line-height: 76rpx;
        color: white;
        float: left;
    }
    .fameDetail .fameList .fameItem .titleFire span.title{
        width: 530rpx;
        line-height: 41px;
        float: left;
        margin-left: 15rpx;
        font-size: 28rpx;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .fameDetail .fameList .fameItem .titleFire span.fire{
        width: 20rpx;
        height: 32px;
        float: right;
        background: url("../../static/imgs/public/img_result_hot.png") no-repeat center 30rpx;
        background-size: 20rpx 25rpx;
    }
    .fameDetail .fameList .fameItem .sourceTime {
        width: 90%;
        height: 20rpx;
        line-height: 20rpx;
        font-size: 22rpx;
        font-family: DroidSansFallback;
        font-weight: 400;
        color: rgba(128,128,128,1);
        margin: 0 auto;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
    }
    .fameDetail .fameList .fameItem .sourceTime .sourceName {
		width: 100%;
		padding-right: 30rpx;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
    }
    .fameDetail .fameList .fameItem .sourceTime .dateTime {
		width: 345rpx;
    }
</style>
