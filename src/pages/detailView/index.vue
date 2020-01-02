<template name="detailView">
    <view>
        <cu-custom bgColor="bg-custom-nav" :isBack="true">
            <block slot="backText">返回</block>
            <block slot="content">详情页面</block>
        </cu-custom>
        <view class="detailView">
            <view class="title">{{dataInfo.title}}</view>
            <view class="tools">
                <span>{{dataInfo.author}}</span>&nbsp;&nbsp;&nbsp;&nbsp;
                <span>{{dataInfo.publishDate}}</span>
                <!--<span @click="readDefault(dataInfo.url)">查看原文</span>-->
            </view>
            <view class="content" v-html="dataInfo.content"></view>
            <view class="footer"></view>
        </view>
    </view>
</template>

<script>
    export default {
        name: "detailView",
        data() {
            return {
                dataInfo: {}
            }
        },
        onLoad(options) {
            let id = options.id;
            this.viewRequest(id);
        },
        onUnload() {
            this.dataInfo = {}
        },
        methods: {
            viewRequest(id) {
                wx.showLoading({title: '玩命加载中'});
                let params = {
                    id: id,
                    userId: this.$store.getters.userInfo.client_id,
                    searchKey: this.globalData.searchTxt
                };
                let url = `/api/search/dataInfo/list/data`;
                this.$http.get(url, params).then(res => {
                    if (res.data.status === 1) {
                        if (res.data.data.data) {
                            let keyWords = res.data.data.keyWords;
                            let content = res.data.data.data;
                            content.content = this.taggingText(keyWords, content.content);
                            this.dataInfo = content;
                            wx.hideLoading();
                        }
                    } else {
                        wx.hideLoading();
                    }
                })
            },
            taggingText(keyArr, content) {
                if (Array.isArray(keyArr) && keyArr.length) {
                    for (let i = 0; i < keyArr.length; i++) {
                        if (content) {
                            let regExp = new RegExp(keyArr[i], 'g');
                            content = content.replace(regExp, "<span style='color: #CB1D17'>" + keyArr[i] + "</span>")
                        }
                    }
                }
                return content
            }
        }
    }
</script>

<style scoped lang="less">
    .detailView {
        width: 90%;
        height: 100%;
        margin: 0 auto;
        .title {
            width: 100%;
            height: auto;
            text-align: center;
            font-size: 36rpx;
            padding: 20rpx 0 20rpx 0;
        }
        .tools {
            display: flex;
            justify-content:center;
            width: 100%;
            height: auto;
            text-align: center;
            font-size: 15px;
            padding: 0 0 20rpx 0;
        }
        .content {
            width: 100%;
            height: auto;
            font-size: 16px;
            line-height: 24px;
            text-align: justify;
            text-align-last: left;
			text-indent: 2em;
        }
        .footer {
            width: 100%;
            height: 50rpx;
            background-color: transparent;
        }
    }
</style>
