<!--
 * @FileDescription: 设置页面（开发者子页面）
 * @Author: Stapxs
 * @Date: 2022/09/28
 * @Version: 1.0
-->

<template>
    <div class="opt-page">
        <div class="ss-card">
            <header>{{ $t('option_dev_dev') }}</header>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'book']" />
                <div>
                    <span>{{ $t('option_dev_log_level') }}</span>
                    <span>{{ $t('option_dev_log_level_tip') }}</span>
                </div>
                <select @change="save" name="log_level" title="log_level" v-model="runtimeData.sysConfig.log_level">
                    <option value="err">{{ $t('option_dev_log_level_err') }}</option>
                    <option value="debug">{{ $t('option_dev_log_level_debug') }}</option>
                    <option value="info">{{ $t('option_dev_log_level_info') }}</option>
                    <option value="all">{{ $t('option_dev_log_level_all') }}</option>
                </select>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'robot']" />
                <div>
                    <span>{{ $t('option_dev_debug_msg') }}</span>
                    <span><a style="cursor:pointer;" @click="sendAbab">{{ $t('option_dev_debug_msg_tip') }}</a></span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="debug_msg" v-model="runtimeData.sysConfig.debug_msg">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
        </div>
        <div class="ss-card">
            <header>{{ $t('option_dev_connect') }}</header>
            <div class="tip">
                {{ $t('option_dev_connect_tip') }}
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'heart']" />
                <div>
                    <span>{{ $t('option_dev_connect_beat') }}</span>
                    <span>{{ $t('option_dev_connect_beat_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="connect_beat" v-model="runtimeData.sysConfig.connect_beat">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'table-columns']" />
                <div>
                    <span>{{ $t('option_dev_chatview_name') }}</span>
                    <span>{{ $t('option_dev_chatview_name_tip') }}</span>
                </div>
                <input class="ss-input" style="width:150px" type="text" v-model="chatview_name"
                    @keyup="saveWName($event, 'chatview_name')">
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'clipboard-list']" />
                <div>
                    <span>{{ $t('option_dev_msg_type') }}</span>
                    <span>{{ $t('option_dev_msg_type_tip') }}</span>
                </div>
                <select @change="save" name="msg_type" title="msg_type" v-model="runtimeData.tags.msgType">
                    <option value="">{{ $t('option_dev_msg_type_auto') }}</option>
                    <option v-for="item in BotMsgType" v-show="(typeof item == 'number')" :value="item" :key="item">{{
                        BotMsgType[item] }}</option>
                </select>
            </div>
        </div>
        <div class="ss-card">
            <header>{{ $t('option_dev_test') }}</header>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'paper-plane']" />
                <div>
                    <span>{{ $t('option_dev_ws_send') }}</span>
                    <span>{{ $t('option_dev_ws_send_tip') }}</span>
                </div>
                <input class="ss-input" style="width:150px" type="text" @keyup="sendTestWs" v-model="ws_text">
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'envelope']" />
                <div>
                    <span>{{ $t('option_dev_appmsg') }}</span>
                    <span>{{ $t('option_dev_appmsg_tip') }}</span>
                </div>
                <input class="ss-input" style="width:150px" type="text" @keyup="sendTestAppmsg" v-model="appmsg_text">
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'file-invoice']" />
                <div>
                    <span>{{ $t('option_dev_runtime') }}</span>
                    <span>{{ $t('option_dev_runtime_tip') }}</span>
                </div>
                <button style="width:100px;font-size:0.8rem;" class="ss-button" @click="printRuntime">{{
                        $t('option_dev_runtime_run')
                }}</button>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" />
                <div>
                    <span>{{ $t('option_dev_debug') }}</span>
                    <span>{{ $t('option_dev_debug_tip') }}</span>
                </div>
                <button style="width:100px;font-size:0.8rem;" class="ss-button" @click="printVersionInfo">{{
                        $t('option_dev_runtime_run')
                }}</button>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'mountain']" />
                <div>
                    <span>{{ $t('option_dev_ui_test') }}</span>
                    <span>{{ $t('option_dev_ui_test_tip') }}</span>
                </div>
                <label class="ss-switch">
                    <input type="checkbox" @change="save" name="ui_test" v-model="runtimeData.sysConfig.ui_test">
                    <div>
                        <div></div>
                    </div>
                </label>
            </div>
            <template v-if="runtimeData.tags.isElectron">
                <div class="opt-item">
                    <font-awesome-icon :icon="['fas', 'power-off']" />
                    <div>
                        <span>{{ $t('option_dev_restart') }}</span>
                        <span>{{ $t('option_dev_restart_tip') }}</span>
                    </div>
                    <button style="width:100px;font-size:0.8rem;" class="ss-button" @click="restartapp">{{
                        $t('option_dev_runtime_run')
                }}</button>
                </div>
            </template>
        </div>
        <div class="ss-card">
            <header>{{ $t('option_dev_backup') }}</header>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'download']" />
                <div>
                    <span>{{ $t('option_dev_get_backup') }}</span>
                    <span>{{ $t('option_dev_get_backup_tip') }}</span>
                </div>
                <button @click="printSetUpInfo" style="width:100px;font-size:0.8rem;" class="ss-button">{{
                        $t('option_dev_runtime_run')
                }}</button>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'upload']" />
                <div>
                    <span>{{ $t('option_dev_set_backup') }}</span>
                    <span>{{ $t('option_dev_set_backup_tip') }}</span>
                </div>
                <button @click="importSetUpInfo" style="width:100px;font-size:0.8rem;" class="ss-button">{{
                        $t('option_dev_runtime_run')
                }}</button>
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'trash-arrow-up']" />
                <div>
                    <span>{{ $t('option_dev_reset') }}</span>
                    <span>{{ $t('option_dev_reset_tip') }}</span>
                </div>
                <button @click="resetApp" style="width:100px;font-size:0.8rem;" class="ss-button">{{
                        $t('option_dev_runtime_run')
                }}</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { runASWEvent as save, runAS as saveBase, saveAll } from '@/function/option'
import { websocket as ws } from '@/function/connect'
import { PopInfo, PopType } from '@/function/base'
import { runtimeData } from '@/function/msg'
import app from '@/main'
import { BrowserInfo, detect } from 'detect-browser'
import packageInfo from '../../../package.json'
import { BotMsgType } from '@/function/elements/information'
import { uptime } from '@/main'

export default defineComponent({
    name: 'ViewOptDev',
    data () {
        return {
            BotMsgType: BotMsgType,
            runtimeData: runtimeData,
            save: save,
            ws_text: '',
            appmsg_text: '',
            chatview_name: ''
        }
    },
    methods: {
        saveWName (event: KeyboardEvent, name: string) {
            if (event.keyCode === 13) {
                saveBase(name, this.chatview_name)
            }
        },
        sendTestWs (event: KeyboardEvent) {
            // 发送测试 WS 消息
            if (event.keyCode === 13 && this.ws_text !== '') {
                const info = JSON.parse(this.ws_text)
                this.ws_text = ''
                // 修改 echo 防止被消息处理机处理
                info.echo = 'websocketTest'
                if(ws) ws.send(JSON.stringify(info))
            }
        },
        sendTestAppmsg (event: KeyboardEvent) {
            if (event.keyCode === 13 && this.appmsg_text !== '') {
                new PopInfo().add(PopType.INFO, this.appmsg_text, false)
                this.appmsg_text = ''
            }
        },
        sendAbab () {
            new PopInfo().add(PopType.INFO, app.config.globalProperties.$t('pop_option_dev_debug_msg_tip_1'))
        },
        printRuntime () {
            console.log('=========================')
            console.log(runtimeData)
            console.log('=========================')
            if (runtimeData.reader) {
                runtimeData.reader.send('win:openDevTools')
            }
        },
        async printVersionInfo() {
            new PopInfo().add(PopType.INFO, app.config.globalProperties.$t('option_dev_get_version_info'))

            // electron：索要 electron 信息
            let addInfo = undefined
            if(runtimeData.reader) {
                addInfo = await runtimeData.reader.invoke('opt:getSystemInfo')
            }

            const browser = detect() as BrowserInfo
            let info = '```\n'
            info += 'Debug Info - ' + new Date().toLocaleString() + '\n================================\n'
            info += `System Info:\n`
            info += `    OS Name          -> ${browser.os}\n`
            info += `    Browser Name     -> ${browser.name}\n`
            info += `    Browser Version  -> ${browser.version}\n`
            if(addInfo) {
                const get = addInfo as {[key: string]: any}
                Object.keys(get).forEach((name: string) => {
                    info += `    ${get[name][0]} -> ${get[name][1]}\n`
                })
            }
            // 获取安装信息，这儿主要判断几种已提交的包管理安装方式
            if(runtimeData.tags.isElectron && runtimeData.reader && runtimeData.tags.release) {
                switch(process.platform) {
                    case 'darwin': {
                        // homebrew
                        const brewInfo = await runtimeData.reader.invoke('sys:runCommand', 'brew list --cask stapxs-qq-lite')
                        if(brewInfo.success) {
                            info += `    Install Type     -> homebrew\n`
                        }
                        break;
                    }
                    case 'linux': {
                        // archlinux
                        if((runtimeData.tags.release.toLowerCase()).indexOf('arch') > 0) {
                            let pacmanInfo = await runtimeData.reader.invoke('sys:runCommand', 'pacman -Q stapxs-qq-lite-bin')
                            if(pacmanInfo.success) {
                                info += `    Install Type     -> aur\n`
                            } else {
                                // 也有可能是 stapxs-qq-lite，这是我自己打的原生包
                                pacmanInfo = await runtimeData.reader.invoke('sys:runCommand', 'pacman -Q stapxs-qq-lite')
                                if(pacmanInfo.success) {
                                    info += `    Install Type     -> pacman\n`
                                }
                            }
                        }
                        break;
                    }
                    default: {
                        info += `    Install Type     -> raw\n`
                    }
                }
            }

            info += `Application Info:\n`
            info += `    Uptime           -> ${new Date().getTime() - uptime} ms\n` 
            info += `    Package Version  -> ${packageInfo.version}\n`
            info += `    Runtime env      -> ${process.env.NODE_ENV}\n`
            info += `    Service Work     -> ${runtimeData.tags.sw}\n`

            info += `Backend Info:\n`
            info += `    Bot Info Name    -> ${runtimeData.botInfo.app_name}\n`
            info += `    Bot Info Version -> ${runtimeData.botInfo.app_version !== undefined ? runtimeData.botInfo.app_version : runtimeData.botInfo.version}\n`
            info += `    Loaded Config    -> ${runtimeData.jsonMap?.name}\n`

            info += `View Info:\n`
            info += `    Doc Width        -> ${document.getElementById('app')?.offsetWidth} px\n`

            info += `Network Info:\n`
            const testList = [
                     ['Github          ', 'https://api.github.com'],
                     ['Link API        ', 'https://api.stapxs.cn']
            ]
            for (const item of testList) {
                const start = new Date().getTime()
                try {
                    await fetch(item[1], { method: 'GET' })
                    const end = new Date().getTime()
                    info += `    ${item[0]} -> ${end - start} ms\n`
                } catch (e) {
                    info += `    ${item[0]} -> failed\n`
                }
            }
            info += '```'
            // 构建 popBox 内容
            const popInfo = {
                svg: 'screwdriver-wrench',
                html: '<textarea class="debug-info">' + info + '</textarea>',
                title: this.$t('option_dev_test_info'),
                button: [
                    {
                        text: app.config.globalProperties.$t('chat_msg_menu_copy'),
                        fun: () => { 
                            app.config.globalProperties.$copyText(info)
                            new PopInfo().add(PopType.INFO, app.config.globalProperties.$t('pop_chat_msg_menu_copy_success'))
                         }
                    },
                    {
                        text: app.config.globalProperties.$t('btn_yes'),
                        master: true,
                        fun: () => { runtimeData.popBoxList.shift() }
                    }
                ]
            }
            runtimeData.popBoxList.push(popInfo)
        },
        printSetUpInfo () {
            const json = JSON.stringify(runtimeData.sysConfig)
            const popInfo = {
                svg: 'download',
                html: '<textarea style="width: calc(100% - 40px);min-height: 90px;background: var(--color-card-1);color: var(--color-font);border: 0;padding: 20px;border-radius: 7px;margin-top: -10px;">' + json + '</textarea>',
                title: this.$t('option_dev_get_backup'),
                button: [
                    {
                        text: app.config.globalProperties.$t('chat_msg_menu_copy'),
                        fun: () => { 
                            app.config.globalProperties.$copyText(json)
                            new PopInfo().add(PopType.INFO, app.config.globalProperties.$t('pop_chat_msg_menu_copy_success'))
                         }
                    },
                    {
                        text: app.config.globalProperties.$t('btn_yes'),
                        master: true,
                        fun: () => { runtimeData.popBoxList.shift() }
                    }
                ]
            }
            runtimeData.popBoxList.push(popInfo)
        },
        importSetUpInfo () {
            const popInfo = {
                svg: 'upload',
                html: '<textarea id="importSetUpInfoTextArea" style="width: calc(100% - 40px);min-height: 90px;background: var(--color-card-1);color: var(--color-font);border: 0;padding: 20px;border-radius: 7px;margin-top: -10px;"></textarea>',
                title: this.$t('option_dev_set_backup'),
                button: [
                    {
                        text: app.config.globalProperties.$t('btn_no'),
                        fun: () => { runtimeData.popBoxList.shift() }
                    },
                    {
                        text: app.config.globalProperties.$t('btn_yes'),
                        master: true,
                        fun: () => { 
                            const input = document.getElementById('importSetUpInfoTextArea') as HTMLTextAreaElement
                            if(input) {
                                try {
                                    const json = JSON.parse(input.value)
                                    runtimeData.sysConfig = json
                                    saveAll(json)
                                    location.reload()
                                } catch (e) {
                                    new PopInfo().add(PopType.ERR, app.config.globalProperties.$t('import_config_fail'))
                                }
                            }
                         }
                    }
                ]
            }
            runtimeData.popBoxList.push(popInfo)
        },
        resetApp () {
            const popInfo = {
                svg: 'trash-arrow-up',
                html: '<span>' + this.$t('option_dev_reset_tip1') + '</span>',
                title: this.$t('option_dev_reset'),
                button: [
                    {
                        text: app.config.globalProperties.$t('btn_yes'),
                        fun: () => {
                            localStorage.clear()
                            document.cookie.split(';').forEach(function (c) {
                                document.cookie = c
                                    .replace(/^ +/, '')
                                    .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
                            })
                            if (runtimeData.reader) {
                                runtimeData.reader.sendSync('opt:clearAll')
                            }
                            location.reload()
                        }
                    },
                    {
                        text: app.config.globalProperties.$t('btn_no'),
                        master: true,
                        fun: () => { runtimeData.popBoxList.shift() }
                    }
                ]
            }
            runtimeData.popBoxList.push(popInfo)
        },
        restartapp() {
            if (runtimeData.reader) {
                runtimeData.reader.send('win:relaunch')
            }
        }
    },
    mounted() {
        this.$watch(() => runtimeData.sysConfig.chatview_name, () => {
            this.chatview_name = runtimeData.sysConfig.chatview_name
        })
    }
})
</script>
