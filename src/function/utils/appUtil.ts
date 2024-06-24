import app from '@/main'
import zh from '@/assets/l10n/zh-CN.json'
import FileDownloader from 'js-file-downloader'
import option, { remove } from '@/function/option'
import cmp from 'semver-compare'
import appInfo from '../../../package.json'


import AboutPan from '@/components/AboutPan.vue'
import UpdatePan from '@/components/UpdatePan.vue'
import WelPan from '@/components/WelPan.vue'

import { Rule, Stylesheet, Declaration } from 'css'
import { LogType, Logger, PopInfo, PopType } from '@/function/base'
import { Connector, login } from '@/function/connect'
import { runtimeData } from '@/function/msg'
import { BaseChatInfoElem } from '@/function/elements/information'
import { hslToRgb, rgbToHsl } from '@/function/utils/systemUtil'
import { toRaw, nextTick } from 'vue'
import { sendMsgRaw } from './msgUtil'
import { parseMsg } from '../sender'

const popInfo = new PopInfo()
const logger = new Logger()

/**
 * 滚动到目标消息（不自动加载）
 * @param seqName DOM 名
 */
export function scrollToMsg (seqName: string, showAnimation: boolean): boolean {
    const msg = document.getElementById(seqName)
    if (msg) {
        const pan = document.getElementById('msgPan')
        if (pan !== null) {
            if (showAnimation === false) {
                pan.style.scrollBehavior = 'unset'
            } else {
                pan.style.scrollBehavior = 'smooth'
            }
            pan.scrollTop = msg.offsetTop - msg.offsetHeight + 10
            pan.style.scrollBehavior = 'smooth'
            msg.style.transition = 'background 1s'
            msg.style.background = 'rgba(0, 0, 0, 0.06)'
            setTimeout(() => {
                msg.style.background = 'unset'
                setTimeout(() => {
                    msg.style.transition = 'background .3s'
                }, 1100)
            }, 3000)
            return true
        }
    }
    return false
}

/**
 * 打开链接
 * @param url 链接
 */
export function openLink(url: string) {
    // 判断是不是 Electron，是的话打开内嵌 iframe
    if(runtimeData.tags.isElectron) {
        const popInfo = {
            html: `<iframe src="${url}" class="view-iframe"></iframe>`,
            full: true,
            button: [
                {
                    text: app.config.globalProperties.$t('btn_iframe_tip'),
                    fun: () => undefined
                },
                {
                    text: app.config.globalProperties.$t('btn_open'),
                    fun: () => {
                        const electron = window.require('electron')
                        const shell = electron ? electron.shell : null
                        if (shell) {
                            shell.openExternal(url)
                        }
                        runtimeData.popBoxList.shift()
                    }
                },
                {
                    text: app.config.globalProperties.$t('btn_close'),
                    master: true,
                    fun: () => { runtimeData.popBoxList.shift() }
                }
            ]
        }
        runtimeData.popBoxList = []
        runtimeData.popBoxList.push(popInfo)
    } else {
        window.open(url)
    }
}

/**
 * 加载历史消息
 * @param info 聊天基本信息
 */
export function loadHistory(info: BaseChatInfoElem) {
    runtimeData.messageList = []
    if (!loadHistoryMessage(info.id, info.type)) {
        new PopInfo().add(PopType.ERR, app.config.globalProperties.$t('pop_load_history_fail'), false)
    }
}
export function loadHistoryMessage(id: number, type: string, count = 20, echo = 'getChatHistoryFist') {
    let name
    if(runtimeData.jsonMap.message_list && type != "group") {
        name = runtimeData.jsonMap.message_list.private_name
    } else {
        name = runtimeData.jsonMap.message_list.name
    }

    Connector.send(
        name ?? 'get_chat_history',
        {
            message_type: runtimeData.jsonMap.message_list.message_type[type],
            group_id: type == "group" ? id : undefined,
            user_id: type != "group" ? id : undefined,
            message_seq: 0,
            message_id: 0,
            count: count
        },
        echo
    )
    return true
}

/**
 * 重新加载用户列表
 */
export function reloadUsers() {
    // 加载用户列表
    if (login.status) {
        runtimeData.userList = []
        Connector.send('get_friend_list', {}, 'getFriendList')
        Connector.send('get_group_list', {}, 'getGroupList')
        Connector.send('get_system_msg', {}, 'getSystemMsg')
        Connector.send(runtimeData.jsonMap.class_list.name, {}, "getClassInfo")
    }
}

/**
 * 通过用户和消息 ID 跳转到对应的消息
 * @param id 
 * @param msgId 
 */
export function jumpToChat(userId: string, msgId: string) {
    const body = document.getElementById('user-' + userId)
    if (body === null) {
        // 从缓存列表里寻找这个 ID
        for (let i = 0; i < runtimeData.userList.length; i++) {
            const item = runtimeData.userList[i]
            const id = item.user_id !== undefined ? item.user_id : item.group_id
            if (String(id) === userId) {
                // 把它插入到显示列表的第一个
                runtimeData.showList?.unshift(item)
                nextTick(() => {
                    const bodyNext = document.getElementById('user-' + userId)
                    if (bodyNext !== null) {
                        // 添加一个消息跳转标记
                        bodyNext.dataset.jump = msgId
                        // 然后点一下它触发聊天框切换
                        bodyNext.click()
                    }
                })
                break
            }
        }
    } else {
        body.click()
    }
}

/**
 * 初始化构建 UI Test 的范例数据
 */
export function initUITest() {
    // 绕过登陆判定
    runtimeData.loginInfo.status = true
    runtimeData.loginInfo.info = { 'uin': 1111111111, 'lnick': '这只是测试用的数据', 'nick': '林小槐' }
    // 填充运行时数据
    // Vue.set(runtimeData, 'onChat', { "type": "group", "id": 1111111111, "name": "Stapxs QQ Lite 内测群", "avatar": "https://p.qlogo.cn/gh/1111111111/1111111111/0", "info": { "group": {}, "group_members": [{ "user_id": 2222222222, "nickname": "林小槐", "card": "", "level": 1, "role": "admin" }, { "user_id": 3333333333, "nickname": "HappyDay's  small ID", "card": "", "level": 1, "role": "member" }, { "user_id": 4444444444, "nickname": "晓狩", "card": "", "level": 1, "role": "member" }], "group_files": { "file_list": [{ "bus_id": 104, "create_time": 1669356711, "dead_time": 1670221311, "download_times": 2, "id": "/0d55f622-6c88-11ed-8d9f-5254001daf95", "md5": "8106ece97e5de9434d63faa991d8513f", "name": "901309905.mp4", "owner_name": "林小槐", "owner_uin": 2222222222, "parent_id": "/", "size": 161478663, "type": 1 }], "next_index": 0, "total_cnt": 1 }, "group_sub_files": {}, "user": {}, "me": { "group_id": 1111111111, "user_id": 2222222222, "nickname": "林小槐", "card": "", "level": 1, "role": "admin", "echo": "getUserInfoInGroup" }, "group_notices": { "feeds": [{ "u": 2222222222, "msg": { "text": "Stapxs QQ Lite 2.0 来辣，戳下面的链接去用用看 ……\nmemo 全新的 README（还有点感谢内容要写）\nsparkles 群公告支持（不支持图片）\nbug 修正在窄布局下，底栏被消息组件弹窗遮挡\nart 拆分 MsgBody 的部分方法便于之后的兼容复用\nsparkles 消息列表部分功能（打开自动添加到消息列表、新消息置顶、新消息提示、显示消息预览）\nbug 修正了好友列表搜索不支持备注的遗漏 \nhttps://stapxs.github.io/Stapxs-QQ-Lite-2.0/", "text_face": "Stapxs QQ Lite 2.0 来辣，戳下面的链接去用用看 ……\nmemo 全新的 README（还有点感谢内容要写）\nsparkles 群公告支持（不支持图片）\nbug 修正在窄布局下，底栏被消息组件弹窗遮挡\nart 拆分 MsgBody 的部分方法便于之后的兼容复用\nsparkles 消息列表部分功能（打开自动添加到消息列表、新消息置顶、新消息提示、显示消息预览）\nbug 修正了好友列表搜索不支持备注的遗漏 \nhttps://stapxs.github.io/Stapxs-QQ-Lite-2.0/", "title": "群公告" }, "read_num": 4, "is_read": 0 }] } } })
    // Vue.set(runtimeData, 'userList', [{ "user_id": 3333333333, "nickname": "晓狩", "sex": "male", "remark": "" }, { "group_id": 1000000000, "group_name": "DHW ∞ 行在", "owner_id": 2222222222 }])
    // Vue.set(runtimeData, 'onMsg', [{ "group_id": 1000000000, "group_name": "DHW ∞ 行在", "owner_id": 2222222222, "new_msg": false }, { "group_id": 1111111111, "group_name": "Stapxs QQ Lite 内测群", "owner_id": 2222222222, "new_msg": true }])
    // Vue.set(runtimeData, 'messageList', [{ "post_type": "message", "message_id": "E/1", "user_id": 2222222222, "time": 1669898020, "seq": 9706, "rand": 1560268290, "font": "微软雅黑", "message": [{ "type": "text", "text": "又遇到个见鬼的 BUG ……" }], "raw_message": "又遇到个见鬼的 BUG ……", "message_type": "group", "sender": { "user_id": 2222222222, "nickname": "林小槐", "card": "" }, "group_id": 1111111111, "atme": false, "atall": false }, { "post_type": "message", "message_id": "E/2", "user_id": 2222222222, "time": 1669898020, "seq": 9706, "rand": 1560268290, "font": "微软雅黑", "message": [{ "type": "text", "text": "https://github.com/Stapxs/Stapxs-QQ-Lite-2.0" }], "raw_message": "https://github.com/Stapxs/Stapxs-QQ-Lite-2.0", "message_type": "group", "sender": { "user_id": 2222222222, "nickname": "林小槐", "card": "" }, "group_id": 1111111111, "atme": false, "atall": false }, { "post_type": "message", "message_id": "E/3", "user_id": 2222222222, "time": 1669898020, "seq": 9706, "rand": 1560268290, "font": "微软雅黑", "message": [{ "type": "text", "text": "看看现在好没好" }], "raw_message": "看看现在好没好", "message_type": "group", "sender": { "user_id": 2222222222, "nickname": "林小槐", "card": "" }, "group_id": 1111111111, "atme": false, "atall": false }, { "post_type": "notice", "notice_type": "group", "group_id": 1111111111, "sub_type": "recall", "user_id": 2222222222, "operator_id": 2222222222, "message_id": "这个不重要", "self_id": 2222222222, "name": "林小槐", "time": 1669898020 }, { "post_type": "message", "message_id": "E/5", "user_id": 2222222222, "time": 1669943800, "seq": 114361, "rand": 3096699112, "font": "宋体", "message": [{ "type": "image", "file": "66cba6ff5b2364d27eb3d6ed4d2faeca92966-554-838.png", "url": "https://gchat.qpic.cn/gchatpic_new/1007028430/560932983-3133756386-66CBA6FF5B2364D27EB3D6ED4D2FAECA/0?term=2&is_origin=0", "asface": false }, { "type": "text", "text": " 像是这样翻译模式（UI 测试模式）应该就能用了 hummmm" }], "raw_message": "[图片] 像是这样翻译模式（UI 测试模式）应该就能用了 hummmm", "message_type": "group", "sender": { "user_id": 2222222222, "nickname": "林小槐 - Stapx_Steve", "card": "林小槐 - Stapx_Steve", "level": 1, "role": "admin" }, "group_id": 1111111111 }])
    // Vue.set(runtimeData, 'botInfo', { "app_name": "oicq2", "version": "2.3.1", "http_api": "1.1.0", "stat": { "start_time": 1669940663, "lost_times": 0, "recv_pkt_cnt": 30, "sent_pkt_cnt": 24, "lost_pkt_cnt": 0, "recv_msg_cnt": 1, "sent_msg_cnt": 0, "msg_cnt_per_min": 0, "remote_ip": "58.212.179.115", "remote_port": 8080 } })
    // Vue.set(runtimeData, 'loginInfo', { "uin": 2222222222, "status": "online", "nickname": "林小槐", "sex": "male" })
    // Vue.set(runtimeData, 'showData', [{ "group_id": 1000000000, "group_name": "DHW ∞ 行在", "owner_id": 2222222222 }, { "user_id": 3333333333, "nickname": "晓狩", "sex": "male", "remark": "" }])
    // Vue.set(runtimeData, 'mergeMessageList', [{ "user_id": 2222222222, "time": 1669942039, "nickname": "林小槐 - Stapx_Steve", "group_id": 1111111111, "message": [{ "type": "image", "file": "6b02169dd9cb486330e400fdebf8312a5310-290-290.jpg", "url": "https://gchat.qpic.cn/gchatpic_new/1007028430/560932983-2842238012-6B02169DD9CB486330E400FDEBF8312A/0?term=2&is_origin=0", "asface": true }], "raw_message": "[动画表情]", "sender": { "user_id": 2222222222, "nickname": "林小槐 - Stapx_Steve", "card": "林小槐 - Stapx_Steve" } }, { "time": 1669893493, "user_id": 2222222222, "nickname": "林小槐 - Stapx_Steve", "group_id": 1111111111, "message": [{ "type": "text", "text": "烦内" }], "raw_message": "烦内", "sender": { "user_id": 2222222222, "nickname": "林小槐 - Stapx_Steve", "card": "林小槐 - Stapx_Steve" } }])
    // Vue.set(runtimeData, 'stickers', [])
    // 输出所有的 popInfo
    popInfo.add(PopType.INFO, app.config.globalProperties.$t('pop_print_all_pop'), true)
    setTimeout(() => {
        const lang = zh
        const list = Object.keys(lang).filter((item) => { return item.startsWith('pop') })
        for (let i = 0; i < list.length; i++) {
            const item = list[i]
            setTimeout(() => {
                popInfo.add(PopType.INFO, app.config.globalProperties.$t(item, { code: 'test' }), true)
            }, 3000 * i)
        }
    }, 5000)
}

/**
 * 下载文件
 * @param url 文件链接
 * @param process 下载中回调
 */
export function downloadFile (url: string, name: string, onprocess: (event: ProgressEvent & {[key: string]: any}) => undefined) {
    if(document.location.protocol == 'https:') {
        // 判断下载文件 URL 的协议
        // PS：Chrome 不会对 http 下载的文件进行协议升级
        if(url.toLowerCase().startsWith('http:')) {
            url = 'https' + url.substring(url.indexOf('://'))
        }
    }
    if(runtimeData.tags.isElectron) {
        new FileDownloader({
            url: url,
            autoStart: true,
            process: onprocess,
            nameCallback: function () {
                return name
            }
        }).catch(function (error) {
            if (error) {
                console.log(error)
            }
        })
    } else {
        if(runtimeData.reader) {
            runtimeData.reader.on('sys:downloadBack', (event, params) => {
                onprocess(params)
            })
            runtimeData.reader.send('sys:download', {
                downloadPath: url,
                fileName: name
            })
        }
    }
}

/**
 * 使用 gtk CSS 更新 Border Card UI 配色表
 * @param cssStr css 字符串
 */
function updateGTKTheme(cssStr: string) {
    if(option.get('log_level') == 'debug') {
        console.log(cssStr)
    }
    const css = window.require('css')
    let cssObj = undefined
    let color = '#000'
    // color-main
    color = cssStr.substring(cssStr.indexOf('@define-color theme_fg_color') + 29)
    color = color.substring(0, color.indexOf(';'))
    document.documentElement.style.setProperty('--color-main', color)
    // color-bg
    color = cssStr.substring(cssStr.indexOf('@define-color theme_bg_color') + 29)
    color = color.substring(0, color.indexOf(';'))
    document.documentElement.style.setProperty('--color-bg', color)
    document.documentElement.style.setProperty('--color-card', color)
    // color-card
    color = cssStr.substring(cssStr.indexOf('.context-menu {'))
    color = color.substring(0, color.indexOf('}') + 1)
    cssObj = css.parse(color, {silent: true}) as Stylesheet
    if(cssObj.stylesheet) {
        const colorGet = ((cssObj.stylesheet.rules[0] as Rule).declarations?.filter((item: Declaration) => {
            return item.property == 'background-color'
        })[0] as Declaration).value
        if(colorGet) {
            document.documentElement.style
                .setProperty('--color-card-1', colorGet)
        }
    }
    // color-card-1
    color = cssStr.substring(cssStr.indexOf('.context-menu .view:selected {'))
    color = color.substring(0, color.indexOf('}') + 1)
    cssObj = css.parse(color, {silent: true}) as Stylesheet
    if(cssObj.stylesheet) {
        const colorGet = ((cssObj.stylesheet.rules[0] as Rule).declarations?.filter((item: Declaration) => {
            return item.property == 'background-color'
        })[0] as Declaration).value
        if(colorGet) {
            document.documentElement.style
                .setProperty('--color-card-2', colorGet)
        }
    }
    // color-card-2
    // color = cssStr.substring(cssStr.indexOf('.context-menu menuitem:hover {'))
    // color = color.substring(0, color.indexOf('}') + 1)
    // cssObj = css.parse(color, {silent: true}) as Stylesheet
    // if(cssObj.stylesheet) {
    //     const colorGet = ((cssObj.stylesheet.rules[0] as Rule).declarations?.filter((item: Declaration) => {
    //         return item.property == 'background-color'
    //     })[0] as Declaration).value
    //     if(colorGet) {
    //         document.documentElement.style
    //             .setProperty('--color-card-2', colorGet)
    //     }
    // }
    // color-font
    color = cssStr.substring(cssStr.indexOf('@define-color theme_text_color') + 31)
    color = color.substring(0, color.indexOf(';'))
    document.documentElement.style.setProperty('--color-font', color)
    // color-font-1
    color = cssStr.substring(cssStr.indexOf('@define-color theme_unfocused_text_color') + 41)
    color = color.substring(0, color.indexOf(';'))
    document.documentElement.style.setProperty('--color-font-1', color)
    document.documentElement.style.setProperty('--color-font-2', color)
}

/**
 * electron：加载系统主题适配
 */
export async function loadSystemThemeColor() {
    // 加载 GTK 主题适配（以及主题更新回调监听）
    if (runtimeData.reader) {
        // 主题更新回调
        runtimeData.reader.on('sys:updateGTKTheme', (event, params) => {
            if(option.get('opt_auto_gtk') == true) {
                console.log('GTK 主题已更新：' + params.name)
                updateGTKTheme(params.css)
            }
        })
        updateGTKTheme(await runtimeData.reader.invoke('sys:getGTKTheme'))
        
    }
}

export async function loadWinColor() {
    if (runtimeData.reader) {
        // 获取系统主题色
        updateWinColor(await runtimeData.reader.invoke('sys:getWinColor'))
    }
}

export function updateWinColor(info: any) {
    if(!info.err) {
        // 平衡颜色亮度
        const hsl = rgbToHsl(info.color[0], info.color[1], info.color[2])
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const autodark = option.get('opt_auto_dark')
        const dark = option.get('opt_dark')
        if((autodark == true && media.matches) || (autodark != true && dark == true)) {
            hsl[2] = 0.8
        } else {
            hsl[2] = 0.3
        }
        info.color = hslToRgb(hsl[0], hsl[1], hsl[2])
        document.documentElement.style.setProperty('--color-main', 'rgb(' + info.color[0] + ',' + info.color[1] + ',' + info.color[2] + ')')
    } else {
        runtimeData.sysConfig['opt_auto_win_color'] = false
        new PopInfo().add(PopType.ERR, app.config.globalProperties.$t('option_view_auto_win_color_tip_1') + info.err)
    }
}

export function createMenu() {
    const { $t } = app.config.globalProperties
    // MacOS：初始化菜单
    if (runtimeData.reader) {
        // 初始化菜单
        const menuTitles = {} as { [key: string]: string }
        menuTitles.success = $t('load_success', { name: $t('name')})

        menuTitles.title = $t('name')
        menuTitles.about = $t('menu_about') + ' ' + $t('name')
        menuTitles.update = $t('menu_update')
        menuTitles.hide = $t('menu_hide') + ' ' + $t('name')
        menuTitles.hideOthers = $t('menu_hide_others')
        menuTitles.unhide = $t('menu_unhide')
        menuTitles.quit = $t('menu_quit') + ' ' + $t('name')

        menuTitles.edit = $t('menu_edit')
        menuTitles.undo = $t('menu_undo')
        menuTitles.redo = $t('menu_redo')
        menuTitles.cut = $t('menu_cut')
        menuTitles.copy = $t('menu_copy')
        menuTitles.paste = $t('menu_paste')
        menuTitles.selectAll = $t('menu_select_all')

        menuTitles.account = $t('menu_account')
        menuTitles.login = $t('menu_login')
        menuTitles.logout = $t('menu_logout')
        menuTitles.userList = $t('menu_user_list', { count: runtimeData.userList.length })
        menuTitles.flushUser = $t('menu_flush_user')

        menuTitles.help = $t('menu_help')
        menuTitles.doc = $t('menu_doc')
        menuTitles.feedback = $t('menu_feedback')
        menuTitles.license = $t('menu_license')

        runtimeData.reader.send('sys:createMenu', menuTitles)
    }
}

export function updateMenu(config: {id: string, action: string, value: any}) {
    // MacOS：更新菜单
    if (runtimeData.reader) {
        runtimeData.reader.send('sys:updateMenu', config)
    }
}

export function createIpc() {
    if (runtimeData.reader) {
        runtimeData.reader.on('bot:flushUser', () => {
            reloadUsers()
            popInfo.add(PopType.INFO, app.config.globalProperties.$t('pop_reload_user_success'))
        })
        runtimeData.reader.on('bot:logout', () => {
            remove('auto_connect')
            Connector.close()
        })
        runtimeData.reader.on('bot:quickReply', (event, data) => {
            sendMsgRaw(data.id, data.type, parseMsg(
                '[SQ:0]' + data.content,
                [{ type: 'reply', id: String(data.msg) }],
                []
            ))
            // 去消息列表内寻找，去除新消息标记
            for (let i = 0; i < runtimeData.onMsgList.length; i++) {
                if (runtimeData.onMsgList[i].group_id == data.id || runtimeData.onMsgList[i].user_id == data.id) {
                    runtimeData.onMsgList[i].new_msg = false
                    break
                }
            }
        })

        runtimeData.reader.on('sys:handleUri', (event, data) => {
            logger.info(JSON.stringify(data))
        })
        runtimeData.reader.on('app:about', () => {
            const popInfo = {
                title: app.config.globalProperties.$t('menu_about') + ' ' + app.config.globalProperties.$t('name'),
                template: AboutPan,
                allowQuickClose: false
            }
            runtimeData.popBoxList.push(popInfo)
        })
        runtimeData.reader.on('app:changeTab', (event, name) => {
            document.getElementById('bar-' + name.toLowerCase())?.click()
        })
        runtimeData.reader.on('app:openLink', (event, link) => {
            openLink(link)
        })
        runtimeData.reader.on('app:error', (event, text) => {
            new Logger().add(LogType.ERR, text)
        })
        runtimeData.reader.on('app:jumpChat', (event, info) => {
            jumpToChat(info.userId, info.msgId)
        })
    }
}

export function loadAppendStyle() {
    const platform = runtimeData.tags.platform
    logger.info('正在装载补充样式……')
    if (runtimeData.tags.isElectron) {
        import('@/assets/css/append/append_new.css').then(() => {
            logger.info('UI 2.0 附加样式加载完成')
        })
    }
    try {
        import(`@/assets/css/append/append_${platform}.css`).then(() => {
            logger.info(`${platform} 平台附加样式加载完成`)
        })
    } catch (e) {
        logger.info('未找到对应平台的附加样式')
    }
    let subVersion = runtimeData.tags.release?.split('.') as any
    subVersion = subVersion ? Number(subVersion[2]) : 0
    if (runtimeData.tags.isElectron && (platform == 'darwin' || (platform == 'win32' && subVersion > 22621))) {
        import('@/assets/css/append/append_vibrancy.css').then(() => {
            logger.info('透明 UI 附加样式加载完成')
        })
    }
    if(runtimeData.tags.isElectron && platform == 'linux') {
        const gnomeExtInfo = runtimeData.reader?.invoke('sys:getGnomeExt')
        if(gnomeExtInfo) {
            gnomeExtInfo.then((info: any) => {
                console.log(info)
                if(info['enable-all'] == 'true' || info['whitelist'].indexOf('stapxs-qq-lite') != -1) {
                    import('@/assets/css/append/append_vibrancy.css').then(() => {
                        logger.info('透明 UI 附加样式加载完成')
                    })
                    import('@/assets/css/append/append_gnome.css').then(() => {
                        logger.info('Blur my sell 附加样式加载完成')
                    })
                }
            })
        }
    }
}

export function checkUpdate() {
    const $t = app.config.globalProperties.$t
    const mainTree = 'next'                                 // 更新主分支
    const appVersion = appInfo.version                      // 当前版本
    const cacheVersion = localStorage.getItem('version')

    if (!runtimeData.tags.isElectron) {
        if (!cacheVersion || cmp(appVersion, cacheVersion) == 1) {
            localStorage.setItem('version', appVersion)
            logger.debug($t('version_updated') + ': ' + cacheVersion + ' -> ' + appVersion)
            showGitChangeLog(appVersion, mainTree, 'web')
        }
    } else {
        const packageUrl = `https://raw.githubusercontent.com/Stapxs/Stapxs-QQ-Lite-2.0/${mainTree}/package.json`
        fetch(packageUrl).then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    if (cmp(appVersion, data.version) == -1) {
                        showGitChangeLog(data.version, mainTree, 'electron')
                    }
                })
            }
        })
    }
}

function showGitChangeLog(version: string, mainTree: string, from: string) {
    const $t = app.config.globalProperties.$t
    // 获取更新记录
    const fetchData = {
        sha: 'next',
        per_page: '10'
    } as Record<string, string>
    const updateUrl = 'https://api.github.com/repos/stapxs/stapxs-qq-lite-2.0/commits'
        + '?' + new URLSearchParams(fetchData).toString()
    fetch(updateUrl).then((response) => {
        if (response.ok) {
            response.json().then((info) => {
                // 过滤掉一些不作为更新记录的提交
                info = info.filter((item: any) => !item.commit.message.startsWith('[nl]'))
                const json = info[0]
                // 如果标题是 [ 开头的但不是 [platform]，则不显示
                let platform = runtimeData.tags.platform
                if(from == 'web') platform = 'web'
                if (json.commit.message.startsWith('[') && !json.commit.message.startsWith('[' + platform + ']')) {
                    return
                }
                // 如果是 electron 构建的版本，只显示 [build-electron] 的提交
                if (from == 'web' || json.commit.message.indexOf('[build-electron]') > 0) {
                    const popInfo = {
                        template: UpdatePan,
                        templateValue: toRaw({
                            version: version + ' - ' + mainTree,
                            user: {
                                name: json.commit.author.name,
                                avatar: json.author.avatar_url,
                                date: json.commit.author.date,
                                url: json.author.html_url
                            },
                            message: json.commit.message,
                            from: from
                        }),
                        button: [
                            {
                                text: $t('btn_see'),
                                fun: () => openLink('https://github.com/Stapxs/Stapxs-QQ-Lite-2.0/commit/' + json.sha)
                            }, {
                                text: $t('btn_know'),
                                master: true,
                                fun: () => { runtimeData.popBoxList.shift() }
                            }
                        ]
                    }
                    if(from != 'web') {
                        popInfo.button = [
                            {
                                text: $t('btn_know'),
                                fun: () => runtimeData.popBoxList.shift()
                            }, {
                                text: $t('btn_download_update'),
                                master: true,
                                fun: () => {
                                    const url = 'https://github.com/Stapxs/Stapxs-QQ-Lite-2.0/releases'
                                    const electron = window.require('electron')
                                    const shell = electron ? electron.shell : null
                                    if (shell) {
                                        shell.openExternal(url)
                                    } else {
                                        window.open(url)
                                    }
                                }
                            }
                        ]
                    }
                    runtimeData.popBoxList.push(popInfo)
                }
            })
        }
    })
}

export function checkOpenTimes() {
    const $t = app.config.globalProperties.$t
    const times = localStorage.getItem('times')
    if (times != null) {
        const getTimes = Number(times) + 1
        localStorage.setItem('times', getTimes.toString())
        if (getTimes % 50 == 0) {
            // 构建 HTML
            let html = '<div style="display:flex;flex-direction:column;padding:10px 5%;align-items:center;">'
            html += '<svg style="height:2rem;fill:var(--color-font);margin-bottom:20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M16 0H144c5.3 0 10.3 2.7 13.3 7.1l81.1 121.6c-49.5 4.1-94 25.6-127.6 58.3L2.7 24.9C-.6 20-.9 13.7 1.9 8.5S10.1 0 16 0zM509.3 24.9L401.2 187.1c-33.5-32.7-78.1-54.2-127.6-58.3L354.7 7.1c3-4.5 8-7.1 13.3-7.1H496c5.9 0 11.3 3.2 14.1 8.5s2.5 11.5-.8 16.4zM432 336c0 97.2-78.8 176-176 176s-176-78.8-176-176s78.8-176 176-176s176 78.8 176 176zM264.4 241.1c-3.4-7-13.3-7-16.8 0l-22.4 45.4c-1.4 2.8-4 4.7-7 5.1L168 298.9c-7.7 1.1-10.7 10.5-5.2 16l36.3 35.4c2.2 2.2 3.2 5.2 2.7 8.3l-8.6 49.9c-1.3 7.6 6.7 13.5 13.6 9.9l44.8-23.6c2.7-1.4 6-1.4 8.7 0l44.8 23.6c6.9 3.6 14.9-2.2 13.6-9.9l-8.6-49.9c-.5-3 .5-6.1 2.7-8.3l36.3-35.4c5.6-5.4 2.5-14.8-5.2-16l-50.1-7.3c-3-.4-5.7-2.4-7-5.1l-22.4-45.4z"/></svg>'
            html += `<span>${$t('popbox_open_times_1', { times: getTimes })}</span>`
            html += `<span>${$t('popbox_open_times_2')}</span>`
            html += '</div>'
            const popInfo = {
                title: $t('popbox_ohh'),
                svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>',
                html: html,
                button: [
                    {
                        text: $t('btn_open_times_no'),
                        fun: () => { runtimeData.popBoxList.shift() }
                    }, {
                        text: $t('btn_open_times_ok'),
                        master: true,
                        fun: () => { openLink('https://github.com/Stapxs/Stapxs-QQ-Lite-2.0'); runtimeData.popBoxList.shift(); }
                    }
                ]
            }
            runtimeData.popBoxList.push(popInfo)
        }
    } else {
        localStorage.setItem('times', '1')
        // 首次打开，显示首次打开引导信息
        const popInfo = {
            template: WelPan,
            button: [
                {
                    text: 'close',
                    master: true,
                    fun: () => { runtimeData.popBoxList.shift() }
                }
            ]
        }
        runtimeData.popBoxList.push(popInfo)
    }
}

export function checkNotice() {
    const url = 'https://lib.stapxs.cn/download/stapxs-qq-lite/notice-config.json'
    const fetchData = {
        time: new Date().getTime().toString()
    } as Record<string, string>
    fetch(url + '?' + new URLSearchParams(fetchData).toString())
        .then(response => response.json())
        .then(data => {
            // 获取已显示过的公告 ID
            let noticeShow = [] as number[]
            const showId = localStorage.getItem('notice_show')
            if (showId) {
                noticeShow = showId.split(',').map((id: string) => parseInt(id))
            }
            // 解析公告列表
            data.forEach((notice: any) => {
                let isShowInDate = false
                if (!notice.show_date) {
                    isShowInDate = true
                }
                else if (typeof notice.show_date == 'string' && new Date().toDateString() === new Date(notice.show_date).toDateString()) {
                    isShowInDate = true
                } else if (typeof notice.show_date == 'object') {
                    notice.show_date.forEach((date: number) => {
                        if (new Date().toDateString() === new Date(date).toDateString()) {
                            isShowInDate = true
                        }
                    })
                }
                if (notice.version == 2 && noticeShow.indexOf((notice.id).toString()) < 0 && isShowInDate) {
                    // 加载公告弹窗列表
                    for (let i = 0; i < notice.pops.length; i++) {
                        // 添加弹窗
                        const info = notice.pops[i]
                        const popInfo = {
                            title: info.title,
                            html: info.html ? info.html : '',
                            button: [
                                {
                                    text: (notice.pops.length > 1 && i != notice.pops.length - 1) ? app.config.globalProperties.$t('btn_next') : app.config.globalProperties.$t('btn_yes'),
                                    master: true,
                                    fun: () => {
                                        // 添加已读记录
                                        if (noticeShow.indexOf(notice.id) < 0) {
                                            noticeShow.push(notice.id)
                                        }
                                        localStorage.setItem('notice_show', noticeShow.toString())
                                        // 关闭弹窗
                                        runtimeData.popBoxList.shift()
                                    }
                                }
                            ]
                        }
                        runtimeData.popBoxList.push(popInfo)
                    }
                }
            })
        })
}
