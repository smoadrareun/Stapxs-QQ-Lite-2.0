/**
 * 后端和前端的简易通信器，封装一些常用的交互
 */

import WebSocket from 'ws'
import log4js from 'log4js'
import { BrowserWindow, ipcMain } from 'electron'
import { logLevel } from '@/background'

export class Connector {

    private logger = log4js.getLogger('connector')

    private win: BrowserWindow
    private websocket: WebSocket | undefined

    constructor(win: BrowserWindow) {
        this.logger.level = logLevel
        this.win = win
        // 初始化 ipc
        ipcMain.on('onebot:send', (event, json) => {
            this.websocket?.send(json)
        })
        ipcMain.on('onebot:close', () => {
            this.websocket?.close(1000)
            this.websocket = undefined
        })
        this.logger.info('后端连接器已初始化')
    }

    connect(url: string, token: string) {
        if(url.indexOf('ws://') < 0 && url.indexOf('wss://') < 0) {
            url = 'wss://' + url
        }

        if(!this.websocket) {
            this.logger.info('正在连接到：', url)
            this.websocket = new WebSocket(url + '?access_token=' + token)
        }

        this.websocket.onopen = () => {
            this.logger.info('已成功连接到', url)
            this.win.webContents.send('onebot:onopen', { address: url, token: token })
        }
        this.websocket.onmessage = (e) => {
            try {
                const message = JSON.parse((e.data as string))
                if(message.echo)
                    this.logger.debug('收到消息：', message.echo)
                else if(message.post_type) {
                    if(message.notice_type)
                        this.logger.debug('收到消息：', message.post_type, message.notice_type)
                    else
                        this.logger.debug('收到消息：', message.post_type)
                }
            } catch(e) {
                //
            }
            this.win.webContents.send('onebot:onmessage', e.data)
        }
        this.websocket.onclose = (e) => {
            this.logger.info('连接已关闭，代码：', e.code)
            if(e.code != 1006 && e.code != 1015) {
                // 除了需要重连的情况，其他情况都直接常规处理
                this.win.webContents.send('onebot:onclose', {
                    code: e.code,
                    message: e.reason,
                    address: url,
                    token: token
                })
            } else if(e.code == 1015) {
                // TSL 连接失败，尝试使用非加密连接
                this.logger.warn('连接失败，尝试使用非加密连接...')
                this.connect(url.replace('wss://', 'ws://'), token)
            }
        }
        this.websocket.onerror = (e) => {
            this.logger.error('连接错误：', e)
        }
    }
}