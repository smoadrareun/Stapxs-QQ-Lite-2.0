<!--
 * @FileDescription: 表情面板模板
 * @Author: Stapxs
 * @Date: missing
 * @Version: 1.0
-->

<template>
    <div class="ss-card face-pan">
        <div class="layui-tab layui-tab-brief">
            <ul class="layui-tab-title chat-info-tab fase-pan-tab">
                <li class="layui-this">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M130.7 313.9C126.5 300.4 137.8 288 151.1 288H364.5C378.7 288 389.9 300.4 385.8 313.9C368.1 368.4 318.2 408 258.2 408C198.2 408 147.5 368.4 130.7 313.9V313.9zM208.4 192C208.4 209.7 194 224 176.4 224C158.7 224 144.4 209.7 144.4 192C144.4 174.3 158.7 160 176.4 160C194 160 208.4 174.3 208.4 192zM281.9 214.6C273.9 207 273.5 194.4 281 186.3C295.6 170.8 316.3 164 335.6 164C354.1 164 375.7 170.8 390.2 186.3C397.8 194.4 397.4 207 389.3 214.6C381.2 222.1 368.6 221.7 361 213.7C355.6 207.8 346.3 204 335.6 204C324.1 204 315.7 207.8 310.2 213.7C302.7 221.7 290 222.1 281.9 214.6zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z" /></svg>
                </li>
                <li v-if="runtimeData.stickerCache">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" /></svg>
                </li>
                <li v-if="storeFace.length > 0" @click="getStoreFaceList">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M547.6 103.8L490.3 13.1C485.2 5 476.1 0 466.4 0H109.6C99.9 0 90.8 5 85.7 13.1L28.3 103.8c-29.6 46.8-3.4 111.9 51.9 119.4c4 .5 8.1 .8 12.1 .8c26.1 0 49.3-11.4 65.2-29c15.9 17.6 39.1 29 65.2 29c26.1 0 49.3-11.4 65.2-29c15.9 17.6 39.1 29 65.2 29c26.2 0 49.3-11.4 65.2-29c16 17.6 39.1 29 65.2 29c4.1 0 8.1-.3 12.1-.8c55.5-7.4 81.8-72.5 52.1-119.4zM499.7 254.9l-.1 0c-5.3 .7-10.7 1.1-16.2 1.1c-12.4 0-24.3-1.9-35.4-5.3V384H128V250.6c-11.2 3.5-23.2 5.4-35.6 5.4c-5.5 0-11-.4-16.3-1.1l-.1 0c-4.1-.6-8.1-1.3-12-2.3V384v64c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V384 252.6c-4 1-8 1.8-12.3 2.3z"/></svg>
                </li>
                <!-- <li>3</li> -->
            </ul>
            <div class="layui-tab-content">
                <div class="layui-tab-item layui-show">
                    <div class="base-face">
                        <div v-for="num in baseFaceMax" :data-id='num'
                            v-show="getFace(num) != false"
                            :key="'base-face-' + num"
                            @click="addBaseFace(num)">
                            <img loading="lazy" :src="(getFace(num) as any)">
                        </div>
                    </div>
                </div>
                <div class="layui-tab-item" v-if="runtimeData.stickerCache">
                    <div class="face-stickers">
                        <img loading="lazy" v-for="(url, index) in runtimeData.stickerCache" @click="addImgFace(url)"
                            :key="'stickers-' + index" :src="url">
                        <div v-show="runtimeData.stickerCache && runtimeData.stickerCache.length <= 0" class=ss-card>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path
                                    d="M169.6 291.3C172.8 286.9 179.2 286.9 182.4 291.3C195.6 308.6 223.1 349 223.1 369C223.1 395 202.5 416 175.1 416C149.5 416 127.1 395 127.1 369C127.1 349 156.6 308.6 169.6 291.3H169.6zM368 346.8C377.9 355.6 378.7 370.8 369.9 380.7C361 390.6 345.9 391.4 335.1 382.6C314.7 363.5 286.7 352 256 352C242.7 352 232 341.3 232 328C232 314.7 242.7 304 256 304C299 304 338.3 320.2 368 346.8L368 346.8zM335.6 176C353.3 176 367.6 190.3 367.6 208C367.6 225.7 353.3 240 335.6 240C317.1 240 303.6 225.7 303.6 208C303.6 190.3 317.1 176 335.6 176zM175.6 240C157.1 240 143.6 225.7 143.6 208C143.6 190.3 157.1 176 175.6 176C193.3 176 207.6 190.3 207.6 208C207.6 225.7 193.3 240 175.6 240zM256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0zM175.9 448C200.5 458.3 227.6 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48C141.1 48 48 141.1 48 256C48 308.7 67.59 356.8 99.88 393.4C110.4 425.4 140.9 447.9 175.9 448V448z" />
                            </svg>
                            <span>{{ $t('chat_face_pan_none').split('|')[0] }}</span>
                        </div>
                    </div>
                </div>
                <div class="layui-tab-item" v-if="storeFace.length > 0">
                    <div class="store-face-list">
                        <div v-for="face in storeFace" :key="face.emoji_id">
                            <svg @click="removeMface(face)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                            <img loading="lazy"
                                :src="face.url"
                                :title="face.summary"
                                @click="addMface(face)">
                        </div>
                    </div>
                </div>
                <!-- <div class="layui-tab-item">3</div> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Connector } from '@/function/connect'
import { runtimeData } from '@/function/msg'

import Option from '@/function/option'
import { MsgItemElem, SQCodeElem } from '@/function/elements/information'
import { getFace } from '@/function/utils/msgUtil'
import option from '@/function/option'

export default defineComponent({
    name: 'FacePan',
    props: ['display'],
    data() {
        return {
            getFace: getFace,
            Option: Option,
            runtimeData: runtimeData,
            baseFaceMax: 348,
            storeFace: [] as {[type: string]: string}[]
        }
    },
    methods: {
        addSpecialMsg(json: MsgItemElem, addText: boolean) {
            this.$emit('addSpecialMsg', { addText: addText, msgObj: json } as SQCodeElem)
        },
        addBaseFace(id: number) {
            this.addSpecialMsg({ type: 'face', id: id }, true)
        },
        addImgFace(url: string) {
            this.addSpecialMsg({ type: 'image', file: url, cache: true, asface: true }, true)
        },
        addMface(data: any) {
            this.addSpecialMsg(data, true)
        },

        getStoreFaceList() {
            this.storeFace = JSON.parse(decodeURIComponent(option.getRaw('store_face') || '[]'))
        },
        removeMface(data: any) {
            const index = this.storeFace.findIndex((face) => face.emoji_id === data.emoji_id)
            if (index !== -1) {
                this.storeFace.splice(index, 1)
                option.save('store_face', JSON.stringify(this.storeFace))
            }
        }
    },
    mounted() {
        // 加载漫游表情
        if (runtimeData.stickerCache === undefined && runtimeData.jsonMap.roaming_stamp) {
            Connector.send(runtimeData.jsonMap.roaming_stamp.name, {}, 'getRoamingStamp')
        }
        this.getStoreFaceList()
    }
})
</script>
<style scoped>
.layui-tab-content {
    padding: 0 0 15px 0;
}
.store-face-list {
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: center;
    height: calc(300px - 100px);
    overflow-y: scroll;
}
.store-face-list > div {
    cursor: pointer;
    width: calc(20% - 10px);
    margin-right: 10px;
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}
.store-face-list > div:hover > svg {
    opacity: 0.8;
}
.store-face-list svg {
    width: 10px;
    height: 10px;
    fill: var(--color-font);
    margin-bottom: -12px;
    margin-right: -5px;
    opacity: 0;
    z-index: 1;
    background: var(--color-card-2);
    border-radius: 100px;
    padding: 5px;
    backdrop-filter: blur(15px);
    transition: opacity 0.3s;
}
.store-face-list svg:hover {
    opacity: 1;
}
.store-face-list img {
    border-radius: 7px;
    width: 100%;
    border: 2px solid var(--color-card-2);
}
</style>
