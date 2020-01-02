<template name="helpCenter">
    <view>
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="backText"></block>
            <block slot="content">帮助中心</block>
        </cu-custom>
         <view class="wrapper">
            <view class="title">猜您想问</view>
            <view class="title-line"></view>
            <ul class="list-wrapper">
				<li class="question" v-for="(item, index) of questionList" :key="index" @tap="toAnswer(item.question)">
					<span>{{item.question}}</span>
					<view class="line"></view>
				</li>
            </ul>
		</view>
    </view>
</template>

<script>
export default {
	name: "index",
	data () {
		return {
			theme: 'red',
			questionList: [
				{id: 1, question: '如何理解报告评分？'},
				{id: 2, question: '红黑比是什么意思？'},
				{id: 3, question: '如何理解“关注点”、“风险点”？'},
				{id: 4, question: '声誉形象反映什么？'},
				{id: 5, question: '如何理解关联事件？'},
				{id: 6, question: '如何理解网信健康总评？'},
				{id: 7, question: '月报、季报、年报的区别？'},
				{id: 8, question: '如何理解“预警”事件？'}
				// {id: 8, question: '更多问题？'}
			]
		}
	},
	methods: {
		toAnswer: function (question) {
			console.log(question)
		  // this.$router.push({name: 'helpAnswer', params: {question: question, theme: this.theme}})
		  const url = '../helpCenterDetail/index?question=' + question;
		  uni.navigateTo({ url })
		}
	}
}
</script>

<style scoped lang="less">
.wrapper {
  width: 100%;
  height: 100%;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  position: relative;
  background: transparent;

  .title {
    width: 625px;
    padding-left: 55rpx;
    height: 62rpx;
    background: none;
    line-height: 62rpx;
    font-size: 32rpx;
    color: #000;
    font-weight: bold;
    margin-top: 30rpx;
  }

  .title-line {
    width: 94.44%;
    margin: 0 auto;
    height: 1rpx;
    border-top: 1rpx solid rgba(230, 230, 230, 1);
  }

  .list-wrapper {
    padding: 0 39rpx;
    margin-top: 0;
    list-style-type: none;

    .question {
      width: 100%;
      height: 98rpx;
      line-height: 96rpx;
      color: #333333;
      font-size: 30rpx;

      & span {
        margin-left: 16rpx;
      }

      .line {
        width: 100%;
        height: 2rpx;
        background: url("../../static/imgs/help/line1.png") no-repeat;
        background-size: 100% 100%;
      }
    }
  }
}
</style>