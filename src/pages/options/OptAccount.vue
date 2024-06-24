<!--
 - @FileDescription: 设置页面（账号子页面）
 - @Author: Stapxs
 - @Date: 2022/9/29
          2022/12/9
 - @Version: 1.0 - 初始版本
             1.5 - 重构为 ts 版本，代码格式优化
-->

<template>
    <div class="opt-page">
        <template v-if="Object.keys(runtimeData.loginInfo).length > 0">
            <div  class="ss-card account-info">
                <img :src="'https://q1.qlogo.cn/g?b=qq&s=0&nk=' + runtimeData.loginInfo.uin">
                <div>
                    <div>
                        <span>{{ runtimeData.loginInfo.nickname }}</span>
                        <span>{{ runtimeData.loginInfo.uin }}</span>
                    </div>
                    <span>{{ runtimeData.loginInfo.info && Object.keys(runtimeData.loginInfo.info).length > 0 ?
                            runtimeData.loginInfo.info.lnick : ''
                    }}</span>
                </div>
                <font-awesome-icon @click="exitConnect" :icon="['fas', 'right-from-bracket']" />
            </div>
            <div class="ss-card">
                <header>{{ $t('option_account_config') }}</header>
                <div class="opt-item">
                    <font-awesome-icon :icon="['fas', 'address-card']" />
                    <div>
                        <span>{{ $t('option_account_nick') }}</span>
                        <span>{{ $t('option_account_nick_tip') }}</span>
                    </div>
                    <input class="ss-input" style="width:150px" type="text" @keyup="setNick" v-model="runtimeData.loginInfo.nickname">
                </div>
                <div v-if="runtimeData.loginInfo.info && Object.keys(runtimeData.loginInfo.info).length > 0" class="opt-item">
                    <font-awesome-icon :icon="['fas', 'pen']" />
                    <div>
                        <span>{{ $t('option_account_lnick') }}</span>
                        <span>{{ $t('option_account_lnick_tip') }}</span>
                    </div>
                    <input class="ss-input" style="width:150px" type="text" @keyup="setLNick" v-model="runtimeData.loginInfo.info.lnick">
                </div>
            </div>
        </template>
        <template v-else>
            <div class="ss-card account-not-login">
                <font-awesome-icon :icon="['fas', 'fish']" />
                <span>{{ $t('option_account_notlogin') }}</span>
                <button @click="goLogin" class="ss-button">{{ $t('option_account_gologin') }}</button>
            </div>
        </template>
        <div class="ss-card" v-if="Object.keys(runtimeData.botInfo).length > 0">
            <header>{{ $t('option_account_bot') }}</header>
            <div class="l10n-info">
                <font-awesome-icon :icon="['fas', 'robot']" />
                <div>
                    <span>{{ runtimeData.botInfo.app_name }}<a>{{ runtimeData.botInfo.app_version !== undefined ?
                            runtimeData.botInfo.app_version : runtimeData.botInfo.version
                    }}</a></span>
                    <span>{{ $t('option_account_bot_tip') }}</span>
                </div>
            </div>
            <div class="bot-info">
                <div v-for="key in Object.keys(runtimeData.botInfo)" :key="'botinfo-' + key">
                    <span v-if="key !== 'app_name' && key !== 'app_version' && key !== 'version'">
                        <span>{{ $t('botinfo_' + key) + ': ' }}</span>
                        <span v-if="(typeof runtimeData.botInfo[key]) !== 'object'">
                            {{ paseBotInfo(key, runtimeData.botInfo[key]) }}
                        </span>
                        <span v-else v-for="item in Object.keys(runtimeData.botInfo[key])"
                            v-show="(typeof runtimeData.botInfo[key][item]) !== 'object'"
                            :key="'botinfo-' + key + item">
                            {{ (typeof runtimeData.botInfo[key][item] == 'number' ? 
                            $t('botinfo_' + item, runtimeData.botInfo[key][item]) : $t('botinfo_' + item))
                             + ': ' + paseBotInfo(item, runtimeData.botInfo[key][item]) }}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { runASWEvent as saveR, remove } from '@/function/option'
import { runtimeData } from '@/function/msg'
import { Connector, login } from '@/function/connect'
import { getTrueLang } from '@/function/utils/systemUtil'

export default {
    name: 'ViewOptAccount',
    props: [],
    data() {
        return {
            runtimeData: runtimeData,
            save: saveR,
            login: login
        }
    },
    methods: {
        /**
         * 对 botInfo 字段部分需要处理的数据进行处理
         * @param name 键名
         * @param value 键值
         */
        paseBotInfo(name: string, value: number | string) {
            if (typeof value == 'number' && name.indexOf('time') > 0 && value > 1000000000) {
                // 尝试转换时间戳
                if (value / 10000000000 < 1) {
                    value = value * 1000
                }
                return Intl.DateTimeFormat(
                    getTrueLang(),
                    { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(value))
            }
            return value
        },

        /**
         * 断开连接
         */
        exitConnect() {
            remove('auto_connect')
            Connector.close()
        },

        goLogin() {
            document.getElementById('bar-home')?.click()
        },

        /**
         * 设置昵称
         * @param event 事件
         */
        setNick(event: KeyboardEvent) {
            // TODO: 这玩意的返回好像永远是错误的 …… 所以干脆不处理返回了
            if (event.key === 'Enter' && runtimeData.loginInfo.nickname !== '') {
                Connector.send('set_nickname', {nickname: runtimeData.loginInfo.nickname}, 'setNickname')
            }
        },
        
        /**
         * 设置签名
         * @param event 事件
         */
        setLNick(event: KeyboardEvent) {
            // TODO: 这玩意的返回好像永远是错误的 …… 所以干脆不处理返回了
            if (event.key === 'Enter' && runtimeData.loginInfo.info.lnick !== '') {
                Connector.send('set_signature', {signature: runtimeData.loginInfo.info.lnick}, 'setSignature')
            }
        }
    }
}
</script>
