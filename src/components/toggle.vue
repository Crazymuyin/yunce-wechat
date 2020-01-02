<template>
  <div>
    <div class="modalMask" v-if="toggleInfo.isModel"></div>
    <div class="modalDialog" v-if="toggleInfo.changeModel">
      <div class="closeContent">
        <img src="../static/imgs/home/icon_home_close.png" alt="" @tap="tapCancel">
      </div>
      <div class="titleContent">
        <p class="titleTip">{{toggleInfo.title}}</p>
      </div>
      <div class="modalContent">
        <p class="contentTitle">尊敬的云测用户： </p>
        <p class="contentTip">{{toggleInfo.val}}</p>
      </div>
      <div class="modalFooter">
        <div class="btnConfirm" @tap="confirmSend">{{toggleInfo.index === 2 ? '重测' : toggleInfo.index === 3 ? '我知道了' : '确定'}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      toggleInfo: Object
    },
    data() {
      return {
        changeModel: false,
        isModel: false,
        val: "",
        title: "",
        btnConfirm: ""
      };
    },
    methods: {
      tapCancel() {
        this.toggleInfo.changeModel = !this.toggleInfo.changeModel;
        this.toggleInfo.isModel = !this.toggleInfo.isModel;
        this.$emit('toggleTag', { state: false, key: this.toggleInfo.index })
      },
      confirmSend() {
        this.toggleInfo.changeModel = !this.toggleInfo.changeModel;
        this.toggleInfo.isModel = !this.toggleInfo.isModel;
        this.$emit('toggleTag', { state: true, key: this.toggleInfo.index})
      }
    }
  };
</script>

<style scoped>
  /* 弹窗开始 */
  .modalMask {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: #000;
    opacity: 0.5;
    overflow: hidden;
    z-index: 9000;
    color: #fff;
  }
  .modalDialog {
    box-sizing: border-box;
    width: 560rpx;
    overflow: hidden;
    position: fixed;
    top: 50%;
    left: 0;
    z-index: 9999;
    background: #fff;
    margin: -180rpx 95rpx;
    border-radius: 8rpx;
  }
  .closeContent {
    width: 100%;
    height: 21rpx;
    text-align: right;
    margin: 20rpx 0 10rpx 0;
  }
  .closeContent img {
    width: 22rpx;
    height: 21rpx;
    padding-right: 40rpx;
    cursor: pointer;
  }
  .titleContent {
    width: 100%;
    height: 74rpx;
    font-size: 36rpx;
    font-family: DroidSansFallback;
    font-weight: 400;
    color: rgba(29,130,210,1);
    line-height: 74rpx;
    text-align: center;
    background: url("../static/imgs/home/toggleBg.png") no-repeat center center;
    background-size: 240rpx 74rpx;
  }
  .modalContent {
    box-sizing: border-box;
    display: flex;
    padding: 30rpx 53rpx 50rpx 53rpx;
    font-size: 28rpx;
    align-items: left;
    justify-content: center;
    flex-direction: column;
  }
  .contentTitle {
    font-size: 28rpx;
    font-family: DroidSansFallback;
    font-weight: 400;
    color: rgba(51,51,51,1);
    line-height: 36rpx;
  }
  .contentTip {
    font-size: 28rpx;
    font-family: DroidSansFallback;
    font-weight: 400;
    color: rgba(102,102,102,1);
    line-height: 36rpx;
    margin-top: 20rpx;
  }
  .teleStyle {
    background: #ffffff;
    border: 1px solid #979797;
    border-radius: 6rpx;
    line-height: 50rpx;
    height: 50rpx;
    box-sizing: border-box;
    padding-left: 12rpx;
    width: 460rpx;
    font-size: 28rpx;
    margin-top: 30px;
  }
  .modalFooter {
    box-sizing: border-box;
    display: flex;
	justify-content: center;
    height: 100rpx;
    border-top: 1px solid #e5e5e5;
    font-size: 28rpx;
    line-height: 100rpx;
  }
  .btnConfirm {
    font-size: 28rpx;
    width: 50%;
    color: #508cee;
    text-align: center;
  }
</style>
