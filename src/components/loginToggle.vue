<template>
  <div class="loginToggle">
    <div class="bg"></div>
    <div class="loginInput">
      <div class="box">
        <span>提示</span>
        <span>{{mobilePhone === true ? test : mobilePhone === false ? '授权手机号码可与App端数据同步' : ''}}</span>
        <!--<span @click="goToLogin">立即登录</span>-->
        <button v-if="mobilePhone === true" open-type="getUserInfo" @getuserinfo="bindGetUserInfo">立即登录</button>
        <div class="phoneBtn" v-if="mobilePhone === false">
          <button @click="cancelClick" style="background: #999999;border: none">取消</button>
          <button open-type="getPhoneNumber" @getphonenumber="bindGetPhoneNumber">确认授权</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapMutations, mapGetters} from 'vuex'
  import netWork from '../common/checkNet.js'
  export default {
    name: "loginToggle",
    data() {
      return {
        mobilePhone: true,
        mobilePhoneNum: '',
        nickName: '',
        avatarUrl: '',
        rawData: '',
        userInfo: ''
      }
    },
    props: {
		code: {
			type: String,
			default: ''
		},
		test: {
			type: String,
			default: ''
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
	  wxLoginWeChat() {
	  	let self = this;
		// #ifdef MP-WEIXIN
		if (self.code) {
			self.loginRequest();
		} else {
			wx.login({
				success(res) {
					if (res.code) {
						self.loginRequest(res.code);
					}
				}, fail(err) {
					wx.showToast({
						title: "wx.login失败" + err,
						icon: "none",
						duration: 1000
					});
				}
			});
		}
		// #endif
	  },
      bindGetUserInfo(e) {
        // wx.showLoading({title: "用户登录中..."});
		let _self = this
        netWork(function(res) {
			if (res) {
				if (e.mp.detail.userInfo) {
				  _self.rawData = e.mp.detail.rawData;
				  _self.userInfo = e.mp.detail.userInfo;
				  _self.mobilePhone = false;
				} else {
				  //用户按了拒绝按钮
				  _self.$emit('loginClose', true);
				}
			} else {
				wx.showToast({
					title: '请检查本地网络状态！',
					icon: 'none',
					duration: 2000
				})
				_self.$emit('loginClose', true);
			}
		})
      },
      bindGetPhoneNumber(e) {
        console.log(e.mp.detail)
        let detail = e.mp.detail;
        if (detail.errMsg.indexOf("ok") !== -1) {
          this.mobilePhoneNum = detail;
          this.wxLoginWeChat();
        } else {
          this.wxLoginWeChat()
        };
      },
      bindGetUserPhoto(e) {
        let rawData = JSON.parse(e.mp.detail.rawData);
        this.nickName = rawData.nickName;
        this.avatarUrl = rawData.avatarUrl;
      },
      loginRequest(code) {
        let self = this;
        wx.showLoading({title: "用户登录中..."});
		let params = {
          rawData: self.rawData,
          code: self.code ? self.code : code,
          encryptedData: self.mobilePhoneNum.encryptedData,
          iv: self.mobilePhoneNum.iv
        }
		self.userInfo = params;
        self.$http.post('/api/usercenter/user/wx/login', params).then(res => {
          // console.log(res)
          let dataInfo = res.data.data;
          self.userInfo.client_id = res.data.data.id;
          self.userInfo.openId = dataInfo.openId;
          self.userInfo.testNum = dataInfo.testNum;
          self.userInfo.uid = dataInfo.uid;
          self.userInfo.userType = dataInfo.userType;
          self.changeStatus(self.userInfo);
          self.isStatus(true);
          self.getToken(res.data.data.token);
			
		  wx.showToast({title: "登录成功", icon: "none", duration: 1000});
          self.$emit('loginClose', true);
          wx.hideLoading();
        }).catch(err => {
			wx.showToast({title: "登录失败", icon: "none", duration: 1000});
			self.$emit('loginClose', true);
        })
      },
      cancelClick() {
        this.loginRequest()
      },
      goToLogin() {
        const url = '../login/main';
        if (mpvuePlatform === 'wx') {
          mpvue.redirectTo({ url })
        }
      }
    }
  };
</script>

<style scoped lang="less">
.loginToggle {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  .bg {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  .loginInput {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 500rpx;
    height: 300rpx;
    background: white;
    z-index: 10001;
    transform: translate(-50%, -50%);
    .box {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      text-align: center;
      font-size: 28rpx;
      & span:first-child {
        padding: 20rpx 0;
        background: #cccccc;
      }
      & span:nth-child(2) {
        padding: 45rpx 0;
      }
      & span:last-child {
        width: 30%;
        border: 1px solid rgba(30,130,210,1);
        background: rgba(30,130,210,1);
        border-radius: 5rpx;
        color: white;
        padding: 10rpx 0;
        margin: 0 auto;
      }
      & button {
        width: 35%;
        height: 60rpx;
        line-height: 60rpx;
        border: 1px solid rgba(30,130,210,1);
        background: rgba(30,130,210,1);
        border-radius: 5rpx;
        color: white;
        margin: 0 auto;
        font-size:25rpx;
      }
      .phoneBtn {
        display: flex;
        justify-content: center;
        flex-direction: row;
      }
    }
  }
}
</style>
