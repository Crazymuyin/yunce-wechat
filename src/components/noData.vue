<template>
    <view class="nodata" v-if="noData || noNet || noList">
        <img src="../static/imgs/public/noData.png" alt="" v-if="noData">
        <img src="../static/imgs/public/netError.png" alt="" v-if="noNet">
        <img class="noList" src="../static/imgs/public/kong.png" alt="" v-if="noList">
        <span>{{errorTip}}</span>
        <view class="refresh-btn" @tap="refreshRequest" v-if="!noList">重新加载</view>
    </view>
</template>

<script>
    export default {
        name: "noData",
        props: {
			noData: {
				type: Boolean,
				default: false
			},
			noNet: {
				type: Boolean,
				default: false
			},
			noList: {
				type: Boolean,
				default: false
			},
            errorTip: {
				type: String,
				default: ''
			}
        },
		methods: {
			refreshRequest() {
				this.$emit('refreshRequest')
			}
		}
    }
</script>

<style scoped lang="less">
    .nodata {
        width: 100%;
        height: 510rpx;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        text-align: center;
        display: flex;
        flex-flow: column;
        align-items: center;
		& img {
			width: 188rpx;
			height: 256rpx;
			margin-bottom: 40rpx;
		}
		& img, .noList {
			width: 188rpx;
			height: 206rpx;
			margin-bottom: 40rpx;
		}
		& span {
			font-size: 28rpx;
			color: #333;
		}
		& view {
			width: 190rpx;
			height: 61rpx;
			background: rgba(30,130,210,1);
			border-radius: 10rpx;
			line-height: 61rpx;
			font-size: 30rpx;
			color: #fff;
			margin-top: 122rpx;
		}
    }
</style>