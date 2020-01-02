<template name="helpCenterDetail">
    <view>
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="backText"></block>
            <block slot="content">帮助中心</block>
        </cu-custom>
        <view class="wrapper">
            <view class="title">{{questionName}}</view>
            <view class="title-line"></view>
            <view class="content" v-for="(answer, index) of answerList" :key="index" v-if="answer.question === questionName">
				<image width="100%" :src="answer.img" mode="widthFix"></image>
				<view v-html="answer.answer" style="text-align: justify"></view>
				<br/>
            </view>
        </view>
    </view>
</template>

<script>
export default {
	name: "index",
	data () {
		return {
			questionName: '',
			answerList: [
				{
				  question: '如何理解报告评分？',
				  img: require('../../static/imgs/help/blue_one.png'),
				  answer: '<p style="text-indent:2em; margin: 0;">“报告评分”是“测评对象”的网信健康综合评测结果，是测评对象网信健康状态的最直观反映。</p>' +
					'<p style="text-indent:2em; margin: 0;">“报告评分”位于“测评报告”的顶部位置，由评测分值、星级符号“★”、健康状态等三个相互关联的部分组成。其中，健康状态由好到差分为5个等级，分别是：健康、良好、亚健康、微恙、危重。评测分值越大，“★”数越多，测评对象的网信环境越安全。</p>' +
					'<p style="text-indent:2em; margin: 0;">当健康等级为健康、良好时，说明测评对象的网信健康处于安全线内，但需持续关注健康变化，及时发现风险苗头。</p>' +
					'<p style="text-indent:2em; margin: 0;">当健康等级为亚健康、微恙或危重时，说明测评对象的网信健康已亮起红灯，可使用“应对建议”功能获取帮助，快速有效处理风险问题。</p>'
				}, {
				  question: '红黑比是什么意思？',
				  img: require('../../static/imgs/help/blue_two.png'),
				  answer: '<p style="text-indent:2em; margin: 0;">“红黑比”反映的是关注“测评对象”的人群对其的支持程度。其中，对测评对象持喜欢、欣赏、赞同等正向态度的网民为“红粉”，其数量占比与红色色条长度对应；对测评对象持厌恶、抵制、批评等负向态度的网民为“黑粉”，其数量占比与黑色色条长度对应。</p>' +
					'<p style="text-indent:2em; margin: 0;">红色色条越长，“测评对象”的网民支持度越高；反之，“测评对象”的网民支持度越低；红色色条与黑色色条长度差距不大时（红黑数量的占比相差在10个百分点内），说明“测评对象”的网络形象毁誉参半。</p>'
				}, {
				  question: '如何理解“关注点”、“风险点”？',
				  img: require('../../static/imgs/help/blue_three.png'),
				  answer: '<p style="text-indent:2em; margin: 0;">“关注点”是指多数网民对“测评对象”的主要评价方向，包括外表、品格、能力等，详细的评价内容可于“声誉形象”版块查看。</p>' +
					'<p style="text-indent:2em; margin: 0;">“风险点”是对“测评对象”当前存在的主要问题的总结，例如作风问题、司法问题、素质问题等，问题详情在“关联事件”版块有具体展现。</p>'
				}, {
				  question: '声誉形象反映什么？',
				  img: require('../../static/imgs/help/blue_four.png'),
				  answer: '<p style="text-indent:2em; margin: 0;">“声誉形象”是网民对“测评对象”的主观评价与喜恶反映，即在网民眼中“测评对象”是一个什么样的人，网民是否喜欢“测评对象”。</p>' +
					'<p style="text-indent:2em; margin: 0;">“声誉形象”以评价标签的形式展示“测评对象”在网络上的综合形象，评价内容涉及“测评对象”的外表、气质、心性、品格、行为、能力等各个方面。</p>'
				}, {
				  question: '如何理解关联事件？',
				  img: require('../../static/imgs/help/blue_five.png'),
				  answer: '<p style="text-indent:2em; margin: 0;">“关联事件”是指“测评对象”近期发生的所有舆情事件，包括正面事件与风险事件。</p>' +
					'<p style="text-indent:2em; margin: 0;">“风险事件”是指经过系统分析判断后认定对“测评对象”存在负面危害的事件，“预警事件”是其中危害性较大的一类事件。</p>' +
					'<p style="text-indent:2em; margin: 0;">点击“全部事件”、“风险事件”、“预警事件”可查看对应的事件列表。在事件列表中点击“事件名称”，可查看该事件的详细信息，例如，事件类型、事件概要、' +
					'舆情传播趋势、传播平台分布、事件相关信息等。其中，针对作风问题、发展问题、司法问题等风险事件，对其风险发展变化状态进行了重点分析与研判，为用户舆情应对处置提供决策参考。</p>'
				}, {
				  question: '如何理解网信健康总评？',
				  img: require('../../static/imgs/help/blue_six.png'),
				  answer: '<p style="text-indent:2em; margin: 0;">“网信健康总评”是“测评对象”网信健康的总结性评估报告。</p>' +
					'<p style="text-indent:2em; margin: 0;">总评包含：</p>' +
					'<p style="text-indent:2em; margin: 0;">1）测评对象当前的网信健康状态，以及与历史健康值环比结果，直观反映测评对象的网信健康是否正在恶化，帮助用户及时止损；</p>' +
					'<p style="text-indent:2em; margin: 0;">2）网民对测评对象的支持程度，以及网民对测评对象的主要关注方向，帮助用户及时调整舆论宣传引导策略，契合网民关切要点；</p>' +
					'<p style="text-indent:2em; margin: 0;">3）测评对象当前阶段的所有网信数据以及需要重点关注的风险事件，并重点指出风险事件的分布及变化状况，帮助用户有针对性地处置风险；</p>' +
					'<p style="text-indent:2em; margin: 0;">4）网信健康管理策略建议，帮助用户进行个人舆情综合管理。</p>'
				}, {
				  question: '月报、季报、年报的区别？',
				  img: require('../../static/imgs/help/blue_seven.png'),
				  answer: '<p style="text-indent:2em; margin: 0;">月报、季报、年报均为“测评对象”的网信健康测评报告。</p>' +
					'<p style="text-indent:2em; margin: 0;">月报：根据“测评对象”近1个月内数据生成，帮助用户快速掌握当前风险状态；其特点是即时性强，适用对象为所有用户。</p>' +
					'<p style="text-indent:2em; margin: 0;">季报：根据“测评对象”近3个月内数据生成，既能掌握当前风险状态，保证报告的即时性，也能跟踪风险事件的短期发展变化；报告偏重持续风险管理，适用对象为VIP用户；</p>' +
					'<p style="text-indent:2em; margin: 0;">年报：根据“测评对象”近1年内数据生成；报告既保证了风险管理的即时性与风险观察的持续性，对历史风险问题的附加风险影响也予以了充分关注；适用对象为VIP用户。</p>'
				}, {
				  question: '如何理解“预警”事件？',
				  img: require('../../static/imgs/help/blue_eight.png'),
				  answer: '<p style="text-indent:2em; margin: 0;">“预警”是对测评对象近期重大风险事件的即时提醒，用户需对相关事件保持持续关注，并及时处置。</p>' +
					'<p style="text-indent:2em; margin: 0;">“预警”内容包括风险分布和预警事件：</p>' +
					'<p style="text-indent:2em; margin: 0;">风险分布反映测评对象相关的所有预警事件的风险类型的分布情况，包括测评对象近期内在司法、发展、作风、素质等方面的风险问题；</p>' +
					'<p style="text-indent:2em; margin: 0;">预警事件包括测评对象近期内所有关联事件中达到预警阈值的风险事件，需要测评对象对其进行重点关注，帮助用户及时发生风险，并对其积极进行应对处置；</p>' +
					'<p style="text-indent:2em; margin: 0;">一级预警、二级预警、三级预警由高到低反映测评对象相关的预警事件的风险级别，其中，一级预警事件的风险程度最高，需对其优先处理。</p>'
				}
			],
		}
	},
	onLoad(option) {
		this.questionName = option.question
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
    width: 625rpx;
    padding-left: 55rpx;
    height: 62rpx;
    line-height: 62rpx;
    background: none;
    font-size: 32rpx;
    font-weight: bold;
    color: #000;
	margin-top: 30rpx;
  }
  
  .title-line {
    width: 94.44%;
    margin: 0 auto;
    height: 1rpx;
    border-top: 1rpx solid rgba(230, 230, 230, 1);
  }
  
  .content {
    width: 89.17%;
    height: auto;
    margin: 25rpx auto;
    font-size: 28rpx;
    line-height: 48rpx;
    color: #333333;
	& image {
      width: 100%;
    }
  }
}
</style>
