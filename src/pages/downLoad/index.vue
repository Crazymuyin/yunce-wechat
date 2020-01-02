<template name="downLoad">
    <view>
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="backText">返回</block>
            <block slot="content">软件下载</block>
        </cu-custom>
        <div class="downLoad">
            <web-view src="https://a.app.qq.com/o/simple.jsp?pkgname=com.lanjicloud.yc"></web-view>
        </div>
    </view>
</template>

<script>
    export default {
        data() {
            return {}
        },
        methods: {
            previewImage(e) {
                let current = e.target.dataset.src
                wx.previewImage({
                    current: current,
                    urls: [current]
                })
            }
        }
    };
</script>

<style scoped lang="less">
    .downLoad {
        display:flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        & img {
            width: 720rpx;
            height: 1280rpx;
        }
    }
</style>
