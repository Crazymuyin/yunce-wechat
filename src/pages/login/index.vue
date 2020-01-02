<template name="login">
    <view class="login">
        <img class="logoImg" src="../../static/imgs/public/icon_desktop.png" alt="">
        <view class="hr"></view>
        <view class="title">云测一下小程序 申请获取以下权限：</view>
        <view class="desc">
            <span class="disc"></span>
            <span class="content">{{mobilePhone ? "申请获取您的公开信息（昵称、头像等）" : "申请获取您的手机号码"}}</span>
        </view>
        <button v-if="!mobilePhone" open-type="getPhoneNumber" @getphonenumber="bindGetPhoneNumber">确认授权</button>
        <button v-if="mobilePhone" open-type="getUserInfo" @getuserinfo="bindGetUserInfo">确认登录</button>
    </view>
</template>

<script>
    import {mapMutations, mapGetters} from 'vuex'
    export default {
        name: "login",
        data() {
            return {
                code: '',
                mobilePhone: false,
                mobilePhoneNum: '',
                nickName: '',
                avatarUrl: ''
            }
        },
        onLoad(options) {
            const self = this;
            if (options.hasOwnProperty("code") && options.code) {
                self.code = options.code;
            } else {
                wx.login({
                    success (res) {
                        if (res.code){
                            self.code = res.code
                        }
                    },
                    fail (err) {
                        // console.log(`wx.login 获取Code失败:`, err);
                    }
                })
            }
        },
        computed: {
            ...mapGetters(["userInfo"]),
            ...mapGetters(["status"]),
            ...mapGetters(["token"])
        },
        methods: {
            ...mapMutations(["changeStatus"]),
            ...mapMutations(["isStatus"]),
            ...mapMutations(["getToken"]),
            bindGetUserInfo(e) {
                wx.showLoading({title: "用户登录中..."});
                const self = this;
                if (e.mp.detail.userInfo) {
                    // console.log(self.mobilePhoneNum)
                    self.bindGetUserPhoto(e);
                    let { rawData, userInfo } = e.mp.detail;
                    self.$http.post('/api/usercenter/user/wx/login',{
                        rawData,
                        code: self.code,
                        encryptedData: self.mobilePhoneNum.encryptedData,
                        iv: self.mobilePhoneNum.iv
                    }).then(res => {
                        // console.log(res)
                        let dataInfo = res.data.data;
                        userInfo.client_id = res.data.data.id;
                        userInfo.openId = dataInfo.openId;
                        userInfo.testNum = dataInfo.testNum;
                        userInfo.uid = dataInfo.uid;
                        userInfo.userType = dataInfo.userType;
                        self.changeStatus(userInfo);
                        self.isStatus(true);
                        self.getToken(res.data.data.token);

                        const url = '../index/main';
                        if (mpvuePlatform === 'wx') {
                            mpvue.redirectTo({ url })
                        }
                        wx.hideLoading();
                    }).catch(err => {
                        wx.hideLoading();
                        // console.log(`api请求出错:`,err);
                    })
                } else {
                    //用户按了拒绝按钮
                    wx.hideLoading();
                    // console.log('用户按了拒绝按钮');
                    const url = '../index/main';
                    if (mpvuePlatform === 'wx') {
                        mpvue.redirectTo({ url })
                    }
                }
            },
            bindGetPhoneNumber(e) {
                // console.log(e.mp.detail)
                let detail = e.mp.detail
                if (detail.errMsg.indexOf("ok") !== -1) {
                    this.mobilePhoneNum = detail
                };
                this.mobilePhone = true;
            },
            bindGetUserPhoto(e) {
                let rawData = JSON.parse(e.mp.detail.rawData);
                this.nickName = rawData.nickName;
                this.avatarUrl = rawData.avatarUrl;
            }
        }
    }
</script>

<style scoped lang="less">
    .login {
        display: flex;
        justify-content: center;
        flex-flow: column nowrap;
        align-items: center;
        border-top: 1px solid #cccccc;
        & img {
        }
        & img.logoImg {
            width: 168rpx;
            height: 168rpx;
            margin: 140rpx 0;
        }
        & div.hr {
            width: 570rpx;
            height: 1rpx;
            background-color: #cccccc;
            margin-bottom: 68rpx;
        }
        & div.title {
            width: 570rpx;
            height: 30rpx;
            font-size: 32rpx;
            font-family: DroidSansFallback;
            font-weight:400;
            color: rgba(51,51,51,1);
            text-align: left;
        }
        & div.desc {
            width: 570rpx;
            font-size: 28rpx;
            margin-top: 42rpx;
            color: #999999;
            & span.disc {
                display: block;
                width: 16rpx;
                height: 16rpx;
                background: #999999;
                border-radius: 50%;
                float: left;
                margin: 15rpx 16rpx 8rpx 0;
            }
            & span.content {
                width: 539rpx;
                float: left;
            }
        }
        & button {
            width: 80%;
            background-color: #1E82D2;
            color: white;
            margin-top: 68rpx;
        }
    }
</style>
