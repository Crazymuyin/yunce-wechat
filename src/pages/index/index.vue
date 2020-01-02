<template name="home">
  <view class="page searchHome">
    <cu-custom bgColor="bg-custom-nav" :isBack="false" :isTarget="false">
      <block slot="backText"></block>
      <block slot="content"></block>
    </cu-custom>
    <view class="logo">
      <img src="../../static/imgs/home/icon_homepage_logo.png" alt />
      <input type="text" placeholder-style="color: rgba(153,153,153,1);font-size: 16px;" v-model="searchTxt" placeholder="请输入测评对象"/>
    </view>
    <view class="desc">
      <p v-for="(vo, index) of desc" :key="index">{{vo}}</p>
    </view>
    <view class="searchClick">
      <span class="areaClick" @click="searchClick"></span>
      <img class="searchImg" src="../../static/imgs/home/ceshi_bai.png" alt />
    </view>
    <view class="history" @click="historyClick">历史测评</view>
    <view class="weui-footer footer">
      <p v-html="copyRight"></p>
    </view>
    <toggle :toggle-info="toggleInfo" @toggleTag="toggleTagTest"></toggle>
    <login-toggle v-if="loginState" :code="code" :test="test" @loginClose="loginClose"></login-toggle>
  </view>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import { sensitiveWords } from "../../utils/sensitiveWords";
import Toggle from "../../components/toggle";
import loginToggle from "../../components/loginToggle";

// userId 就是那个相对应的client_id 或 agent_id 或 capital_id
export default {
  	name: "index",
  	data() {
		return {
			searchTxt: "",
			TestProRealId: "",
			TestKeywords: "",
			toggleInfo: {
				changeModel: false,
				isModel: false,
				index: "",
				val: ""
			},
			indicatorDots: false,
			autoplay: false,
			canGetInfo: false, //授权状态，能否获取用户信息
			code: "", //wx.login拿回来的code
			test: "",
			loading: true,
			newClient: false, //新用户
			form: { name: "", tel: "" },
			isShow: false,
			desc: [
				"单位/职业/行业（空格）姓名（空格）手机号",
				"参考一：歌手  张学友",
				"参考二：IT  王五",
				"参考三：澜极智谷 张三 13900001111",
				"注：输入单位名称建议使用简称，例如四川大学，简称'川大'"
			],
			copyRight: "个人数据管理&nbsp;&nbsp;|&nbsp;&nbsp;网信健康体检",
			loginState: false
		};
	},
    components: {
        Toggle,
        loginToggle
    },
	onLoad() {
　　　　wx.onNetworkStatusChange(function (res) {
			if (res.networkType == 'none') {
				wx.showToast({
					title: '无法连接网络，请检查你的网络设置!',
					icon: 'none',
					duration: 2000
				})
				return false
			}
		})
		this.globalData.searchTxt = "";
		this.searchTxt = "";
		this.loading = true;
		this.canGetInfo = false;
		const self = this;

		if (!this.$store.getters.status) {
		self.wxLoginWeChat();
		} else {
		this.loginState = false;
		}
  	},
	onShow() {
		this.globalData.searchTxt = "";
		this.searchTxt = "";
	},
  	beforeMount() {},
  	created() {
		// this.toggleInfo = {
		//   changeModel: true,
		//   isModel: true,
		//   val: "我是弹窗的页面哦~",
		//   title: "提示"
		// }
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
			wx.showLoading({ title: "登录中..." });
			// this.getSetting();
			// #ifdef H5
			self.wxGetUserInfo("043INTre0UzIku13bdqe0JpVre0INTrG");
			// #endif
            // #ifdef MP-WEIXIN
			wx.login({
				success(res) {
					if (res.code) {
						self.code = res.code;
						self.wxGetUserInfo(res.code);
					}
				}, fail(err) {
				// console.log(`wx.login失败:`, err);
				// 需要提示用户手动点击button按钮进行授权
				wx.hideLoading();
				wx.showToast({
					title: "wx.login失败" + err,
					icon: "none",
					duration: 1000
					});
				}
			});
            // #endif
		},
		wxGetUserInfo(code) {
			const self = this;
            // #ifdef MP-WEIXIN
			wx.getUserInfo({
				withCredentials: true,
				success(res) {
				let { rawData, encryptedData, userInfo, iv } = res;
				self.$http.post("/api/usercenter/user/wx/login", {
						rawData,
						code,
						encryptedData,
						iv
					}).then(res => {
						// console.log(res)
						userInfo.client_id = res.data.data.id;
						userInfo.openId = res.data.data.openId;
						userInfo.testNum = res.data.data.testNum;
						userInfo.uid = res.data.data.uid;
						userInfo.userType = res.data.data.userType;
						self.changeStatus(userInfo);
						self.isStatus(true);
						self.getToken(res.data.data.token);
						wx.hideLoading();
						self.canGetInfo = true;
					}).catch(err => {
						wx.hideLoading();
						self.loading = false;
					});
				}, fail(err) {
					self.loading = false;
					wx.hideLoading();
				}
			});
            // #endif
		},
		getUserInfoClick() {
			this.loading = true;
			// wx.showLoading({
			//   title: '请求授权中...',
			// })
			// 判断小程序的API，回调，参数，组件等是否在当前版本可用。  为false 提醒用户升级微信版本
			// console.log(wx.canIUse('button.open-type.getUserInfo'))
			// if(wx.canIUse('button.open-type.getUserInfo')){
			//     // 用户版本可用
			//     console.log('当前版本open-type.getUserInfo可用:',);
			// }else{
			//     console.log('请升级微信版本')
			// }
		},
		bindGetUserInfo(e) {
			const self = this;
			if (e.mp.detail.userInfo) {
				let { rawData, encryptedData, userInfo, iv } = e.mp.detail;
				self.$http.post("/api/usercenter/user/wx/login", {
					rawData,
					code: self.code,
					encryptedData,
					iv
				}).then(res => {
					userInfo.client_id = res.data.data.id;
					userInfo.openId = res.data.data.openId;
					userInfo.testNum = res.data.data.testNum;
					userInfo.uid = res.data.data.uid;
					userInfo.userType = res.data.data.userType;
					self.changeStatus(userInfo);
					self.isStatus(true);
					self.getToken(res.data.data.token);
					wx.hideLoading();
					self.canGetInfo = true;
				}).catch(err => {
					self.loading = false;
					wx.hideLoading();
				});
			} else {
				//用户按了拒绝按钮
				self.loading = false;
				wx.hideLoading();
			}
		},
		bindGetPhoneNumber(e) {
			// console.log(e)
		},
		getSetting() {
			const self = this;
			wx.getSetting({
				success: function(res) {
					if (res.authSetting["scope.userInfo"]) {
						// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
						self.canGetInfo = true;
						wx.getUserInfo({
						success: function(res) {
							//用户已经授权过
						},
						fail: res => {
							// console.log(res)
						}
						});
					} else if (res.authSetting["scope.userInfo"] === false) {
						wx.openSetting({
						success: res => {
							// console.log(res)
						},
						fail: res => {
							// console.log(res)
						}
						});
					} else {
						wx.getUserInfo({
							success: res => {
								// console.log(res)
							},
							fail: res => {
								// console.log(res)
								wx.openSetting({
									success: res => {
										// console.log(res)
									},
									fail: res => {
										// console.log(res)
									}
								});
							}
						});
					}
				},
				fail(err) {
				// console.log(`未授权 err:`,err);
				}
			});
		},
		loginClose(state) {
			this.loginState = false;
		},
		searchClick() {
            // #ifdef MP-WEIXIN
			if (this.$store.getters.status) {
				if (this.$store.getters.userInfo.testNum) {
					if (this.searchTxt) {
						let keyArr = sensitiveWords();
						let searchTextCheck = this.searchTxt.split(" ").join("");
						if (searchTextCheck.length) {
						let searchArrCheck = this.searchTxt.split(" ");
						let r = searchArrCheck.filter(function(s) {
							return s && s.trim();
						});
						for (let i in keyArr) {
							if (keyArr[i].indexOf(searchTextCheck) !== -1 || keyArr[i].indexOf(r[1]) !== -1) {
								this.searchTxt = "";
								this.toggleInfo = {
									changeModel: true,
									index: 4,
									isModel: true,
									val: "暂不支持对该对象的测试,请重新输入",
									title: "很抱歉"
								};
								return;
							}
						}
						} else {
							this.searchTxt = "";
							this.toggleInfo = {
								changeModel: true,
								index: 4,
								isModel: true,
								val: "请输入测评对象",
								title: "提示"
							};
							return;
						}
						wx.showLoading({ title: "正在加载" });
						if (this.searchTxt.split(" ").length > 1) {
							let params = {
								keyWords: this.searchTxt,
								userId: this.$store.getters.userInfo.client_id,
								retest: 0,
								isVip: this.$store.getters.userInfo.userType,
                                testNum: this.$store.getters.userInfo.testNum
							};
							let url = `/api/healthmaster/search`;
							const self = this;
							self.$http.get(url, params).then(function(res) {
								wx.hideLoading();
								if (res.data.status === 1) {
									let data = res.data.data;
									if (data.hasOwnProperty("date") && data.date > 0) {
										let id = data.id;
										let testNum = data.testNum;
										let userId = data.userId;
										let date = data.date;
										let exited = data.exited;
										let extraNum = data.extraNum;
										let params = {};
										const url = "../testing/index?first=true&userId=" + userId + "&realId=" + id + "&keywords=" + self.searchTxt;
                                        uni.navigateTo({ url });
									} else if (data.hasOwnProperty("canTest") && !data.canTest && res.data.message === "超过测试次数限制") {
										self.globalData.searchTxt = "";
										self.searchTxt = "";
										self.toggleInfo = {
											changeModel: true,
											index: 3,
											isModel: true,
											val: "体验测试次数已用完，下载APP享受更多次数。",
											title: "很抱歉"
										};
									} else if (data.hasOwnProperty("canTest") && !data.canTest) {
										self.globalData.searchTxt = "";
										self.searchTxt = "";
										self.toggleInfo = {
											changeModel: true,
											index: 3,
											isModel: true,
											val: res.data.message,
											title: "提示"
										};
									} else if (data.date === -1) {
										self.globalData.searchTxt = "";
										self.searchTxt = "";
										self.TestProRealId = data.proRealId;
										self.TestKeywords = data.keyWords;
										self.toggleInfo = {
											changeModel: true,
											index: 1,
											isModel: true,
											val: res.data.message,
											title: "提示"
										};
									} else {
										// self.toggleInfo = { changeModel: true, isModel: true, val: res.data.message, title: "警告" }
									}
								} else if (res.data.status === 2) {
									self.globalData.searchTxt = "";
									self.searchTxt = "";
									self.wxLoginWeChat();
									wx.showToast({
										title: "身份登录过期，正在重新登录",
										icon: "none",
										duration: 10000
									});
									setTimeout(function() {
										wx.hideToast();
									}, 2000);
								} else {
									self.globalData.searchTxt = "";
									self.searchTxt = "";
									wx.showToast({
										title: "系统繁忙",
										icon: "none",
										duration: 10000
									});
									setTimeout(function() {
										wx.hideToast();
									}, 2000);
								}
							});
						} else {
							this.globalData.searchTxt = "";
							this.searchTxt = "";
							wx.showToast({
								title: "输入的参数格式不对,请重新输入!",
								icon: "none",
								duration: 10000
							});
							setTimeout(function() {
								wx.hideToast();
							}, 2000);
						}
					} else {
						this.globalData.searchTxt = "";
						this.searchTxt = "";
						this.toggleInfo = {
							changeModel: true,
							index: 4,
							isModel: true,
							val: "请输入测试对象",
							title: "提示"
						};
					}
				} else {
					this.globalData.searchTxt = "";
					this.searchTxt = "";
					this.toggleInfo = {
						changeModel: true,
						index: 3,
						isModel: true,
						val: "体验测试次数已用完，下载APP享受更多次数。",
						title: "很抱歉"
					};
				}
			} else {
				this.loginState = true;
				this.test = '登录后您才能进行测评！'
			}
            // #endif
		},
		toggleTagTest(boolObj) {
			if (boolObj.state && boolObj.key === 1) {
				const url = "../testing/index?first=true&userId=" + this.$store.getters.userInfo.client_id + "&realId=" + this.TestProRealId + "&keywords=" + this.TestKeywords;
                uni.navigateTo({ url });
			} else if (boolObj.state && boolObj.key === 3) {
              this.toggleInfo.changeModel = !boolObj.state;
              this.toggleInfo.isModel = !boolObj.state;
			} else if (boolObj.state && boolObj.key === 4) {
              this.toggleInfo.changeModel = !boolObj.state;
              this.toggleInfo.isModel = !boolObj.state;
			} else {
              this.toggleInfo.changeModel = boolObj.state;
              this.toggleInfo.isModel = boolObj.state;
            }
		},
		historyClick() {
			if (this.$store.getters.status) {
				const url = "../history/index";
				// #ifdef MP-WEIXIN
				uni.navigateTo({ url });
				// #endif
			} else {
				this.loginState = true;
				this.test = '登录后才能查看历史测评！'
			}
		},
		downApk() {
			const downloadTask = wx.downloadFile({
				url: "https://yunce3.lanjicloud.com/yunce/apks/yunce240.apk",
				header: {
					Token: this.$store.getters.token
				},
				success(res) {
					if (res.statusCode === 200) {
						wx.openDocument({
							filePath: res.tempFilePath,
							success(res) {
								// console.log(res)
							},
							fail(res) {
								// console.log(res)
							}
						});
					}
				}
			});
			downloadTask.onProgressUpdate(res => {});
		}
	}
};
</script>

<style scoped>
.searchHome {
  width: 100%;
  height: 100%;
}
.searchHome .logo {
  position: relative;
  width: 100%;
  height: 400rpx;
  text-align: center;
  background: #1E82D2;
}
.searchHome .logo img {
  width: 220rpx;
  height: 194rpx;
  padding-top: 40rpx;
}
.searchHome .logo input {
  position: absolute;
  width: 600rpx;
  height: 80rpx;
  padding: 5rpx 20rpx;
  text-align: left;
  background: rgba(255,255,255,1);
  border: 2px solid rgba(30,130,210,1);
  border-radius: 8px;
  left: 50%;
  bottom: -10%;
  transform: translateX(-50%);
}
.searchHome .desc {
  width: 600rpx;
  height: 131rpx;
  font-size: 24rpx;
  font-weight: 400;
  color: rgba(128,128,128,1);
  line-height: 30rpx;
  margin: 80rpx auto;
  text-align: justify;
}
.searchHome .searchClick {
  width: 100%;
  height: auto;
  text-align: center;
  position: relative;
}
.searchHome .areaClick {
  background-color: transparent;
  display: block;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  top: 43%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  z-index: 100;
}
.searchHome .searchClick img.searchImg {
  width: 520rpx;
  height: 320rpx;
}
.searchHome .history {
  position: absolute;
  bottom: 120rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 177rpx;
  height: 66rpx;
  margin: 0 auto;
  background: #4aa5ee;
  border-radius: 10rpx;
  color: white;
  text-align: center;
  line-height: 66rpx;
  font-size: 14px;
}
.searchHome .footer {
  position: absolute;
  bottom: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
}
</style>
