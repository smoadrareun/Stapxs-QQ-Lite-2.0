<!--
 * @FileDescription: 关于模板
 * @Author: Stapxs
 * @Date: 2024/04/22
 * @Version: 1.0
-->

<template>
    <div class="about-pan">
        <div id="logo-card" :class="'ss-card logo-card' + (showUI ? '' : ' hidd-sha')">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
                y="0px" viewBox="0 0 1080 1080" style="enable-background:new 0 0 1080 1080;" xml:space="preserve">
                <g id="圖層_2">
                    <circle class="st0" cx="537" cy="543" r="537"></circle>
                </g>
                <g id="圖層_1">
                    <path class="st1"
                        d="M546.6,774.4c-46.5,0-89.1-15.5-116.6-38.8c-13.9,4.2-31.8,10.9-43,19.2c-9.6,7.1-8.4,14.4-6.7,17.3c7.6,12.9,130.7,8.2,166.3,4.2V774.4z M546.6,774.4c46.5,0,89.1-15.5,116.6-38.8c13.9,4.2,31.8,10.9,43,19.2c9.6,7.1,8.4,14.4,6.7,17.3c-7.6,12.9-130.7,8.2-166.3,4.2V774.4z">
                    </path>
                    <path class="st1"
                        d="M546.9,496c76.7-0.5,138.2-15.4,159-21.1c5-1.4,7.6-3.8,7.6-3.8c0-0.7,0.3-12.5,0.3-18.6c0-102.4-48.3-205.3-167.3-205.3c-118.9,0-167.3,102.9-167.3,205.3c0,6.1,0.3,17.9,0.3,18.6c0,0,2.2,2.3,6.1,3.4c19.2,5.4,81.9,20.9,160.5,21.5H546.9z M755.4,581.3c-4.8-15.3-11.2-33.2-17.8-50.3c0,0-3.8-0.5-5.7,0.1c-59,17.1-130.5,28.1-185,27.4h-0.6c-54.2,0.6-125.2-10.1-184-27.1c-2.2-0.6-6.7-0.4-6.7-0.4c-6.6,17.1-13.1,35-17.8,50.3c-22.7,73-15.3,103.2-9.7,103.9c12,1.5,46.7-54.9,46.7-54.9c0,57.3,51.7,145.3,170.2,146.1h3.1c118.5-0.8,170.2-88.8,170.2-146.1c0,0,34.7,56.4,46.7,54.9C770.7,684.5,778,654.3,755.4,581.3">
                    </path>
                    <path class="st1"
                        d="M504.3,398.5c-16.1,0.7-29.9-17.6-30.8-41c-0.9-23.4,11.5-42.9,27.6-43.6c16.1-0.7,29.9,17.6,30.8,41C532.8,378.3,520.4,397.8,504.3,398.5 M619.7,357.5c-0.9,23.4-14.6,41.7-30.8,41c-16.1-0.7-28.5-20.3-27.6-43.6c0.9-23.4,14.6-41.7,30.8-41C608.2,314.6,620.6,334.1,619.7,357.5 M322.4,247.2">
                    </path>
                    <path class="st1"
                        d="M524.1,357.9c0.7,9.2-4.3,17.4-11.3,18.3c-7,0.9-13.2-5.9-14-15.1c-0.7-9.2,4.3-17.4,11.3-18.3C517.1,341.9,523.4,348.6,524.1,357.9 M568.4,360.9c1.4-2.6,11.1-16,31.2-11.1c5.3,1.3,7.7,3.2,8.2,3.9c0.8,1.1,1,2.7,0.2,4.8c-1.5,4.2-4.7,4.1-6.4,3.2c-1.1-0.5-15.1-9.9-28,4.1c-0.9,1-2.5,1.3-4,0.1C568.2,364.8,567.6,362.5,568.4,360.9">
                    </path>
                    <path class="st1"
                        d="M546.9,555.1h-0.6c-37.1,0.4-82-4.5-125.5-13c-3.7,21.6-6,48.7-4,81c4.9,81.7,53.4,133.1,128.3,133.8h3c74.9-0.7,123.4-52.1,128.3-133.8c1.9-32.3-0.3-59.4-4-81C628.9,550.7,584,555.6,546.9,555.1">
                    </path>
                    <path class="st1"
                        d="M441.4,548.3v80.4c0,0,36.8,7.4,73.7,2.3v-74.2C491.7,555.5,466.5,552.6,441.4,548.3">
                    </path>
                    <path class="st1"
                        d="M713.6,471.1c0,0-71.6,22.6-166.7,23.3h-0.6c-94.9-0.6-166.4-23.2-166.7-23.3l-24,59.9c60,18.1,134.4,29.8,190.6,29.1h0.6c56.2,0.7,130.6-11,190.7-29.1L713.6,471.1z">
                    </path>
                </g>
            </svg>
            <div>
                <span>{{ $t('name') }}</span>
                <a>2.0</a>
            </div>
            <span style="text-align: center;">{{ $t('description') }}</span>
            <a>v{{ packageInfo.version }}</a>
            <div class="buttons">
                <a class="ss-button" @click="openLink('https://github.com/Stapxs/Stapxs-QQ-Lite-2.0')">{{
                $t('option_info_visit_github') }}</a>
                <a class="ss-button" style="width: 30px;" @click="openLink('https://blog.stapxs.cn/About.html')">
                    <font-awesome-icon :icon="['fas', 'circle-info']"/>
                </a>
            </div>
            <div v-if="constList.length > 0" class="ss-card contributors-card">
                <div>
                    <div v-for="info in constList" :key="'contributors-' + info.title" :title="info.title"
                        :style="'background-image: url(' + info.url + ');'" :class="(info.isMe ? 'me' : '') + (info.isSuperThakns ? ' super-thanks' : '')"
                        @click="openLink(info.link)"></div>
                </div>
            </div>
        </div>
        <div class="ss-card jump-card" @click="dependencies" :style="showUI ? '' : 'background: var(--color-card-1);'">
            <header><div></div>{{ $t('list_of_dependencies') }}</header>
            <font-awesome-icon :icon="['fas', 'angle-right']"/>
        </div>
        <div v-if="showUI" class="ss-card bcd-about" @click="openLink('https://stapxs.github.io/Border-Card-UI/docs/')">
            <div>
                <div>
                    <div class="bcd-body"
                        style="width: 45%;display: flex;justify-content: flex-end;border-radius: 0 5px 0 0;">
                        <div
                            style="background:var(--color-card-2);border-radius: 16px;width: 25%;margin: 5px 0 5px 5px;">
                        </div>
                        <div
                            style="background: var(--color-card-2);border-radius: 100%;width: 7px;margin: 5px 8px 5px 5px;">
                        </div>
                    </div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 20%;margin-right: 25%;"></div>
                    <div class="bcd-body" style="width: 55%;display: flex;justify-content: flex-end;">
                        <div
                            style="background: var(--color-card-2);width: calc(25% + 26px);margin-right: 5px;border-radius: 5px 5px 0 0;display: flex;justify-content: flex-end;">
                            <div
                                style="background:var(--color-main);border-radius: 100%;width: 7px;margin: 10px 5px 0 5px;">
                            </div>
                            <div
                                style="background:var(--color-card-1);border-radius: 16px;width: calc(100% - 25px);margin: 10px 7px 0 0;">
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 10%;margin-right: 20%;"></div>
                    <div class="bcd-body" style="width: 40%;display: flex;justify-content: flex-end;">
                        <div
                            style="background: var(--color-card-2);width: calc(35% + 25px);margin-right: 5px;display: flex;justify-content: flex-end;">
                            <div
                                style="background: var(--color-card-1);border-radius: 16px;width: calc(100% - 14px);height: calc(100% - 10px);margin-top: 2.5px;margin-right: 7px;">
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 15%;margin-right: 40%;"></div>
                    <div class="bcd-body" style="width: 35%;display: flex;justify-content: flex-end;">
                        <div
                            style="background: var(--color-card-2);width: calc(40% + 25px);margin-right: 5px;border-radius: 0 0 5px 5px;">
                        </div>
                    </div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 43%;"></div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 13%;margin-right: 20%;"></div>
                    <div class="bcd-body" style="width: 49%;"></div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 57%;"></div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 17%;margin-right: 26%;"></div>
                    <div class="bcd-body" style="width: 52%;"></div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 8%;margin-right: 8%;"></div>
                    <div class="bcd-body" style="width: 60%;">
                        <div
                            style="background: var(--color-card-2);width: calc(100% - 7px);height: calc(100% - 7px);margin-top: 7px;border-radius: 0 7px 0 0;">
                        </div>
                    </div>
                </div>
                <div>
                    <div class="bcd-body" style="width: 40%;border-radius: 0 0 7px 0;">
                        <div
                            style="background: var(--color-card-2);width: calc(100% - 7px);height: calc(100% - 7px);margin-right: 7px;border-radius: 0 0 7px 0;">
                        </div>
                    </div>
                </div>
            </div>
            <span>Border Card UI For Web</span>
            <br>
            <a>version rolling</a>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { openLink } from '@/function/utils/appUtil'
import { ContributorElem } from '@/function/elements/system'

import DepPan from './DepPan.vue'
import packageInfo from '../../package.json'
import { runtimeData } from '@/function/msg'

export default defineComponent({
    name: 'AboutPan',
    props: {
        showUI: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            packageInfo: packageInfo,
            openLink: openLink,
            constList: [] as ContributorElem[]
        }
    },
    methods: {
        dependencies() {
            runtimeData.popBoxList = []
            const popInfo = {
                    title: this.$t('list_of_dependencies'),
                    template: DepPan
                }
                runtimeData.popBoxList.push(popInfo)
        }
    },
    mounted() {
        const superThanks = [
            'doodlehuang'
        ]
        // 加载贡献者信息
        fetch('https://api.github.com/repos/stapxs/stapxs-qq-lite-2.0/contributors')
            .then(response => response.json())
            .then((data: { [key: string]: string }[]) => {
                for (let i = 0; i < data.length; i++) {
                    this.constList.push({
                        url: data[i].avatar_url,
                        link: data[i].html_url,
                        title: data[i].login,
                        isMe: data[i].login == 'Stapxs',
                        isSuperThakns: superThanks.includes(data[i].login)
                    })
                }
            })
            .catch(console.error)
    }
})
</script>

<style>
.hidd-sha {
    box-shadow: none !important;
}
</style>
