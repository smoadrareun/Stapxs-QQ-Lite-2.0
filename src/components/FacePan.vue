<!--
 * @FileDescription: 表情面板模板
 * @Author: Stapxs
 * @Date: missing
 * @Version: 1.0
-->

<template>
    <div class="ss-card face-pan">
        <BcTab>
            <div icon="fa-solid fa-face-laugh-squint">
                <div class="base-face">
                    <div v-for="num in baseFaceMax" :data-id='num'
                        v-show="getFace(num) != false"
                        :key="'base-face-' + num"
                        @click="addBaseFace(num)">
                        <img loading="lazy" :src="(getFace(num) as any)">
                    </div>
                </div>
            </div>
            <div icon="fa-solid fa-heart">
                <div class="face-stickers">
                    <img loading="lazy" v-for="(url, index) in runtimeData.stickerCache" @click="addImgFace(url)"
                        :key="'stickers-' + index" :src="url">
                    <div v-show="runtimeData.stickerCache && runtimeData.stickerCache.length <= 0" class=ss-card>
                        <font-awesome-icon :icon="['fas', 'face-dizzy']"/>
                        <span>{{ $t('chat_face_pan_none').split('|')[0] }}</span>
                    </div>
                </div>
            </div>
            <div icon="fa-solid fa-store">
                <div class="store-face-list">
                    <div v-for="face in storeFace" :key="face.emoji_id">
                        <font-awesome-icon @click="removeMface(face)" icon="fa-solid fa-xmark"/>
                        <img loading="lazy"
                            :src="face.url"
                            :title="face.summary"
                            @click="addMface(face)">
                    </div>
                </div>
            </div>
        </BcTab>
    </div>
</template>

<script lang="ts">
import { MsgItemElem, SQCodeElem } from '@/function/elements/information'
import { defineComponent } from 'vue'
import { runtimeData } from '@/function/msg'
import { Connector } from '@/function/connect'
import { getFace } from '@/function/utils/msgUtil'

import Option from '@/function/option'

import BcTab from 'vue3-bcui/packages/bc-tab'

export default defineComponent({
    name: 'FacePan',
    props: ['display'],
    components: {
        BcTab
    },
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
            this.storeFace = JSON.parse(decodeURIComponent(Option.getRaw('store_face') || '[]'))
        },
        removeMface(data: any) {
            const index = this.storeFace.findIndex((face) => face.emoji_id === data.emoji_id)
            if (index !== -1) {
                this.storeFace.splice(index, 1)
                Option.save('store_face', JSON.stringify(this.storeFace))
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
.store-face-list {
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: center;
    height: calc(300px - 120px);
    overflow-y: scroll;
}
.store-face-list > div {
    cursor: pointer;
    width: calc(25% - 15px);
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
    color: var(--color-font);
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
