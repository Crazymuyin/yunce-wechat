<template name="myReport">
    <view class="page">
        <cu-custom bgColor="bg-custom-nav" :isBack="true" :isTarget="true" @targetTap="targetTap">
            <block slot="backText"></block>
            <block slot="targetIcon"><i class="help_icon"></i></block>
            <block slot="content">个人网信健康测评报告</block>
        </cu-custom>
        <view class="myReport" v-if="!noData && !noNet">
            <view class="tabClick">
                <view class="item" v-for="(item, index) of tabArr" :key="index" @tap="tabToggle(index, item.value)" :class="{'vip': (item.value === 2 || item.value === 3) && tabIndex === index, 'active': tabIndex === index}">
                    <span>{{item.name}}</span>
                </view>
            </view>
            <view class="report" v-if="reportType === 'report'">
                <view class="portrait">
                    <img src="../../static/imgs/report/img_mine_head.png" alt="">
                </view>
                <view class="reportNum">{{reportNumber}}</view>
                <view class="startList clearfix">
                    <view class="layout clearfix" v-if="nickName">
                        <span>{{nickName}}</span>
                        <ul class="clearfix">
                            <li v-for="(list, index) of startNumber" :class="list ? list : 'sky'" :key="index"></li>
                        </ul>
                        <span class="level" :class="levelType"></span>
                    </view>
                </view>
                <!-- <view class="content" v-html="content"></view> -->
				<rich-text class="content" :nodes="commentContent"></rich-text>
                <view class="commentMore">报告根据1月内数据生成</view>
            </view>
			<view class="head-info-bg" v-if="reportType === 'myReport'"></view>
			<view class="head-info-data" v-if="reportType === 'myReport'">
				<view class="tip-wrapper">
					<view class="tip" v-show="tipShow">{{updataTip}}</view>
					<image src="../../static/imgs/myReport/my-report-banner.png"></image>
					<view class="value-wrapper">
						<view class="part-num">
							<span :class="riskObj.imgType">{{reportNumber ? `${reportNumber}分` : '--'}}</span>
						</view>
						<view class="star">
							<span class="name">{{nickName ? nickName : '--'}}</span>
							<span v-for="(list, index) of startNumber" class="star-item" :key="index" :class="list ? list : 'sky'"></span>
							<span class="pag" :class="levelType === 'fine' ? 'page-type-1' : levelType === 'health'
								? 'page-type-2' : levelType === 'subhealthy' ? 'page-type-3' : levelType === 'ailment'
								? 'page-type-4' : levelType === 'damage' ? 'page-type-5' : ''"></span>
						</view>
						<view class="ratio">
							<view class="redRatio">红粉</view>
							<view class="progressRatio">
								<view class="ratioText">
									<view class="ratioTextLeft" :style="riskObj.realWidth">{{riskObj.ratio ? riskObj.ratio + "%" : ""}}</view>
									<view class="ratioTextRight" :style="riskObj.realRWidth">{{riskObj.ratio ? (100 - riskObj.ratio)+"%" : ""}}</view>
								</view>
								<view class="ratioTextCenter" :style="riskObj.arrowWidth"></view>
								<view class="progress">
									<view class="currentProgress" :style="riskObj.realWidth"></view>
								</view>
							</view>
							<view class="blackRatio">黑粉</view>
						</view>
						<view class="tooltip">关注点：{{bannerInfo.concerns}}</view>
						<view class="tooltip">风险点：{{bannerInfo.riskPoint}}</view>
					</view>
				</view>
            </view>
            <view class="fame-3d-more" v-if="reportType === 'myReport' && Array.isArray(storeFameList) && storeFameList.length">
                <view class="fame-title">
                    <span class="title">声誉形象</span>
                    <span class="more" @tap="fameClickMore('more')">更多>></span>
                </view>
                <view class="fame-3d-box">
                    <image src="../../static/imgs/myReport/3d-bg.png"></image>
                    <view class="tag-ball">
                        <view class="tag" v-for="(item, index) of tagEle" :key="index" :style="item.style" @tap="fameClickMore(item)">
                            <span>{{item.title}}</span>
							<i v-if="item.isNew" class="new"></i>
                        </view>
                    </view>
                </view>
            </view>
            <view class="fame-event-list" v-if="reportType === 'myReport'">
                <view class="fame-title">
                    <span class="title">关联事件</span>
                </view>
                <view class="fame-event-tag">
                    <view class="tag all-risk" @tap="eventMoreClick">
                        <view class="number"><span>{{eventCountInfo.allEventNum}}</span>个</view>
                        <view class="event-name">全部事件</view>
                    </view>
                    <view class="tag risk" @tap="eventMoreClick('risk')">
                        <view class="number"><span>{{eventCountInfo.riskEventNum}}</span>个</view>
                        <view class="event-name">风险事件</view>
                    </view>
                    <view class="tag warning-risk" @tap="eventMoreClick('warning')">
                        <view class="number"><span>{{eventCountInfo.warnEventNum}}</span>个</view>
                        <view class="event-name">预警事件</view>
                    </view>
                </view>
                <view class="event">
                    <view class="eventList">
                        <view class="list-item" v-for="(list, index) of eventList" :key="index" @tap="eventDetailClick(list)">
                            <i>{{index + 1}}</i>
                            <span>{{list.eventTitle}}</span>
                            <span v-if="list.riskValue >= 300" class="fire"></span>
                            <span v-if="list.isNew" class="new"></span>
                        </view>
                    </view>
                </view>
            </view>
            <view class="fame-general" v-if="reportType === 'myReport'">
				<view class="summary-title">网信健康总评</view>
                <view class="fame-box-arrow"></view>
                <view class="fame-box">
					<!-- #ifdef H5 -->
					<view class="fame-box-in" v-html="commentContent"></view>
					<!-- #endif -->
                    <!-- #ifdef MP-WEIXIN -->
					<view class="fame-box-in">
						<rich-text :nodes="commentContent"></rich-text>
					</view>
                    <!-- <rich-text class="fame-box-in" :nodes="commentContent"></rich-text> -->
                    <!-- #endif -->
                    <view class="copy-right">
                        <view class="copy-right-hr">
                            <view class="lt-hr"></view>
                            <view class="company">中正舆情丨澜极大数据</view>
                            <view class="rt-hr"></view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <toggle :toggle-info="toggleInfo" @toggleTag="toggleTagTest"></toggle>
        <no-data :noData="noData" :noNet="noNet" :errorTip="errorTip" @refreshRequest="refresh"></no-data>
    </view>
</template>

<script>
    import Toggle from '../../components/toggle'
    import noData from '../../components/noData'
	import netWork from '../../common/checkNet.js'
    export default {
        name: "myReport",
        data() {
            return {
                searchTxt: "",
                toggleInfo: {
                    changeModel: false,
                    isModel: false,
                    index: '',
                    val: "",
                },
				updataTip: '',
				tipShow: false,
                reportType: "",
                tabArr: [{name: "月报", alias: "mouth", value: 1}, {name: "季报", alias: "half", value: 2}, {name: "年报", alias: "year", value: 3}],
                tabIndex: 0,
                resultType: 1,
                riskObj: {
                    ratio: 50,
                    imgType: "pw",
                    realWidth: `width: ${50}%`,
                    realRWidth: `width: ${100 - 50}%`,
                    arrowWidth: `width: ${5+1.5}%`
                },
                tagEle: [],
                cloudInterval: null,
                realId: "",
				userId: "",
                nickName: "",
                reportNumber: 0,
                startNumber: ["", "", "", "", ""],
                levelType: "",
                fameList: [],
                eventList: [],
                eventListMore: [],
                commentContent: "",
                fameActive: "",
                fameNumber: 0,
                isNew: 0,
                bannerInfo: {
                    concerns: "",
                    riskPoint: ""
                },
                eventCountInfo: {
                    allEventNum: 0,
                    riskEventNum: 0,
                    warnEventNum: 0
                },
                noData: false,
                noNet: false,
                errorTip: '',
				storeFameList: [],
				showTime: null
            }
        },
        components: {
            Toggle,
            noData
        },
        onLoad(options) {
            this.realId = options.realId;
			this.userId = this.$store.getters.userInfo.client_id;
			if (options.isUpdate) this.globalData.isUpdate = options.isUpdate;
			if (options.resultType) this.resultType = options.resultType;
			if (this.$store.getters.userInfo.userType) {
				if (options.current === '季') {
					this.tabIndex = 1
					this.resultType = 2
				} else if (options.current === '年') {
					this.tabIndex = 2
					this.resultType = 3
				}
			}
            this.electDataByIdRequest(this.userId, options.realId);
        },
        onUnload() {
            this.resetParams();
            clearInterval(this.cloudInterval);
        },
        onShow() {
            clearInterval(this.cloudInterval);
			if(this.storeFameList.length) this.cloudInnit(this.storeFameList);
        },
		onPullDownRefresh() {
			clearInterval(this.cloudInterval);
			this.electDataByIdRequest(this.userId, this.realId);
		},
        methods: {
			refresh() {
				clearInterval(this.cloudInterval);
				this.electDataByIdRequest(this.userId, this.realId);
			},
            resetParams() {
                this.reportType = "";
                this.tabIndex = 0;
                this.fameNumber = 0;
                this.nickName = "";
                this.reportNumber = 0;
                this.startNumber = ["", "", "", "", ""];
                this.levelType = "";
                this.fameList = [];
                this.eventList = [];
                this.eventListMore = [];
                this.commentContent = "";
                // this.resultType = 1;
                this.riskObj = {
                    ratio: 50,
                    imgType: "pw",
                    realWidth: `width: ${50}%`,
                    realRWidth: `width: ${100 - 50}%`,
                    arrowWidth: `width: ${5+1.5}%`
                };
            },
            /**
             * 帮助中心
             */
            targetTap(bool) {
                if (bool) {
                    let url = `../helpCenter/index`;
                    uni.navigateTo({url})
                }
            },
            /**
             * 按钮点击切换
             * @param index
             * @param value
             */
            tabToggle(index, value) {
                if (this.$store.getters.userInfo.userType) {
                    clearInterval(this.cloudInterval);
					clearTimeout(this.showTime)
                    this.resetParams();
                    this.tabIndex = index;
                    this.resultType = value;
                    this.electDataByIdRequest(this.userId, this.realId);
                } else {
                    this.globalData.searchTxt = "";
                    this.searchTxt = "";
                    this.toggleInfo = {changeModel: true, index: 3, isModel: true, val: '下载APP享受更多测评报告。可通过小米、华为、OPPO、百度应用商店、腾讯应用宝下载云测APP。', title: "很抱歉"};
                };
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
            /**
             * 3D词云初始化
             */
            cloudInnit(cloudArr) {
                let tagEle = [];
                if (Array.isArray(cloudArr) && cloudArr.length) {
                    cloudArr.forEach(item => {
                        tagEle.push({title: item.name, x: 0, y: 0, z: 0, s: 0, o: 1, f: 15, angleX: 0, angleY: 0, isNew: item.isNew, value: item.value, num: item.num})
                    })
                }

                let fallLength = 100;
                let angleX = Math.PI / 100;
                let angleY = Math.PI / 100;
                for (let i = 0; i < tagEle.length; i++) {
                    let k = (2 * (i + 1) - 1) /tagEle.length - 1;
                    // 计算圆形旋转
                    let a = Math.acos(k);
                    let b = a * Math.sqrt(tagEle.length * Math.PI);
                    // 计算元素x, y 坐标
                    let numx = 120 * Math.sin(a) * Math.cos(b);
                    let numy = 120 * Math.sin(a) * Math.sin(b);
                    let numz = 220 * Math.cos(a);

                    // 计算元素缩放大小
                    tagEle[i].x = numx * 1.8;
                    tagEle[i].y = numy * 1.8;
                    tagEle[i].z = numz;
                    tagEle[i].s = 250 / (400 - tagEle[i].z);
                }

                // 动画
                this.cloudInterval = setInterval(() => {
                    for (let i = 0; i < tagEle.length; i++) {
                        let k = (2 * (i + 1) - 1) / tagEle.length - 1;
                        let a = Math.acos(k);
                        let numz = 240 * Math.cos(a);
                        tagEle[i].s = 250 / (500 - tagEle[i].z);
                        var cos = Math.cos(angleX);
                        var sin = Math.sin(angleX);
                        var y1 = tagEle[i].y * cos - tagEle[i].z * sin;
                        var z1 = tagEle[i].z * cos + tagEle[i].y * sin;
                        tagEle[i].y = y1;
                        tagEle[i].z = z1;

                        var cos = Math.cos(angleY);
                        var sin = Math.sin(angleY);
                        var x1 = tagEle[i].x * cos - tagEle[i].z * sin;
                        var z1 = tagEle[i].z * cos + tagEle[i].x * sin;
                        tagEle[i].x = x1;
                        tagEle[i].z = z1;
                        tagEle[i].style = `opacity:${tagEle[i].o};z-index:${tagEle[i].z};left:${tagEle[i].x}rpx;top:${tagEle[i].y}rpx;transform:scale(${tagEle[i].s})`
                    }
                    this.tagEle = tagEle;
                }, 200)
            },
            /**
             * 初始化
             */
            electDataByIdRequest(userId, realId) {
				let _self = this
				_self.noData = false
				_self.noNet = false
				_self.errorTip = ''
				wx.showLoading({ title: "正在加载" });
				netWork(function(res) {
					if (res) {
						let params = {userId: userId, realId: realId, resultType: _self.resultType};
						if (_self.globalData.isUpdate !== '') params.isUpdate = _self.globalData.isUpdate;
						let url = "/api/healthrisk/evaluateResult/selectDataById";
						_self.$http.get(url, params).then((res) => {
							wx.hideLoading();
						    let data = res.data;
						    if (data.status === 1 && JSON.stringify(data.data) !== '{}') {
								_self.updataTip = data.data.compareResult
								if (_self.updataTip.length) {
									_self.tipShow = true
									_self.showTime = setTimeout(function() {
										_self.tipShow = false
									}, 3000)
								}
						        let eventDataCount = data.data.eventData === null ? 0 : data.data.eventData.length;
						        let imageNewsCount = data.data.personalRiskData === null ? 0 : data.data.personalRiskData.length;
						        let labelCount = data.data.personalRiskList === null ? 0 : data.data.personalRiskList.length;
						
						        if (data.data.riskValue === 0) {
						            return false;
						        }
						
						        if (eventDataCount === 0 && imageNewsCount === 0 && labelCount === 0) {
									_self.reportType = 'report'
						        } else {
						            _self.reportType = 'myReport'
						        }
						
						        let oldRiskValue = data.data.oldRiskValue;
						        let riskValue = data.data.riskValue;
						        let ratio = data.data.ratio;
						        let starNum = data.data.starNum;
						        let healthStatus = data.data.healthStatus;
						        let fameList = data.data.personalRiskList;
								
								if (Array.isArray(fameList) && fameList.length) {
									_self.storeFameList = fameList;
									_self.cloudInnit(fameList);
								}
						
						        if (oldRiskValue > 0) {
						            if (oldRiskValue < riskValue) _self.riskObj.imgType = "up";
						            if (oldRiskValue > riskValue) _self.riskObj.imgType = "down";
						            if (oldRiskValue === riskValue) _self.riskObj.imgType = "pw";
						        } else {
						            _self.riskObj.imgType = "";
						        };
						
						        if (ratio > 0) {
						            _self.riskObj.realWidth = `width: ${ratio}%`;
						            _self.riskObj.realRWidth = `width: ${100 - ratio}%`;
						            _self.riskObj.arrowWidth = `width: ${ratio+1.5}%`;
						            _self.riskObj.ratio = ratio;
						        } else {
						            _self.riskObj.ratio = 0;
						        };
						
								_self.globalData.testTime = data.data.testTime
						        _self.nickName = data.data.nickName;
						        _self.reportNumber = data.data.riskValue;
						        _self.bannerInfo.concerns = data.data.concerns ? data.data.concerns : '--';
						        _self.bannerInfo.riskPoint = data.data.riskPoint ? data.data.riskPoint : '--';
						        _self.eventCountInfo.allEventNum = data.data.allEventNum ? data.data.allEventNum : 0;
						        _self.eventCountInfo.riskEventNum = data.data.riskEventNum ? data.data.riskEventNum : 0;
						        _self.eventCountInfo.warnEventNum = data.data.warnEventNum ? data.data.warnEventNum : 0;
						
						        if (starNum === 0) {
						            _self.startNumber = ["", "", "", "", ""]
						        } else if (starNum > 0 && starNum < 1) {
						            _self.startNumber = ["half", "", "", "", ""];
						        } else if (starNum === 1) {
						            _self.startNumber = ["also", "", "", "", ""];
						        } else if (starNum > 0 && starNum < 2) {
						            _self.startNumber = ["also", "half", "", "", ""];
						        } else if (starNum === 2) {
						            _self.startNumber = ["also", "also", "", "", ""];
						        } else if (starNum > 2 && starNum < 3) {
						            _self.startNumber = ["also", "also", "half", "", ""];
						        } else if (starNum === 3) {
						            _self.startNumber = ["also", "also", "also", "", ""];
						        } else if (starNum > 3 && starNum < 4) {
						            _self.startNumber = ["also", "also", "also", "half", ""];
						        } else if (starNum === 4) {
						            _self.startNumber = ["also", "also", "also", "also", ""];
						        } else if (starNum > 4 && starNum < 5) {
						            _self.startNumber = ["also", "also", "also", "also", "half"];
						        } else if (starNum === 5) {
						            _self.startNumber = ["also", "also", "also", "also", "also"];
						        }
						
						        if (healthStatus === "健康") {
						            _self.levelType = "health"
						        } else if (healthStatus === "良好") {
						            _self.levelType = "fine";
						        } else if (healthStatus === "亚健康") {
						            _self.levelType = "subhealthy";
						        } else if (healthStatus === "微恙") {
						            _self.levelType = "ailment";
						        } else if (healthStatus === "危重") {
						            _self.levelType = "damage"
						        }
						
						        _self.eventList = data.data.eventData;
								let desc = data.data.riskDesc.replace('（获取应对建议）', '');
						        _self.commentContent = '<p>' + desc.replace(/(\r\n|\n|\r)/g, '</p><p>') + '</p>';
						    } else {
								_self.noData = true
								_self.errorTip = '加载失败，请稍后重试！'
						    }
						}, error => {
							wx.hideLoading()
							_self.noData = true
							_self.errorTip = '加载失败，请稍后重试！'
						})
					} else {
						wx.hideLoading()
						_self.noNet = true
						_self.errorTip = '无法连接网络，请检查你的网络设置！'
					}
				})
            },
            /**
             * 事件关联详细
             */
            eventDetailClick(event) {
                const url = '../eventDetail/index?eventWords=' + event.eventWords + '&newIds=' + event.newIds +
                    '&realId=' + this.realId + '&event=' + event.eventTitle + '&id=' + event.id +
                    '&ids=' + event.ids + '&resultType=' + this.resultType + '&isNew=' + event.isNew;
				uni.navigateTo({ url })
            },
            fameClickMore(type) {
                let url = '../fameDetail/index?realId=' + this.realId + "&resultType=" + this.resultType;
                if (typeof type === 'object') {
                    url += `&word=${type.title}&isNew=${Number(type.isNew)}`
                } else if (type === 'more') {
                    url += "&word=全部"
                }
                uni.navigateTo({ url })
            },
            /**
             * 关联事件
             * @param type
             * @returns {boolean}
             */
            eventMoreClick(type) {
				if (type === 'risk') {
					if (this.eventCountInfo.riskEventNum === 0) {
						return false
					}
				} else if (type === 'warning') {
					if (this.eventCountInfo.warnEventNum === 0) {
						return false
					}
				} else {
					if (this.eventCountInfo.allEventNum === 0) {
						return false
					}
				}

				let params = {
					page: 1,
					pageSize: 10,
					testTime: this.globalData.testTime,
					resultType: this.resultType,
					riskValue: this.reportNumber,
					all: this.eventCountInfo.allEventNum ? this.eventCountInfo.allEventNum : 0,
					risk: this.eventCountInfo.riskEventNum ? this.eventCountInfo.riskEventNum : 0,
					warn: this.eventCountInfo.warnEventNum ? this.eventCountInfo.warnEventNum : 0
				};
				// eventCountInfo
				if (this.realId) params.realId = Number(this.realId);
				if (this.globalData.isUpdate !== '') params.isUpdate = this.globalData.isUpdate;

				if (type === 'risk') {
					params.eventAppraise = "负面"
				} else if (type === 'warning') {
					params.eventAppraise = 12
				}
				
				let urlStr = Object.keys(params).map(function (key) {
					return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
				}).join("&");
				
                const url = '../event/index?' + urlStr;
                uni.navigateTo({ url })
            }
        }
    }
</script>

<style scoped lang="less">
    .page {
        width: 100%;
        height: 100vh;
        background-color: #EDFBFF;
    }
    .bg-custom-nav {
        background-color: #1E82D2;
        color: #ffffff;
    }
    .help_icon {
        width: 38rpx;
        height: 38rpx;
        margin-left: 24rpx;
        display: block;
        background: url("../../static/imgs/myReport/help-icon.png") no-repeat;
        background-size: 100% 100%;
    }

    

    @x: 1.042;
    .myReport {
        .tabClick {
            display: flex;
            justify-content: center;
            width: 100%;
            height: 88.57rpx;
            font-size: 26rpx;
            color: white;
            background: url("../../static/imgs/myReport/my-report-header.png") no-repeat;
            background-size: 100% 100%;
            .item {
                width: auto;
                height: 48rpx*@x;
                text-align: center;
                line-height: 48rpx*@x;
                border-top: 1px solid white;
                border-bottom: 1px solid white;
                margin-top: 20rpx*@x;
            }
            .item:first-child {
                width: 182rpx*@x;
                border-left: 1px solid white;
                border-top-left-radius: 20rpx*@x;
                border-bottom-left-radius: 20rpx*@x;
            }
            .item:nth-child(2) {
                width: 197rpx*@x;
                border-left: 1px solid white;
                border-right: 1px solid white;
                background: transparent url("../../static/imgs/myReport/vipIcon.png") no-repeat 128rpx 6rpx;
                background-size: 40rpx 30rpx;
            }
            .item:last-child {
                width: 182rpx*@x;
                border-right: 1px solid white;
                border-top-right-radius: 20rpx*@x;
                border-bottom-right-radius: 20rpx*@x;
                background: transparent url("../../static/imgs/myReport/vipIcon.png") no-repeat 128rpx 6rpx;
                background-size: 40rpx 30rpx;
            }
            .item.active {
                background: white;
                color: #0E91FF;
                font-weight: bold;
            }
            .vip {
                background: white url("../../static/imgs/myReport/vipIcon.png") no-repeat 128rpx 6rpx !important;
                background-size: 40rpx 30rpx !important;
            }
        }
		.report {
		    width: 100%;
		    height: 100%;
			margin-top: 150rpx;
		}
		.report .portrait {
		    width: 100%;
		    height: 210rpx;
		    text-align: center;
		}
		.report .portrait img {
		    width: 208rpx;
		    height: 210rpx;
		}
		.report .reportNum {
		    width: 100%;
		    height: 100rpx;
		    margin-top: 10rpx;
		    text-align: center;
		    background: url("../../static/imgs/myReport/reportNumBg.png") no-repeat center center;
		    background-size: 439rpx 100rpx;
		    font-size: 72rpx;
		    font-family: DroidSansFallback;
		    font-weight: 400;
		    color: rgba(16,183,20,1);
		    line-height: 50px;
		}
		.report .startList {
		    width: 100%;
		    height: 40rpx;
		    line-height: 40rpx;
		}
		.report .startList .layout{
		    display: flex;
		    justify-content:center;
		    width: 100%;
		    height: 40rpx;
		    font-size: 14px;
		}
		.report .startList .layout span{
		    float: left;
		    display: block;
		}
		.report .startList .layout ul{
		    float: left;
		    margin-left: 10rpx;
		    display: block;
		}
		.report .startList .layout ul li{
		    float: left;
		    width: 44rpx;
		    height: 40rpx;
		    margin: 0 5rpx;
		}
		.report .startList .layout ul li.default {
		    background: url("../../static/imgs/myReport/skyStar.png") no-repeat center center;
		    background-size: 44rpx 40rpx;
		}
		.report .startList .layout ul li.also {
		    background: url("../../static/imgs/myReport/alsoStar.png") no-repeat center center;
		    background-size: 44rpx 40rpx;
		}
		.report .startList .layout ul li.half {
		    background: url("../../static/imgs/myReport/halfStar.png") no-repeat center center;
		    background-size: 44rpx 40rpx;
		}
		.report .startList .layout span.level{
		    width: 100rpx;
		    height: 40rpx;
		}
		.report .startList .layout span.health {
		    background: url("../../static/imgs/myReport/img_result_Warning.png") no-repeat center center;
		    background-size: 80rpx 33rpx;
		}
		.report .startList .layout span.fine {
		    background: url("../../static/imgs/myReport/img_result_Risky.png") no-repeat center center;
		    background-size: 80rpx 33rpx;
		}
		.report .startList .layout span.subhealthy {
		    background: url("../../static/imgs/myReport/img_result_Warning2.png") no-repeat center center;
		    background-size: 100rpx 33rpx;
		}
		.report .startList .layout span.ailment {
		    background: url("../../static/imgs/myReport/img_result_Warning3.png") no-repeat center center;
		    background-size: 80rpx 33rpx;
		}
		.report .startList .layout span.damage {
		    background: url("../../static/imgs/myReport/img_result_Warning4.png") no-repeat center center;
		    background-size: 80rpx 33rpx;
		}
		.report .content {
		    width: 600rpx;
		    height: auto;
		    margin: 50rpx auto 0;
		    font-size: 28rpx;
		    font-family: MicrosoftYaHei;
		    font-weight: 400;
		    color: rgba(51,51,51,1);
		    line-height: 48rpx;
		    display: block;
		    text-indent: 2em;
		    text-align:justify;
		    text-align-last:left;
		}
		.report .commentMore {
		    position: absolute;
		    right: 70rpx;
		    bottom: 50rpx;
		    font-size: 20rpx;
		    font-family: DroidSansFallback;
		    font-weight: 400;
		    color: rgba(179,179,179,1);
		}
		
		.head-info-bg {
			width: 100%;
			height: 197rpx*@x;
			background: url("../../static/imgs/myReport/my-report-hearder2.png") no-repeat;
			background-size: 100% 100%;
		}
		.head-info-data {
			margin-top: -204rpx;
			.tip {
				width: 100%;
				height: 70rpx;
				background: rgba(255, 255, 255, 0.1);
				color: #fff;
				line-height: 70rpx;
				text-align: center;
				font-size: 30rpx;
			}
			.tip-wrapper {
				width: 100%;
				display: flex;
				flex-flow: column;
				margin: -197rpx auto 60rpx auto;
				& image {
					width: 680rpx*@x;
					margin: 0 auto;
				}
				.value-wrapper {
					z-index: 10;
					display: flex;
					flex-flow: column;
					width: 100%;
					margin: -231rpx auto 0 auto;
					.part-num {
						width: auto;
						height: 92rpx*@x;
						font-size: 72rpx*@x;
						color: white;
						font-family: DroidSansFallback;
						text-align: center;
						// margin-top: 20rpx*@x;
						margin-top: -180rpx;
						& span {
							padding: 0 40rpx*@x;
						}
						& span.up {
							background: url("../../static/imgs/myReport/up.png") no-repeat 200rpx 66rpx;
							background-size: 27rpx*@x 27rpx*@x;
						}
						& span.pw {
							background: url("../../static/imgs/myReport/pw.png") no-repeat 200rpx 66rpx;
							background-size: 27rpx*@x 27rpx*@x;
						}
						& span.down {
							background: url("../../static/imgs/myReport/down.png") no-repeat 200rpx 66rpx;
							background-size: 27rpx*@x 27rpx*@x;
						}
					}
					.star {
						display: flex;
						margin-top: 20rpx;
						justify-content: center;
						align-items: center;
						.name {
							font-size: 30rpx;
							color: white;
						}
						.star-item {
							width: 43rpx*@x;
							height: 43rpx*@x;
							margin: 0 8rpx;
						}
						.also {
							background: url("../../static/imgs/myReport/alsoStar.png") no-repeat;
							background-size: 100% 100%;
						}
						.half {
							background: url("../../static/imgs/myReport/halfStar.png") no-repeat;
							background-size: 100% 100%;
						}
						.sky {
							background: url("../../static/imgs/myReport/skyStar.png") no-repeat;
							background-size: 100% 100%;
						}
						.pag{
							width: 80rpx*@x;
							height: 33rpx*@x;
							margin-left: 8rpx;
						}
						.page-type-1, .fine {
							background: url("../../static/imgs/myReport/img_result_Risky.png") no-repeat;
							background-size: 100% 100%;
						}
						.page-type-2, .health {
							background: url("../../static/imgs/myReport/img_result_Warning.png") no-repeat;
							background-size: 100% 100%;
						}
						.page-type-3, .subhealthy {
							width: 100rpx*@x !important;
							background: url("../../static/imgs/myReport/img_result_Warning2.png") no-repeat;
							background-size: 100% 100%;
						}
						.page-type-4, .ailment {
							background: url("../../static/imgs/myReport/img_result_Warning3.png") no-repeat;
							background-size: 100% 100%;
						}
						.page-type-5, .damage {
							background: url("../../static/imgs/myReport/img_result_Warning4.png") no-repeat;
							background-size: 100% 100%;
						}
					}
					.ratio {
						display: flex;
						justify-content: center;
						padding-top: 40rpx;
						.redRatio {
							width: 50rpx;
							height: 60rpx;
							font-size: 20rpx;
							font-weight: 400;
							line-height: 100rpx;
							color: white;
							background: url("../../static/imgs/myReport/reaIcon.png") no-repeat top center;
							background-size: 30rpx 30rpx;
						}
						.progressRatio {
							width: 280rpx;
							height: 60rpx;
							margin: 0 15rpx;
							.ratioText {
								display: flex;
								justify-content: flex-start;
								width: 100%;
								height: 32rpx;
								font-size: 20rpx;
								margin-bottom: 5rpx;
								.ratioTextLeft {
									color: #F15C80;
									text-align: center;
								}
								.ratioTextRight {
									color: #808080;
									text-align: center;
								}
							}
							.ratioTextCenter {
								width: 10rpx;
								height: 9rpx;
								background: url("../../static/imgs/myReport/arrow.png") no-repeat bottom right;
								background-size: 10rpx 9rpx;
							}
							.progress {
								position: relative;
								width: 100%;
								height: 16rpx;
								background: #999999;
								border-radius: 8rpx;
								.currentProgress {
									position: absolute;
									top: 0;
									left: 0;
									height: 16rpx;
									background: rgba(253,103,128,1);
									border-radius: 8rpx;
								}
							}
						}
						.blackRatio {
							width: 50rpx;
							height: 60rpx;
							font-size: 20rpx;
							font-weight: 400;
							line-height: 100rpx;
							color: white;
							background: url("../../static/imgs/myReport/blackIcon.png") no-repeat top center;
							background-size: 30rpx 30rpx;
						}
					}
					.tooltip {
						font-size: 30rpx;
						margin: 30rpx 0 0 65rpx;
						color: white;
					}
					.tooltip:last-child {
						margin-top: 6rpx;
					}
				}
			}
		}
		.publicTitle() {
            .fame-title {
                width: auto;
                height: auto;
                display: flex;
                justify-content: space-between;
                padding-top: 26rpx;
                & span.title {
                    height: 100%;
                    border-left: 6rpx solid #1E82D2;
                    padding-left: 20rpx;
                    font-size: 32rpx;
                    font-weight: revert;
                    margin-left: 20rpx;
                }
                & span.more {
                    margin-right: 20rpx;
                    color: #999999;
                }
            }
        }
        .fame-3d-more {
            width: 680rpx*@x;
            height: 500rpx*@x;
            background: white;
            border-radius: 20rpx;
            margin: 15rpx auto 0;
            .publicTitle();
            .fame-3d-box {
                position: relative;
                width: 375rpx*@x;
                height: 375rpx*@x;
                /*background: url("../../static/imgs/myReport/3d-bg.png") no-repeat center center;*/
                /*background-size: 100% 100%;*/
                margin: 20rpx auto 0;
                & image {
                    width: 100%;
                    height: 100%;
                }
                .tag-ball {
                    position: absolute;
                    top: 45%;
                    left: 44%;
                    margin: 0 auto;
                    width: 150rpx*@x;
                    height: 150rpx*@x;
                    .tag {
                        position: absolute;
                        left: 0rpx;
                        top: 0rpx;
                        color: #000;
                        text-decoration: none;
                        font-size: 24rpx;
						display: flex;
						flex-flow: row nowrap;
						.new {
						    width: 50rpx;
						    height: 37rpx;
						    background: url("../../static/imgs/public/new.png") no-repeat center center    ;
						    background-size: 28rpx 28rpx;
						}
                    }
                    .tag:hover {
                        border:1px solid #666;
                    }
                }
            }
        }
        .fame-event-list {
            width: 680rpx*@x;
            // height: 510rpx*@x;
            background: white;
            border-radius: 20rpx;
            margin: 15rpx auto 0;
			padding: 0 0 14rpx 0;
            .publicTitle();
            .fame-event-tag {
                display: flex;
                justify-content: space-evenly;
                width: 100%;
                height: 140rpx*@x;
                margin-top: 10rpx;
                .tag {
                    width: 210rpx*@x;
                    height: 100%;
                    text-align: center;
                    .number {
                        font-size: 30rpx;
                        margin-top: 32rpx;
                        & span {
                            font-size: 48rpx;
                            font-weight: bold;
                        }
                    }
                    .event-name {
                        font-size: 30rpx;
                    }
                }
                .all-risk {
                    background: url("../../static/imgs/myReport/all-risk.png") no-repeat;
                    background-size: 100% 100%;
                }
                .risk {
                    background: url("../../static/imgs/myReport/risk.png") no-repeat;
                    background-size: 100% 100%;
                }
                .warning-risk {
                    background: url("../../static/imgs/myReport/warning-risk.png") no-repeat;
                    background-size: 100% 100%;
                }
            }
            .event {
                .eventList{
                    width: 100%;
                    height: 100%;
                    overflow-y: auto;
                    background-color: #fff;
                    padding: 0 8rpx;
                    .list-item {
                        height: 100rpx;
                        margin: 0 auto;
                        line-height: 100rpx;
                        border-bottom: 2rpx solid #f0f0f0;
                        font-size: 28rpx;
                        display: flex;
                        flex-flow: row nowrap;
                        justify-content: flex-start;
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
                            width: 560rpx;
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
                            background: url("../../static/imgs/public/new.png") no-repeat center center    ;
                            background-size: 28rpx 28rpx;
                        }
                    }
                    .list-item:last-child{
                        border-bottom: none;
                    }
                }
            }
        }
        .fame-general {
            position: relative;
            width: 719rpx*@x;
            height: 202rpx*@x;
            background: url("../../static/imgs/myReport/general-header.png") no-repeat;
            background-size: 100% 100%;
			.summary-title {
				position: absolute;
				top: 69rpx;
				left: 50%;
				transform: translateX(-50%);
				font-size:32rpx;
				color: #333;
				font-weight: 500;
			}
            .fame-box-arrow {
                position: absolute;
                top: 150rpx;
                left: 100rpx;
                width: 95rpx*@x;
                min-height: 63rpx*@x;
                background: url("../../static/imgs/myReport/general-arrow.png") no-repeat;
                background-size: 100% 100%;
            }
            .fame-box {
                position: absolute;
                top: 210rpx;
                left: 50%;
                transform: translateX(-50%);
                width: 651rpx*@x;
                min-height: 502rpx*@x;
                border-radius: 20rpx;
                background: #C2E5F8;
                padding: 10rpx 0;
                .fame-box-in {
                    width: 626rpx*@x;
                    min-height: 486rpx*@x;
                    border: 2px solid #10A0F7;
                    border-radius: 20rpx;
                    padding: 30rpx;
                    margin: 0 auto;
                    background: white;
					line-height: 45rpx;
					// #ifdef MP-WEIXIN
					text-indent: 2rem;
					// #endif
                    & p {
                        font-size: 32rpx;
                        color: #333333;
                        text-indent: 1.6rem;
                        line-height: 46rpx;
                        text-align: justify;
                        & a {
                            color: #10A0F7;
                            text-decoration: underline;
                        }
                    }
                }
                .copy-right {
                    position: absolute;
                    bottom: -92rpx;
                    width: 652rpx*@x;
                    height: auto;
                    text-align: center;
                    padding-bottom: 39rpx;
                    .copy-right-hr {
                        display: flex;
                        justify-content: space-between;
                        width: 100%;
                        height: 20rpx;
                        .lt-hr, .rt-hr {
                            width: 275rpx;
                            height: 1px;
							border-bottom: 1px dotted #E6E6E6;
                            margin-top: 16rpx;
                        }
                        .company {
                            width: 240rpx;
                            height: 20rpx;
                            font-size: 20rpx;
                            color: #999999;
                        }
                    }
                    .copy-right-title {
                        font-size: 20rpx;
                        color: #333333;
                        margin-top: 16rpx;
                    }
                }
            }
        }
    }
</style>
