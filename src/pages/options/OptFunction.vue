<!--
 * @FileDescription: 设置页面（功能子页面）
 * @Author: Stapxs
 * @Date: 2022/11/07
 * @Version: 1.0
-->

<template>
    <div class="opt-page">
        <div class="ss-card">
            <header>{{ $t('option_fun_notice') }}</header>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'volume-xmark']" />
                <div>
                    <span>{{ $t('option_dev_notice_close') }}</span>
                    <span>{{ $t('option_dev_notice_close_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="close_notice"
                        v-model="runtimeData.sysConfig.close_notice">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
            <div class="opt-item" v-if="!runtimeData.sysConfig.close_notice">
                <font-awesome-icon :icon="['fas', 'bolt']" />
                <div>
                    <span>{{ $t('option_dev_notice_all') }}</span>
                    <span>{{ $t('option_dev_notice_all_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="notice_all" v-model="runtimeData.sysConfig.notice_all">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
        </div>
        <div class="ss-card">
            <header>{{ $t('option_fun_chat') }}</header>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'ban']" />
                <div>
                    <span>{{ $t('option_dev_send_reget') }}</span>
                    <span>{{ $t('option_dev_send_reget_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="send_reget" v-model="runtimeData.sysConfig.send_reget">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'box-archive']" />
                <div>
                    <span>{{ $t('option_dev_chat_nd') }}</span>
                    <span>{{ ndt === 0 ? $t('option_dev_chat_nd_tip') : $t('option_dev_chat_nd_tip_1') }}</span>
                </div>
                <label class="ss-switch" v-if="ndt < 3">
                    <input type="checkbox" @change="msgND" v-model="ndv">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'window-maximize']" />
                <div>
                    <span>{{ $t('option_dev_chat_pic_pan') }}</span>
                    <span>{{ $t('option_dev_chat_pic_pan_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="close_chat_pic_pan"
                        v-model="runtimeData.sysConfig.close_chat_pic_pan">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'fish-fins']" />
                <div>
                    <span>{{ $t('option_fun_taill') }}</span>
                    <span>{{ $t('option_fun_taill_tip') }}</span>
                </div>
                <input class="ss-input" style="width:150px" type="text" name="msg_taill" @keyup="save"
                    v-model="runtimeData.sysConfig.msg_taill">
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'keyboard']" />
                <div>
                    <span>{{ $t('option_dev_chat_use_breakline') }}</span>
                    <span>{{ $t('option_dev_chat_use_breakline_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="breakLineTip($event);save($event)" name="use_breakline" v-model="runtimeData.sysConfig.use_breakline">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
        </div>
        <div class="ss-card">
            <header>{{ $t('option_fun_ga') }}</header>
            <div class="opt-item"
                :style="runtimeData.sysConfig.close_ga !== true ? 'background: var(--color-card-1);' : ''">
                <font-awesome-icon :icon="['fas', 'cloud']" />
                <div>
                    <span>{{ $t('option_fun_ga_turn') }}</span>
                    <span>{{ $t('option_fun_ga_turn_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="close_ga" v-model="runtimeData.sysConfig.close_ga">
                    <div style="background: var(--color-card-2);">
                        <div></div>
                    </div>
                </label>
            </div>
            <div class="tip" v-if="runtimeData.sysConfig.close_ga !== true">
                {{ $t('option_fun_ga_tip') }}
                <div class="ga-share">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 428 389.11"><circle cx="214.15" cy="181" r="171" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="20"></circle><path d="M413 134.11H15.29a15 15 0 0 0-15 15v15.3C.12 168 0 171.52 0 175.11c0 118.19 95.81 214 214 214 116.4 0 211.1-92.94 213.93-208.67 0-.44.07-.88.07-1.33v-30a15 15 0 0 0-15-15Z"></path></svg>
                    <a :href="shareLink" target="_blank">{{ $t('name') }} {{ $t('option_fun_ga_tip_1') }}</a>
                </div>
            </div>
            <div class="opt-item" v-if="runtimeData.sysConfig.close_ga !== true">
                <font-awesome-icon :icon="['fas', 'dice']" />
                <div>
                    <span>{{ $t('option_fun_ga_bot') }}</span>
                    <span>{{ $t('option_fun_ga_bot_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="open_ga_bot"
                        v-model="runtimeData.sysConfig.open_ga_bot">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { runASWEvent as save } from '@/function/option'
import { runtimeData } from '@/function/msg'

export default defineComponent({
    name: 'ViewOptFunction',
    data() {
        return {
            runtimeData: runtimeData,
            save: save,
            ndt: 0,
            ndv: false,
            shareLink: process.env.VUE_APP_MU_SHARE
        }
    },
    methods: {
        msgND: function () {
            this.ndt++
            setTimeout(() => {
                this.ndv = false
            }, 300)
        },
        breakLineTip (event: Event) {
            const sender = event.target as HTMLInputElement
            if(sender.checked) {
                const popInfo = {
                    title: this.$t('popbox_tip'),
                    html: `<span>${this.$t('option_dev_chat_use_breakline_tip_1')}</span>`,
                    button: [
                        {
                            text: this.$t('btn_know'),
                            master: true,
                            fun: () => { runtimeData.popBoxList.shift() }
                        }
                    ]
                }
                runtimeData.popBoxList.push(popInfo)
            }
        }
    }
})
</script>
<style>
.ss-switch input:checked ~ div {
    background: var(--color-main) !important;
}
.ga-share {
    background: var(--color-card-2);
    border-radius: 7px;
    align-items: center;
    margin-top: 10px;
    cursor: pointer;
    display: flex;
    padding: 10px 20px;
}
.ga-share > svg {
    fill: var(--color-font);
    margin-right: 10px;
    width: 20px;
}
.ga-share > a {
    text-decoration: underline;
    color: var(--color-font-1);
    font-size: 0.8rem;
}
</style>
