<template name="report">
    <view>
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="backText">返回</block>
            <block slot="content">测试报告</block>
        </cu-custom>
        <div class="report">
            <div class="portrait">
                <img src="../../static/imgs/report/img_mine_head.png" alt="">
            </div>
            <div class="reportNum">{{reportNumber}}</div>
            <div class="startList clearfix">
                <div class="layout clearfix" v-if="nickName">
                    <span>{{nickName}}:</span>
                    <ul class="clearfix">
                        <li v-for="(list, index) of startNumber" :class="list ? list : 'default'" :key="index"></li>
                    </ul>
                    <span class="level" :class="levelType"></span>
                </div>
            </div>
            <div class="content" v-html="content"></div>
            <div class="commentMore">报告根据1月内数据生成</div>
        </div>
    </view>
</template>

<script>
    export default {
        name: "report",
        data() {
            return {
                nickName: '',
                reportNumber: "",
                startNumber: [],
                content: "",
                levelType: ""
            }
        },
        onLoad(options) {
            let userId = options.userId;
            let realId = options.realId;
            this.electDataByIdRequest(userId, realId);
        },
        methods: {
            electDataByIdRequest(userId, realId) {
                let self = this;
                let url = "/api/healthrisk/evaluateResult/selectDataById?resultType=1&userId="+userId+"&realId="+realId+"&isUpdate=" + this.globalData.isUpdate;
                this.$http.get(url).then((res) => {
                    let data = res.data;
                    if (data.status === 1) {
                        let starNum = data.data.starNum;
                        let healthStatus = data.data.healthStatus;

                        self.nickName = data.data.nickName;
                        self.reportNumber = data.data.riskValue ? data.data.riskValue + "分" : "--分";

                        if (starNum === 0) {
                            this.startNumber = ["", "", "", "", ""]
                        } else if (starNum > 0 && starNum < 1) {
                            this.startNumber = ["half", "", "", "", ""];
                        } else if (starNum === 1) {
                            this.startNumber = ["also", "", "", "", ""];
                        } else if (starNum > 0 && starNum < 2) {
                            this.startNumber = ["also", "half", "", "", ""];
                        } else if (starNum === 2) {
                            this.startNumber = ["also", "also", "", "", ""];
                        } else if (starNum > 2 && starNum < 3) {
                            this.startNumber = ["also", "also", "half", "", ""];
                        } else if (starNum === 3) {
                            this.startNumber = ["also", "also", "also", "", ""];
                        } else if (starNum > 3 && starNum < 4) {
                            this.startNumber = ["also", "also", "also", "half", ""];
                        } else if (starNum === 4) {
                            this.startNumber = ["also", "also", "also", "also", ""];
                        } else if (starNum > 4 && starNum < 5) {
                            this.startNumber = ["also", "also", "also", "also", "half"];
                        } else if (starNum === 5) {
                            this.startNumber = ["also", "also", "also", "also", "also"];
                        }

                        if (healthStatus === "健康") {
                            this.levelType = "health"
                        } else if (healthStatus === "良好") {
                            this.levelType = "fine";
                        } else if (healthStatus === "亚健康") {
                            this.levelType = "subhealthy";
                        } else if (healthStatus === "微恙") {
                            this.levelType = "ailment";
                        } else if (healthStatus === "危重") {
                            this.levelType = "damage"
                        }

                        self.content = '<p>' + data.data.riskDesc.replace(/(\r\n|\n|\r)/g, '</p><p>') + '</p>';
                    }
                })
            }
        }
    }
</script>

<style scoped>
    .report {
        width: 100%;
        height: 100%;
    }
    .report .portrait {
        width: 100%;
        height: 210rpx;
        padding-top: 150rpx;
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
</style>
