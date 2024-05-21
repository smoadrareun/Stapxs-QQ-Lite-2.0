/*
 * @FileDescription: 基础功能模块
 * @Author: Stapxs
 * @Date: 2022/10/20
 * @Version: 1.0
 * @Description: 此模块主要为程序相关的基础功能
*/

import Option from './option'
import { reactive } from 'vue'
import { PopInfoElem } from './elements/system'

// =============== 日志 ===============

export enum LogType {
    WS, UI, ERR, INFO, DEBUG
}

export class Logger {

    private logTypeInfo: [string, string][]

    constructor() {
        // 日志类型输出文本前缀样式，顺序对应 LogType
        this.logTypeInfo = [
            ['7abb7e', 'fff'], ['b573f7', 'fff'], ['ff5370', 'fff'],
            ['99b3db', 'fff'], ['677480', 'fff']
        ]
    }

    /**
     * 输出一条日志
     * @param mode 日志类型
     * @param args 日志内容
     */
    add(type: LogType, args: string) {
        const logLevel = Option.get('log_level')
        // PS：WS, UI, ERR, INFO, DEBUG
        // all 将会输出以上全部类型，debug 将会输出 DEBUG、UI，info 将会输出 INFO，err 将会输出 ERR
        if (logLevel === 'all') {
            this.print(type, args)
        } else if (logLevel === 'debug' && (type === LogType.DEBUG || type === LogType.UI)) {
            this.print(type, args)
        } else if (logLevel === 'info' && type === LogType.INFO) {
            this.print(type, args)
        } else if (logLevel === 'err' && type === LogType.ERR) {
            this.print(type, args)
        }
    }
    info(args: string) {
        this.add(LogType.INFO, args)
    }
    error(args: string) {
        this.add(LogType.ERR, args)
    }
    debug(args: string) {
        this.add(LogType.DEBUG, args)
    }

    /**
     * 打印一条日志
     * @param type 日志类型
     * @param args 日志内容
     */
    private print(type: LogType, args: string) {
        console.log(`%c${LogType[type]}%c ${args}`, `background:#${this.logTypeInfo[type][0]};color:#${this.logTypeInfo[type][1]};border-radius:7px 0 0 7px;display:inline-block;padding:2px 4px 2px 7px;`, '');
    }
}

// =============== 系统消息 ===============

export enum PopType {
    INFO = 'circle-info',
    ERR = 'circle-exclamation'
}

export class PopInfo {
    /**
     * 
     * @param typeInfo 消息类型
     * @param args 消息内容
     * @param isAutoClose 是否自动关闭（默认为 true）
     */
    add(icon: PopType, args: string, isAutoClose = true) {
        const data: PopInfoElem = {
            id: popList.length,
            svg: icon,
            text: args,
            autoClose: isAutoClose
        }
        popList.splice(popList.length, 0, data)
        // 创建定时器
        if (data.autoClose) {
            setTimeout(() => {
                this.remove(data.id)
            }, 5000)
        }
    }

    /**
     * 移除一条消息
     * @param id 消息编号
     */
    remove(id: number) {
        const index = popList.findIndex((item) => {
            return item.id === id
        })
        if (index !== -1) {
            popList.splice(index, 1)
        }
    }

    /**
     * 清空所有消息
     */
    clear() {
        // 因为消息是有动画的，所以需要延迟清空
        setTimeout(() => {
            popList.splice(0, popList.length)
        }, 300)
    }
}

export const popList: PopInfoElem[] = reactive([])