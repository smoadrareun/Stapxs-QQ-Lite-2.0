/*
 * @FileDescription: Websocket 底层模块
 * @Author: Stapxs
 * @Date: 2022/10/20
 * @Version: 1.0
 * @Description: 此模块主要处理 Websocket 交互相关功能
*/

import Option from './option'
import app from '@/main'

import { reactive } from 'vue'
import { LogType, Logger, PopType, PopInfo  } from './base'
import { parse, runtimeData, resetRimtime } from './msg'

import { BotActionElem, LoginCacheElem } from './elements/system'
import { updateMenu } from '@/function/utils/appUtil'

const logger = new Logger()
const popInfo = new PopInfo()

let retry = 0

export let websocket: WebSocket | undefined = undefined

export class Connector {
    /**
     * 创建 Websocket 连接
     * @param address 地址
     * @param token 密钥
     */
    static create(address: string, token?: string, wss: boolean | undefined = undefined) {
        const $t = app.config.globalProperties.$t

        // Electron 默认使用后端连接模式
        if(runtimeData.tags.isElectron) {
            logger.add(LogType.WS, $t('log_con_backend'))
            const reader = runtimeData.reader
            if(reader) {
                reader.send('onebot:connect', { address: address, token: token })
                return
            }
        }

        // PS：只有在未设定 wss 类型的情况下才认为是首次连接
        if(wss == undefined) retry = 0; else retry ++
        // 最多自动重试连接五次
        if(retry > 5) return
        
        logger.debug($t('log_ws_log_debug'))
        logger.add(LogType.WS, $t('log_we_log_all'))

        let url = `ws://${address}?access_token=${token}`
        if(address.startsWith('ws://') || address.startsWith('wss://')) {
            url = `${address}?access_token=${token}`
        } else {
            if(wss == undefined) {
                // 判断连接类型
                if(document.location.protocol == 'https:') {
                    // 判断连接 URL 的协议，https 优先尝试 wss
                    runtimeData.tags.connectSsl = true
                    url = `wss://${address}?access_token=${token}`
                }
            } else {
                if(wss) {
                    url = `wss://${address}?access_token=${token}`
                }
            }
        }
        
        if(!websocket) {
            websocket = new WebSocket(url)
        }

        websocket.onopen = () => {
            this.onopen(address, token)
        }
        websocket.onmessage = (e) => {
            this.onmessage(e.data)
        }
        websocket.onclose = (e) => {
            this.onclose(e.code, e.reason, address, token)
        }
        websocket.onerror = (e) => {
            popInfo.add(PopType.ERR, $t('pop_log_con_fail') + ': ' + e.type, false)
            return
        }
    }

    // 连接事件 =====================================================

    static onopen(address: string, token: string | undefined) {
        const $t = app.config.globalProperties.$t

        logger.add(LogType.WS, $t('log_con_success'))
        // 保存登录信息
        Option.save('address', address)
        // 保存密钥
        if (runtimeData.sysConfig.save_password && runtimeData.sysConfig.save_password != '') {
            Option.save('save_password', token)
        }
        // 清空应用通知
        popInfo.clear()
        // 加载初始化数据
        // PS：标记登陆成功在获取用户信息的回调位置，防止无法获取到内容
        Connector.send('get_version_info', {}, 'getVersionInfo')
        // 更新菜单
        updateMenu({
            id: 'logout',
            action: 'visible',
            value: true
        })
    }

    static onmessage(message: string) {
        // 心跳包输出到日志里太烦人了
        if ((message as string).indexOf('"meta_event_type":"heartbeat"') < 0) {
            logger.add(LogType.WS, 'GET：' + message)
        }
        parse(message)
    }

    static onclose(code: number, message: string | undefined, address: string, token: string | undefined) {
        const $t = app.config.globalProperties.$t

        websocket = undefined
            updateMenu({
                id: 'logout',
                action: 'visible',
                value: false
            })
            updateMenu({
                id: 'userName',
                action: 'label',
                value: $t('menu_login')
            })

            switch(code) {
                case 1000: break;   // 正常关闭
                case 1006: {        // 非正常关闭，尝试重连
                    if(login.status) {
                        this.create(address, token, undefined)
                    } else {
                        // PS：由于创建连接失败也会触发此事件，所以需要判断是否已经登录
                        // 尝试使用 ws 连接
                        this.create(address, token, false)
                    }
                    break;
                }
                case 1015: {        // TSL 错误，尝试使用 ws 连接
                    this.create(address, token, false)
                    break;
                }
                default: {
                    popInfo.add(PopType.ERR, $t('pop_log_con_fail') + ': ' + code, false)
                    // eslint-disable-next-line no-console
                    console.log(message)
                }
            }
            logger.error($t('pop_log_con_fail') + ': ' + code)
            login.status = false
            
            // 除了 1006 意外断开（可能要保留数据重连），其他情况都会清空
            if(code != 1006) {
                resetRimtime()
            }
    }

    // 连接器操作 =====================================================

    /**
     * 正常断开 Websocket 连接
     */
    static close() {
        if(runtimeData.tags.isElectron) {
            const reader = runtimeData.reader
            if(reader) {
                reader.send('onebot:close')
            }
        } else {
            popInfo.add(PopType.INFO, app.config.globalProperties.$t('pop_log_con_close'))
            if(websocket) websocket.close(1000)
        }
    }

    /**
     * 发送 Websocket 消息
     * @param name 事件名
     * @param value 参数
     * @param echo 回调名
     */
    static send(name: string, value: {[key: string]: any}, echo: string = name) {
        // 构建 JSON
        const json = JSON.stringify({ action: name, params: value, echo: echo } as BotActionElem)
        this.sendRaw(json)
    }
    static sendRaw(json: string) {
        // 发送
        if(runtimeData.tags.isElectron) {
            const reader = runtimeData.reader
            if(reader) {
                reader.send('onebot:send', json)
            }
        } else {
            if(websocket) websocket.send(json)
        }

        if (Option.get('log_level') === 'debug') {
            logger.debug('PUT：' + json)
        } else {
            logger.add(LogType.WS, 'PUT：' + json)
        }
    }
}

export const login: LoginCacheElem = reactive({ status: false, address: '', token: '' })