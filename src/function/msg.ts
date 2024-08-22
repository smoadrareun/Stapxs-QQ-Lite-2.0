/*
 * @FileDescription: 消息处理模块
 * @Author: Stapxs
 * @Date: 
 *      2022/11/1
 *      2022/12/7
 * @Version: 
 *      1.0 - 初始版本
 *      2.0 - 重构为 ts 版本，修改 Vue3 相关变更
 * @Description: 此模块用于拆分和保存/处理 bot 返回的各类信息，整个运行时数据也保存在这儿。
*/
import qed from '@/assets/qed.txt'

import app from '@/main'
import Option from './option'
import xss from 'xss'
import pinyin from 'pinyin'

import Umami from '@stapxs/umami-logger-typescript'

import { buildMsgList, getMsgData, parseMsgList, getMsgRawTxt, updateLastestHistory } from '@/function/utils/msgUtil'
import { getViewTime, escape2Html, randomNum } from '@/function/utils/systemUtil'
import { reloadUsers, reloadCookies, downloadFile, updateMenu, jumpToChat, loadJsonMap } from '@/function/utils/appUtil'
import { reactive, markRaw, defineAsyncComponent } from 'vue'
import { PopInfo, PopType, Logger, LogType } from './base'
import { Connector, login } from './connect'
import { GroupMemberInfoElem, UserFriendElem, UserGroupElem, MsgItemElem, RunTimeDataElem, BotMsgType } from './elements/information'
import { NotificationElem } from './elements/system'
import { IPinyinOptions } from 'pinyin/lib/declare'

const popInfo = new PopInfo()
// eslint-disable-next-line
let msgPath = require('@/assets/pathMap/Lagrange.OneBot.yaml')

// 其他 tag
let listLoadTimes = 0

export function parse(str: string) {
    const msg = JSON.parse(str)
    if (msg.echo !== undefined) {
        const echoList = msg.echo.split('_')
        const head = echoList[0]
        // 处理追加方法
        // PS：这儿对插件附加方法进行寻找执行，同名将会覆盖已有方法
        if (appendMsg[head]) {
            appendMsg[head](msg)
        } else {
            switch (head) {
                case 'getVersionInfo'           : saveBotInfo(msg); break
                case 'getLoginInfo'             : saveLoginInfo(msg); break
                case 'getMoreLoginInfo'         : runtimeData.loginInfo.info = msg.data.data.result.buddy.info_list[0]; break
                case 'getGroupList'             : saveUser(msg, 'group'); break
                case 'getFriendList'            : saveUser(msg, 'friend'); break
                case 'getFriendCategory'        : saveClassInfoAlone(msg); break
                case 'getUserInfoInGroup'       : runtimeData.chatInfo.info.me_info = msg; break
                case 'getGroupMemberList'       : saveGroupMember(msg.data); break
                case 'getChatHistoryFist'       : saveMsg(msg, 'top'); break
                case 'getChatHistoryOnMsg'      : updateTopMsg(msg, echoList); break
                case 'getChatHistory'           : saveMsg(msg, 'top'); break
                case 'getForwardMsg'            : saveForwardMsg(msg); break
                case 'sendMsgBack'              : showSendedMsg(msg, echoList); break
                case 'getRoamingStamp'          : saveSticker(msg.data); break
                case 'getMoreGroupInfo'         : runtimeData.chatInfo.info.group_info = msg.data.data; break
                case 'getMoreUserInfo'          : runtimeData.chatInfo.info.user_info = msg.data.data.result.buddy.info_list[0]; break
                case 'getGroupNotices'          : saveGroupNotices(msg); break
                case 'getGroupFiles'            : saveFileList(msg.data.data); break
                case 'getMoreGroupFiles'        : saveMoreFileList(msg.data.data); break
                case 'getJin'                   : saveJin(msg.data); break
                case 'getSystemMsg'             : runtimeData.systemNoticesList = msg.data; break
                case 'getSendMsg'               : saveSendedMsg(echoList, msg); break
                case 'getGroupMemberInfo'       : saveMemberInfo(msg); break
                case 'downloadFile'             : downloadFileChat(msg); break
                case 'downloadGroupFile'        : downloadGroupFile(msg); break
                case 'getVideoUrl'              : getVideoUrl(msg); break
                case 'getGroupDirFiles'         : saveDirFile(msg); break
                case 'readMemberMessage'        : readMemberMessage(msg.data[0]); break
                case 'setFriendAdd':
                case 'setGroupAdd'              : updateSysInfo(head); break
                case 'loadFileBase'             : loadFileBase(echoList, msg); break
                case 'GetRecentContact'         : createRecentContact(msg); break

                case 'getCookies'               : saveCookie(msg, echoList); break
            }
        }
    } else {
        switch (msg.post_type) {
            // 心跳包
            case 'meta_event'           : break
            // go-cqhttp：主动发送的消息回调和其他消息有区分
            case 'message_sent':
            case 'message'              : newMsg(msg); break
            case 'request'              : addSystemNotice(msg); break
            case 'notice': {
                let typeName = msg.notice_type
                if (!typeName) typeName = msg.sub_type
                switch (msg.notice_type) {
                    case 'friend'                   : friendNotice(msg); break
                    case 'group_recall':
                    case 'friend_recall':
                    case 'recall'                   : revokeMsg(msg); break
                    case 'group_msg_emoji_like'     : showEmojiLike(msg); break
                }
                break
            }
        }
    }
}


// ==============================================================

/**
 * 显示回应表情
 * @param data Notice 消息
 */
function showEmojiLike(data: any) {
    const msgId = data.message_id
    const emojiList = data.likes
    // 寻找消息
    runtimeData.messageList.forEach((item, index) => {
        if (item.message_id === msgId) {
            runtimeData.messageList[index].emoji_like = emojiList
        }
    })
}

/**
 * 保存 Bot 信息
 * @param data Bot 信息
 */
function saveBotInfo(msg: { [key: string]: any }) {
    const msgBody = getMsgData('version_info', msg, msgPath.version_info)

    if (msgBody) {
        const data = msgBody[0]
        runtimeData.botInfo = data
        // UM：提交分析信息，主要在意的是 bot 类型
        if (Option.get('open_ga_bot') !== false) {
            if (data.app_name !== undefined) {
                Umami.trackEvent('connect', { method: data.app_name })
            } else {
                Umami.trackEvent('connect', { method: '' })
            }
        }
        if (!login.status) {
            // 尝试动态载入对应的 pathMap
            if (data.app_name !== undefined) {
                const getMap = loadJsonMap(data.app_name)
                if(getMap != null) msgPath = getMap
            }
            // 继续获取后续内容
            Connector.send('get_login_info', {}, 'getLoginInfo')
        }
    }
}

/**
 * 保存账号信息
 * @param data 账号信息
 */
function saveLoginInfo(msg: { [key: string]: any }) {
    const msgBody = getMsgData('login_info', msg, msgPath.login_info)
    if (msgBody) {
        const data = msgBody[0]

        // 完成登陆初始化
        runtimeData.loginInfo = data
        login.status = true
        // 显示账户菜单
        updateMenu({ id: 'userName', action: 'label', value: data.nickname })
        // 结束登录页面的水波动画
        clearInterval(runtimeData.tags.loginWaveTimer)
        // 跳转标签卡
        const barMsg = document.getElementById('bar-msg')
        if (barMsg != null) barMsg.click()
        // 获取更详细的信息
        const url = 'https://find.qq.com/proxy/domain/cgi.find.qq.com/qqfind/find_v11?backver=2'
        const info = `bnum=15&pagesize=15&id=0&sid=0&page=0&pageindex=0&ext=&guagua=1&gnum=12&guaguan=2&type=2&ver=4903&longitude=116.405285&latitude=39.904989&lbs_addr_country=%E4%B8%AD%E5%9B%BD&lbs_addr_province=%E5%8C%97%E4%BA%AC&lbs_addr_city=%E5%8C%97%E4%BA%AC%E5%B8%82&keyword=${data.uin}&nf=0&of=0&ldw=${data.bkn}`
        Connector.send(
            'http_proxy',
            { 'url': url, 'method': 'post', 'data': info },
            'getMoreLoginInfo'
        )
        // 加载列表消息
        reloadUsers()
        reloadCookies()
    }
}

function saveGroupNotices(msg: any) {
    const list = getMsgData('group_notices', msg, msgPath.group_notices)
    if (list != undefined) {
        runtimeData.chatInfo.info.group_notices = list
    }
}

function createRecentContact(data: any) {
    const list = getMsgData('recent_contact', data, msgPath.recent_contact)
    if (list != undefined) {
        // user_id: /peerUin
        // time: /msgTime
        // chat_type: /chatType
        // 过滤掉 chatType 不是 1 和 2 的
        let back = list.filter((item) => {
            return item.chat_type == 1 || item.chat_type == 2
        })
        // 排除掉在置顶列表里的
        const topList = runtimeData.sysConfig.top_info as { [key: string]: number[] } | null
        if(topList != null) {
            const top = topList[runtimeData.loginInfo.uin]
            if(top != undefined) {
                back = back.filter((item) => {
                    return top.indexOf(Number(item.user_id)) == -1
                })
            }
        }
        // 去重
        back = back.filter((item, index, arr) => {
            return arr.findIndex((item2) => {
                return item2.user_id == item.user_id
            }) == index
        })
        back.forEach((item) => {
            // 去消息列表里找一下它
            const user = runtimeData.userList.find((user) => {
                return user.user_id == item.user_id
            })
            const inMsgList = runtimeData.onMsgList.find((msg) => {
                return msg.user_id == item.user_id
            }) != undefined
            if(user && !inMsgList) {
                runtimeData.onMsgList.push(user)
                updateLastestHistory(user)
            }
        })
    }
}

function saveUser(msg: { [key: string]: any }, type: string) {
    listLoadTimes ++
    let list: any[] | undefined
    if(msgPath.user_list)
        list = getMsgData('user_list', msg, msgPath.user_list)
    else {
        switch(type) {
            case 'friend':
                list = getMsgData('friend_list', msg, msgPath.friend_list)
                if(list)
                    // 根据 user_id 去重
                    list = list.filter((item, index, arr) => {
                        return arr.findIndex((item2) => {
                            return item2.user_id == item.user_id
                        }) == index
                    })
                break
            case 'group':
                list = getMsgData('group_list', msg, msgPath.group_list)
                if(list)
                    // 根据 group_id 去重
                    list = list.filter((item, index, arr) => {
                        return arr.findIndex((item2) => {
                            return item2.group_id == item.group_id
                        }) == index
                    })
                break
        }
    }
    if (list != undefined) {
        const pyConfig = { style: 0 } as IPinyinOptions
        const groupNames = {} as {[key: number]: string}
        list.forEach((item, index) => {
            // 为所有项目追加拼音名称
            let py_name = ''
            if (item.group_id) {
                py_name = pinyin(item.group_name, pyConfig).join('')
            } else {
                py_name = pinyin(item.nickname, pyConfig).join('') + ',' +
                    pinyin(item.remark, pyConfig).join('')
            }
            if(list && list[index]) list[index].py_name = py_name
            // 构建分类
            if (type == 'friend') {
                if (item.class_id != undefined && item.class_name) {
                    groupNames[item.class_id] = item.class_name
                }
                delete item.group_name
            } else {
                delete item.class_id
                delete item.class_name
            }
        })
        if(Object.keys(groupNames).length > 0) {
            // 把 groupNames 处理为 { class_id: number, class_name: string }[]
            const groupNamesList = [] as { class_id: number, class_name: string }[]
            for(const key in groupNames) {
                groupNamesList.push({ class_id: Number(key), class_name: groupNames[key] })
            }
            saveClassInfo(groupNamesList)
        }
        runtimeData.userList = runtimeData.userList.concat(list)
        // 刷新置顶列表
        const info = runtimeData.sysConfig.top_info as { [key: string]: number[] } | null
        if (info != null) {
            const topList = info[runtimeData.loginInfo.uin]
            if (topList !== undefined) {
                list.forEach((item) => {
                    const id = Number(item.user_id ? item.user_id : item.group_id)
                    if (topList.indexOf(id) >= 0) {
                        item.always_top = true
                        // 判断它在不在消息列表里
                        const get = runtimeData.onMsgList.filter((msg) => {
                            return msg.user_id === id || msg.group_id === id
                        })
                        if (get.length !== 1) {
                            runtimeData.onMsgList.push(item)
                            // 给它获取一下最新的一条消息
                            // 给置顶的用户刷新最新一条的消息用于显示
                            runtimeData.userList.forEach((item) => {
                                if (item.always_top) {
                                    updateLastestHistory(item)
                                }
                            })
                        }
                    }
                })
            }
        }
        // 更新菜单
        updateMenu({
            id: 'userList',
            action: 'label',
            value: app.config.globalProperties.$t('menu_user_list', { count: runtimeData.userList.length })
        })
    }
    // 如果获取次数大于 0 并且是双数，刷新一下历史会话
    if(listLoadTimes > 0 && listLoadTimes % 2 == 0) {
        // 获取最近的会话
        if(runtimeData.jsonMap.recent_contact)
            Connector.send(runtimeData.jsonMap.recent_contact.name, {}, 'GetRecentContact')
    }
    // 如果是分离式的好友列表，继续获取分类信息
    if(type == 'friend' && runtimeData.jsonMap.friend_category) {
        Connector.send(runtimeData.jsonMap.friend_category.name, {}, 'getFriendCategory')
    }
}

function updateTopMsg(msg: any, echoList: string[]) {
    const id = Number(echoList[1])
    if (id) {
        // 对消息进行一次格式化处理
        let list = getMsgData('message_list', msg, msgPath.message_list)
        if (list != undefined) {
            list = parseMsgList(list, msgPath.message_list.type, msgPath.message_value)
            const raw = getMsgRawTxt(list[0].message)
            const sender = list[0].sender
            const time = list[0].time
            // 更新消息列表
            runtimeData.onMsgList.forEach((item) => {
                if (item.user_id == id) {
                    item.raw_msg = raw
                } else if(item.group_id == id) {
                    item.raw_msg = sender.nickname + ': ' + raw
                }
                item.time = getViewTime(Number(time))
            })
        }
    }
}

function saveClassInfoAlone(msg: any) {
    const list = getMsgData('friend_category', msg, msgPath.friend_category) as {
        class_id: number,
        class_name: string,
        sort_id: number,
        users: number[]
    }[]
    if (list != undefined) {
        saveClassInfo(list)
    }
    // 刷新用户列表的分类信息
    list.forEach((item) => {
        item.users.forEach((id) => {
            runtimeData.userList.forEach((user) => {
                if (user.user_id == id && user.class_id == undefined) {
                    user.class_id = item.class_id
                    user.class_name = item.class_name
                }
            })
        })
    })
}
function saveClassInfo(list: { class_id: number, class_name: string, sort_id?: number }[]) {
    // 按拼音重新排序
    // const names = [] as string[]
    // list.forEach((item) => {
    //     names.push(item.class_name)
    // })
    // const sortedData = names.sort(pinyin.compare)
    // const back = [] as { class_id: number, class_name: string }[]
    // sortedData.forEach((name) => {
    //     list.forEach((item) => {
    //         if (item.class_name == name) {
    //             back.push(item)
    //         }
    //     })
    // })

    if(list[0].sort_id != undefined) {
        // 如果有 sort_id，按 sort_id 排序，从小到大
        list.sort((a, b) => {
            if(a.sort_id && b.sort_id) 
                return a.sort_id - b.sort_id
            else return 0
        })
    } else {
        // 按 class_id 排序
        list.sort((a, b) => {
            return a.class_id - b.class_id
        })
    }

    runtimeData.tags.classes = list
}

function saveGroupMember(data: GroupMemberInfoElem[]) {
    // 筛选列表
    const adminList = data.filter((item: GroupMemberInfoElem) => {
        return item.role === 'admin'
    })
    const createrList = data.filter((item: GroupMemberInfoElem) => {
        return item.role === 'owner'
    })
    const memberList = data.filter((item: GroupMemberInfoElem) => {
        return item.role !== 'admin' && item.role !== 'owner'
    })
    // 拼接列表
    const back = createrList.concat(adminList.concat(memberList))
    runtimeData.chatInfo.info.group_members = back
}

function saveMsg(msg: any, append = undefined as undefined | string) {
    if (msg.error !== null && (msg.error !== undefined || msg.status === 'failed')) {
        popInfo.add(PopType.ERR, app.config.globalProperties.$t('pop_chat_load_msg_err', { code: msg.error | msg.retcode }))
    } else {
        let list = getMsgData('message_list', msg, msgPath.message_list)
        list = getMessageList(list)
        if (list != undefined) {
            // 追加处理
            if (append != undefined) {
                // 没有更旧的消息能加载了，禁用允许加载标志
                if (list.length < 1) {
                    runtimeData.tags.canLoadHistory = false
                    return
                }
                if (append == 'top') {
                    // 判断 list 的最后一条消息是否和 runtimeData.messageList 的第一条消息 id 相同
                    if (runtimeData.messageList.length > 0 && list.length > 0) {
                        if (runtimeData.messageList[0].message_id == list[list.length - 1].message_id) {
                            list.pop() // 去掉重复的消息
                        }
                    }
                    runtimeData.messageList = list.concat(runtimeData.messageList)
                } else if (append == 'bottom') {
                    runtimeData.messageList = runtimeData.messageList.concat(list)
                }
            } else {
                runtimeData.messageList = []
                runtimeData.messageList = list
            }
        }
        // 将消息列表的最后一条 raw_message 保存到用户列表中
        const lastMsg = runtimeData.messageList[runtimeData.messageList.length - 1]
        if (lastMsg) {
            const user = runtimeData.userList.find((item) => {
                return item.group_id == runtimeData.chatInfo.show.id ||
                    item.user_id == runtimeData.chatInfo.show.id
            })
            if (user) {
                if (runtimeData.chatInfo.show.type == 'group') {
                    user.raw_msg = lastMsg.sender.nickname + ': ' + getMsgRawTxt(lastMsg.message)
                } else {
                    user.raw_msg = getMsgRawTxt(lastMsg.message)
                }
                user.time = getViewTime(Number(lastMsg.time))
            }
        }

    }
}

function saveForwardMsg(msg: any) {
    if (msg.error !== null && (msg.error !== undefined || msg.status === 'failed')) {
        popInfo.add(PopType.ERR, app.config.globalProperties.$t('pop_get_forward_fail'))
    } else {
        let list = getMsgData('forward_message_list', msg, msgPath.forward_msg)
        list = getMessageList(list)
        if (list != undefined) {
            runtimeData.mergeMessageList = list
        }
    }
}

function getMessageList(list: any[] | undefined) {
    if (list != undefined) {
        list = parseMsgList(list, msgPath.message_list.type, msgPath.message_value)
        // 倒序处理
        if (msgPath.message_list.order === 'reverse') {
            list.reverse()
        }
        // 检查必要字段
        list.forEach((item: any) => {
            if (!item.post_type) {
                item.post_type = 'message'
            }
        })
        return list
    }
    return undefined
}

function showSendedMsg(msg: any, echoList: string[]) {
    if (msg.error !== null && msg.error !== undefined) {
        popInfo.add(PopType.ERR, app.config.globalProperties.$t('pop_chat_send_msg_err', { code: msg.error }))
    } else {
        if (msg.message_id == undefined) {
            msg.message_id = msg.data.message_id
        }
        if (msg.message_id !== undefined && Option.get('send_reget') !== true) {
            // 请求消息内容
            Connector.send(
                runtimeData.jsonMap.get_message.name ?? 'get_msg',
                { 'message_id': msg.message_id },
                'getSendMsg_' + msg.message_id + '_0'
            )
        }
        if (echoList[1] == 'forward') {
            // PS：这儿写是写了转发成功，事实上不确定消息有没有真的发送出去（x
            popInfo.add(PopType.INFO, app.config.globalProperties.$t('chat_chat_forward_success'))
        } else if (echoList[1] == 'uuid') {
            const messageId = echoList[2]
            // 去 messagelist 里找到这条消息
            runtimeData.messageList.forEach((item) => {
                if (item.message_id == messageId) {
                    item.message_id = msg.message_id
                    item.fake_msg = false
                    return
                }
            })
        }
    }
}

function saveSendedMsg(echoList: string[], data: any) {
    if (data.status == 'ok') {
        const msgData = getMsgData('get_message', data, msgPath.get_message)
        let msgInfoData = undefined
        if (msgData) {
            msgInfoData = getMsgData('message_info', msgData[0], msgPath.message_info)
        }
        if (Number(echoList[2]) <= 5 && msgData && msgInfoData) {
            const msg = msgData[0]
            const msgInfo = msgInfoData[0]
            if (echoList[1] !== msgInfo.message_id.toString()) {
                // 返回的不是这条消息，重新请求
                // popInfo.add(PopType.ERR,
                //     app.config.globalProperties.$t('pop_chat_get_msg_err') + ' ( A' + echoList[2] + ' )')
                setTimeout(() => {
                    Connector.send(
                        runtimeData.jsonMap.get_message.name ?? 'get_msg',
                        { 'message_id': echoList[1] },
                        'getSendMsg_' + echoList[1] + '_' + (Number(echoList[2]) + 1)
                    )
                }, 5000)
            } else {
                // 去消息列表里找这条消息，如果有的话删掉它
                runtimeData.messageList.forEach((item, index) => {
                    if (item.message_id == msgInfo.message_id) {
                        runtimeData.messageList.splice(index, 1)
                    }
                })
                // 防止重试过程中切换聊天
                if (msgInfo.group_id == runtimeData.chatInfo.show.id ||
                    msgInfo.private_id == runtimeData.chatInfo.show.id) {
                    saveMsg(buildMsgList([msg]), 'bottom')
                }
            }
        } else {
            popInfo.add(PopType.ERR, app.config.globalProperties.$t('pop_chat_get_msg_err_fin'))
        }
    } else {
        if (Number(echoList[2]) < 5) {
            // 看起来没获取到，再试试
            // popInfo.add(PopType.ERR,
            //     app.config.globalProperties.$t('pop_chat_get_msg_err') + ' ( B' + echoList[2] + ' )')
            setTimeout(() => {
                Connector.send(
                    runtimeData.jsonMap.get_message.name ?? 'get_msg',
                    { 'message_id': echoList[1] },
                    'getSendMsg_' + echoList[1] + '_' + (Number(echoList[2]) + 1)
                )
            }, 5000)
        } else {
            popInfo.add(PopType.ERR, app.config.globalProperties.$t('pop_chat_get_msg_err_fin'))
        }
    }
}

function loadFileBase(echoList: string[], msg: any) {
    let url = msg.data.url
    const msgId = echoList[1]
    const ext = echoList[2]
    if (url) {
        // 寻找消息位置
        let msgIndex = -1
        runtimeData.messageList.forEach((item, index) => {
            if (item.message_id === msgId) {
                msgIndex = index
            }
        })
        if (msgIndex !== -1) {
            if (document.location.protocol == 'https:') {
                // 判断文件 URL 的协议
                // PS：Chrome 不会对 http 文件进行协议升级
                if (url.toLowerCase().startsWith('http:')) {
                    url = 'https' + url.substring(url.indexOf('://'))
                }
            }
            runtimeData.messageList[msgIndex].fileView.url = url
            runtimeData.messageList[msgIndex].fileView.ext = ext
        }
    }
}

function saveMemberInfo(msg: any) {
    if (msg.data != undefined) {
        const data = msg.data
        const pointInfo = msg.echo.split('_')
        data.x = pointInfo[1]
        data.y = pointInfo[2]
        runtimeData.chatInfo.info.now_member_info = data
    }
}

function revokeMsg(msg: any) {
    const chatId = msg.notice_type.indexOf('group') >= 0 ? msg.group_id : msg.user_id
    const msgId = msg.message_id
    // 寻找消息
    let msgGet = null as { [key: string]: any } | null
    let msgIndex = -1
    runtimeData.messageList.forEach((item, index) => {
        if (item.message_id === msgId) {
            msgGet = item
            msgIndex = index
        }
    })
    if (msgGet !== null && msgIndex !== -1) {
        runtimeData.messageList[msgIndex].revoke = true
        if (runtimeData.messageList[msgIndex].sender.user_id != runtimeData.loginInfo.uin) {
            runtimeData.messageList.splice(msgIndex, 1)
        }
        if (msgGet.sender.user_id !== runtimeData.loginInfo.uin) {
            // 显示撤回提示
            const list = runtimeData.messageList
            if (msgIndex !== -1) {
                list.splice((msgIndex + 1), 0, msg)
            } else {
                list.push(msg)
            }
        }
    } else {
        new Logger().error(app.config.globalProperties.$t('log_revoke_miss'))
    }
    // 尝试撤回通知
    const notificationIndex = notificationList.findIndex((item) => {
        const tag = item.tag
        const userId = Number(tag.split('/')[0])
        return userId == chatId
    })
    if (notificationIndex != -1) {
        const notification = notificationList[notificationIndex]
        // PS：使用 close 方法关闭通知也会触发关闭事件，所以这儿需要先移除再关闭
        // 防止一些判断用户主动关闭通知的逻辑出现问题
        notificationList.splice(notificationIndex, 1)
        notification.close()
    }
}

function downloadFileChat(msg: any) {
    const info = msg.echo.split('_')
    const msgId = info[1]
    const url = msg.data.url
    // 在消息列表内寻找这条消息（从后往前找）
    let index = -1
    let indexMsg = -1
    for (let i = runtimeData.messageList.length - 1; i > 0; i--) {
        if (runtimeData.messageList[i].message_id == msgId) {
            index = i
            for (let j = 0; j < runtimeData.messageList[i].message.length; j++) {
                if (runtimeData.messageList[i].message[j].type == 'file') {
                    indexMsg = j
                    break
                }
            }
            break
        }
    }
    // 下载文件
    if (index != -1 && indexMsg != -1) {
        const onProcess = function (event: ProgressEvent): undefined {
            if (!event.lengthComputable) return
            runtimeData.messageList[index].message[indexMsg].
                downloadingPercentage = Math.floor(event.loaded / event.total * 100)
        }
        downloadFile(url, msg.echo.substring(msg.echo.lastIndexOf('_') + 1, msg.echo.length), onProcess)
    }
}

function downloadGroupFile(msg: any) {
    // 基本信息
    const info = msg.echo.split('_')
    const id = info[1]
    // 文件信息
    let fileName = 'new-file'
    let fileIndex = -1
    let subFileIndex = -1
    runtimeData.chatInfo.info.group_files.file_list.forEach((item: any, index: number) => {
        if (item.id === id) {
            fileName = escape2Html(item.name)
            fileIndex = index
        }
    })
    // 特殊情况：这是个子文件
    if (info[2] !== undefined) {
        runtimeData.chatInfo.info.group_files.file_list[fileIndex].sub_list.forEach((item: any, index: number) => {
            if (item.id === info[2]) {
                fileName = escape2Html(item.name)
                subFileIndex = index
            }
        })
    }
    // 下载事件
    const onProcess = function (event: ProgressEvent): undefined {
        if (!event.lengthComputable) return
        const downloadingPercentage = Math.floor(event.loaded / event.total * 100)
        if (fileIndex !== -1) {
            if (subFileIndex === -1) {
                if (runtimeData.chatInfo.info.group_files.file_list[fileIndex].downloadingPercentage === undefined) {
                    runtimeData.chatInfo.info.group_files.file_list[fileIndex].downloadingPercentage = 0
                }
                runtimeData.chatInfo.info.group_files.file_list[fileIndex].downloadingPercentage = downloadingPercentage
            } else {
                if (runtimeData.chatInfo.info.group_files.file_list[fileIndex].sub_list[subFileIndex].downloadingPercentage === undefined) {
                    runtimeData.chatInfo.info.group_files.file_list[fileIndex].sub_list[subFileIndex].downloadingPercentage = 0
                }
                runtimeData.chatInfo.info.group_files.file_list[fileIndex].sub_list[subFileIndex].downloadingPercentage = downloadingPercentage
            }
        }
    }

    // 下载文件
    downloadFile(msg.data.url, fileName, onProcess)
}

function getVideoUrl(msg: any) {
    const info = msg.echo.split('_')
    const msgId = info[1]
    const url = msg.data.url
    // 在消息列表内寻找这条消息
    for (let i = 0; i < runtimeData.messageList.length; i++) {
        if (runtimeData.messageList[i].message_id == msgId) {
            for (let j = 0; j < runtimeData.messageList[i].message.length; j++) {
                if (runtimeData.messageList[i].message[j].type == 'video') {
                    runtimeData.messageList[i].message[j].url = url
                    return
                }
            }
            return
        }
    }
}

function saveDirFile(msg: any) {
    // TODO: 这边不分页直接拿全，还没写
    const id = msg.echo.split('_')[1]
    let fileIndex = -1
    runtimeData.chatInfo.info.group_files.file_list.forEach((item: any, index: number) => {
        if (item.id === id) {
            fileIndex = index
        }
    })
    runtimeData.chatInfo.info.group_files.file_list[fileIndex].sub_list = msg.data.data.file_list
}

function saveFileList(data: any) {
    const div = document.createElement('div')
    div.innerHTML = data.em
    if (data.ec !== 0) {
        popInfo.add(
            PopType.ERR,
            app.config.globalProperties.$t('pop_chat_chat_info_load_file_err', { code: xss(div.innerHTML) })
        )
    } else {
        runtimeData.chatInfo.info.group_files = data
    }
}

function saveMoreFileList(data: any) {
    if (runtimeData.chatInfo.info !== undefined && runtimeData.chatInfo.info.group_files !== undefined) {
        // 追加文件列表
        runtimeData.chatInfo.info.group_files.file_list = runtimeData.chatInfo.info.group_files.file_list.concat(data.file_list)
        // 设置最大值位置
        runtimeData.chatInfo.info.group_files.next_index = data.next_index
    }
}

let qed_try_times = 0
function newMsg(data: any) {
    // 没有对频道的支持计划
    if (data.detail_type == 'guild') { return }
    // 获取一些基础信息
    const infoList = getMsgData('message_info', data, msgPath.message_info)
    if (infoList != undefined) {
        const info = infoList[0]
        const id = info.group_id ?? info.private_id
        const loginId = runtimeData.loginInfo.uin
        const showId = runtimeData.chatInfo.show.id
        const sender = info.sender
        // 在好友列表里找一下他
        const senderInfo = runtimeData.userList.find((item) => {
            return item.user_id == sender
        })
        const isImportant = senderInfo?.class_id == 9999
        runtimeData.watch.newMsg = data

        // 消息回调检查
        // PS：如果在新消息中获取到了自己的消息，则自动打开“停止消息回调”设置防止发送的消息重复
        if (Option.get('send_reget') !== true && sender === loginId) {
            Option.save('send_reget', true)
        }

        // 列表内最近的一条 fake_msg（倒序查找）
        let fakeIndex = -1
        for (let i = runtimeData.messageList.length - 1; i > 0; i--) {
            const msg = runtimeData.messageList[i]
            if (msg.fake_msg != undefined && sender == loginId) {
                fakeIndex = i
                break
            }
        }
        // 预发送消息刷新
        if (fakeIndex != -1) {
            // 将这条消息直接替换掉
            let trueMsg = getMsgData('message_list', buildMsgList([data]), msgPath.message_list)
            trueMsg = getMessageList(trueMsg)
            if (trueMsg && trueMsg.length == 1) {
                runtimeData.messageList[fakeIndex].message = trueMsg[0].message
                runtimeData.messageList[fakeIndex].raw_message = trueMsg[0].raw_message
                runtimeData.messageList[fakeIndex].time = trueMsg[0].time

                runtimeData.messageList[fakeIndex].fake_msg = undefined
                runtimeData.messageList[fakeIndex].revoke = false
            }
            return
        }

        // 显示消息
        if (id === showId || info.target_id == showId) {
            // 保存消息
            saveMsg(buildMsgList([data]), 'bottom')
            // 抽个签
            const num = randomNum(0, 10000)
            if (num >= 4500 && num <= 5500) {
                new Logger().add(LogType.INFO, num.toString() + '，这只是个神秘的数字...')
            }
            if (num === 5000) {
                const popInfo = {
                    html: qed,
                    button: [
                        {
                            text: '确定(O)',
                            fun: () => { runtimeData.popBoxList.shift() }
                        }
                    ]
                }
                runtimeData.popBoxList.push(popInfo)
                Umami.trackEvent('show_qed', { times: qed_try_times })
            }
            qed_try_times++
        }
        
        // 对消息进行一次格式化处理
        let list = getMsgData('message_list', buildMsgList([data]), msgPath.message_list)
        if (list != undefined) {
            list = parseMsgList(list, msgPath.message_list.type, msgPath.message_value)
            data = list[0]
        }
        // 刷新好友列表
        const get = runtimeData.onMsgList.filter((item, index) => {
            if (Number(id) === item.user_id || Number(id) === item.group_id || Number(info.target_id) === item.user_id) {
                runtimeData.onMsgList[index].message_id = data.message_id
                if (data.message_type === 'group') {
                    const name = (data.sender.card && data.sender.card !== '') ? data.sender.card : data.sender.nickname
                    runtimeData.onMsgList[index].raw_msg = name + ': ' + getMsgRawTxt(data.message)
                } else {
                    runtimeData.onMsgList[index].raw_msg = getMsgRawTxt(data.message)
                }
                runtimeData.onMsgList[index].time = getViewTime(Number(data.time))
                return true
            }
            return false
        })
        // 对于其他不在消息里标记 atme、atall 的处理
        if (data.atme == undefined || data.atall == undefined) {
            data.message.forEach((item: any) => {
                if (item.type == 'at' && item.qq == loginId) {
                    data.atme = true
                }
            })
        }
        // 临时会话名字的特殊处理
        if (data.sub_type === 'group') {
            data.sender.nickname = data.sender.user_id
        }
        // (发送者不是自己 && (在特别关心列表里 || 发送者不是群组 || 群组 AT || 群组 AT 全体 || 打开了通知全部消息)) 这些情况需要进行新消息处理
        if (sender != loginId && sender != 0 && (isImportant || data.message_type !== 'group' || data.atme || data.atall || Option.get('notice_all') === true)) {
            // (发送者没有被打开 || 窗口没有焦点 || 窗口被最小化 || 在特别关心列表里) 这些情况需要进行消息通知
            if (id !== showId || !document.hasFocus() || document.hidden || isImportant) {
                // 准备消息内容
                let raw = getMsgRawTxt(data.message)
                raw = raw === '' ? data.raw_message : raw
                if (data.group_name === undefined) {
                    // 检查消息内是否有群名，去列表里寻找
                    runtimeData.userList.filter((item) => {
                        if (item.group_id == data.group_id) {
                            data.group_name = item.group_name
                        }
                    })
                }
                const msgInfo = {
                    title: data.group_name ?? data.sender.nickname,
                    body: data.message_type === 'group' ? data.sender.nickname + ':' + raw : raw,
                    tag: `${id}/${data.message_id}`,
                    icon: data.message_type === 'group' ? 
                        `https://p.qlogo.cn/gh/${id}/${id}/0`:
                        `https://q1.qlogo.cn/g?b=qq&s=0&nk=${id}`,
                    image: undefined as any,
                    type: data.group_id ? 'group' : 'user',
                    is_important: isImportant
                }
                data.message.forEach((item: MsgItemElem) => {
                    // 如果消息有图片，追加第一张图片
                    if (item.type === 'image' && msgInfo.image === undefined) {
                        msgInfo.image = item.url
                    }
                })
                // 检查这个用户是否有通知，有的话删除旧的
                // PS：这儿的是 web 通知，electron 通知在 electron 里处理
                const index = notificationList.findIndex((item) => {
                    const tag = item.tag
                    const userId = Number(tag.split('/')[0])
                    return userId === id
                })
                if (index !== -1) {
                    notificationList.splice(index, 1)
                    notificationList[index].close()
                }
                // 发送消息
                if (Option.get('close_notice') !== true) {
                    if (runtimeData.tags.isElectron) {
                        if (runtimeData.reader) {
                            // electron：在 windows 下对任务栏图标进行闪烁
                            runtimeData.reader.send('win:flashWindow')
                            // electron：通过 electron 发送消息
                            runtimeData.reader.send('sys:sendNotice', msgInfo)
                        }
                    } else {
                        // 检查通知权限，老旧浏览器不支持这个功能
                        if (Notification.permission === 'default') {
                            Notification.requestPermission(() => {
                                sendNotice(msgInfo)
                            })
                        } else if (Notification.permission !== 'denied') {
                            sendNotice(msgInfo)
                        }
                    }
                }
                // MacOS：刷新 touchbar
                if (runtimeData.tags.isElectron && runtimeData.reader) {
                    runtimeData.reader.send('sys:newMessage', {
                        id: id,
                        image: msgInfo.icon,
                        name: msgInfo.title,
                        msg: raw
                    })
                }
            }
            // 如果发送者不在消息列表里，将它添加到消息列表里
            if (get.length !== 1) {
                // 如果消息子类是 group，那么是临时消息，需要进行特殊处理
                if (data.sub_type === 'group') {
                    // 手动创建一个用户信息，因为临时消息的用户不在用户列表里
                    const user = {
                        user_id: sender,
                        // 因为临时消息没有返回昵称
                        nickname: app.config.globalProperties.$t('chat_temp'),
                        remark: data.sender.user_id,
                        new_msg: true,
                        message_id: data.message_id,
                        raw_msg: data.raw_message,
                        time: data.time,
                        group_id: data.sender.group_id,
                        group_name: ''
                    } as UserFriendElem & UserGroupElem
                    runtimeData.onMsgList.push(user)
                } else {
                    const getList = runtimeData.userList.filter((item) => { return item.user_id === id || item.group_id === id })
                    if (getList.length === 1) {
                        runtimeData.onMsgList.push(getList[0])
                    }
                }
            }

            runtimeData.onMsgList.forEach((item) => {
                // 刷新新消息标签
                if (id !== showId && (id == item.group_id || id == item.user_id)) {
                    item.new_msg = true
                }
            })
            // 重新排序列表
            const newList = [] as (UserFriendElem & UserGroupElem)[]
            let topNum = 1
            runtimeData.onMsgList.forEach((item) => {
                // 排序操作
                if (item.always_top === true) {
                    newList.unshift(item)
                    topNum++
                } else if (item.new_msg === true) {
                    newList.splice(topNum - 1, 0, item)
                } else {
                    newList.push(item)
                }
            })
            runtimeData.onMsgList = newList
        }
    }
}

function sendNotice(info: any) {
    // 构建通知
    let notificationTile = ''
    const notificationBody = {} as NotificationElem
    notificationBody.requireInteraction = true
    notificationTile = info.title
    notificationBody.body = info.body
    notificationBody.tag = info.tag
    notificationBody.icon = info.icon
    // 发起通知
    const notification = new Notification(notificationTile, notificationBody)
    notification.onclick = (event: Event) => {
        const info = event.target as NotificationOptions
        if (info.tag !== undefined) {
            const userId = info.tag.split('/')[0]
            const msgId = info.tag.substring(userId.length + 1, info.tag.length)
            // 在通知列表中删除这条消息
            const index = notificationList.findIndex((item) => { return item.tag === info.tag })
            if (index !== -1) {
                notificationList.splice(index, 1)
            }
            // 跳转到这条消息的发送者页面
            window.focus()
            jumpToChat(userId, msgId)
        }
    }
    notification.onclose = (event: Event) => {
        const info = event.target as NotificationOptions
        if (info.tag !== undefined) {
            // 在通知列表中删除这条消息
            const index = notificationList.findIndex((item) => { return item.tag === info.tag })
            if (index !== -1) {
                notificationList.splice(index, 1)
            }
        }
    }
    notificationList.push(notification)
}

/**
 * 保存精华消息
 * @param data 返回数据
 */
function saveJin(data: any) {
    const jinList = getMsgData('group_essence', data, msgPath.group_essence)
    const is_end = getMsgData('is_end', data, msgPath.group_essence.is_end)
    if (jinList && is_end) {
        if (runtimeData.chatInfo.info.jin_info.list.length == 0) {
            runtimeData.chatInfo.info.jin_info.list = jinList
        } else {
            const now_page = runtimeData.chatInfo.info.jin_info.pages ?? 0

            runtimeData.chatInfo.info.jin_info.list = 
                runtimeData.chatInfo.info.jin_info.list.concat(jinList)
            runtimeData.chatInfo.info.jin_info.pages = now_page + 1
        }
        runtimeData.chatInfo.info.jin_info.is_end = is_end[0]
    }
}

/**
 * 将这条消息以上的所有消息标记为已读
 * @param data 消息
 */
function readMemberMessage(data: any) {
    const name = runtimeData.jsonMap.set_message_read.private_name
    let private_name = runtimeData.jsonMap.set_message_read.private_name
    if(!private_name) private_name = name
    if(data.group_id != undefined) {
        Connector.send(name, {
            message_id: data.message_id,
            group_id: data.group_id,
        }, 'setMessageRead')
    } else {
        Connector.send(private_name, {
            message_id: data.message_id,
            user_id: data.self_id,
        }, 'setMessageRead')
    }
}

/**
 * 刷新系统通知和其他内容，给系统通知响应用的
 */
function updateSysInfo(type: string) {
    Connector.send('get_system_msg', {}, 'getSystemMsg')
    switch (type) {
        case 'setFriendAdd':
            reloadUsers(); break
    }
}

/**
 * 添加获取到的系统通知消息
 * @param msg 系统通知
 */
function addSystemNotice(msg: any) {
    if (runtimeData.systemNoticesList) {
        runtimeData.systemNoticesList.push(msg)
    } else {
        runtimeData.systemNoticesList = [msg]
    }
}

/**
 * 添加/删除好友的通知
 * @param msg 消息
 */
function friendNotice(msg: any) {
    // 重新加载联系人列表
    reloadUsers();
    switch (msg.sub_type) {
        case 'increase': {
            // 添加系统通知
            new PopInfo().add(PopType.INFO, app.config.globalProperties.$t('pop_friend_added', { name: msg.nickname }))
            break
        }
        case 'decrease': {
            // 输出日志（显示为红色字体）
            // eslint-disable-next-line no-console
            console.log('%c消失了一个好友：' + msg.nickname + '（' + msg.user_id + '）', 'color:red;')
            break
        }
    }
}

function saveCookie(data: any, echoList: string[]) {
    // 拆分 cookie
    const cookieObject = {} as { [key: string]: string }
    data.data.cookies.split('; ').forEach((item: string) => {
        const key = item.split('=')[0]
        const value = item.split('=')[1]
        cookieObject[key] = value
    })
    // 计算 bkn
    const skey = cookieObject['skey'] || ''
    let hash = 5381
    
    for (let i = 0; i < skey.length; i++) {
        hash += (hash << 5) + skey.charCodeAt(i)
    }
    // 保存 cookie 和 bkn
    const domain = echoList[1]
    if(!runtimeData.loginInfo.webapi) runtimeData.loginInfo.webapi = {}
    if(!runtimeData.loginInfo.webapi[domain]) runtimeData.loginInfo.webapi[domain] = {}
    runtimeData.loginInfo.webapi[domain].cookie = cookieObject
    runtimeData.loginInfo.webapi[domain].bkn = (hash & 0x7FFFFFFF).toString()
}

function saveSticker(data: any) {
    if(msgPath.roaming_stamp.reverse) {
        data.reverse()
    }
    if(runtimeData.stickerCache == undefined) {
        runtimeData.stickerCache = data
    } else {
        runtimeData.stickerCache = runtimeData.stickerCache.concat(data)
    }
}

// ==============================================================

const baseRuntime = {
    tags: {
        firstLoad: false,
        canLoadHistory: true,
        openSideBar: false,
        viewer: { index: 0 },
        msgType: BotMsgType.Array,
        isElectron: false,
        platform: undefined,
        release: undefined,
        connectSsl: false,
        classes: [],
        darkMode: false
    },
    watch: {
        newMsg: {}
    },
    chatInfo: {
        show: { type: '', id: 0, name: '', avatar: '' },
        info: {
            group_info: {},
            user_info: {},
            me_info: {},
            group_members: [],
            group_files: {},
            group_sub_files: {},
            jin_info: {
                list: [] as { [key: string]: any }[],
                pages: 0
            }
        }
    },
    pageView: {
        chatView: markRaw(defineAsyncComponent(() => import('@/pages/Chat.vue'))),
        msgView: markRaw(defineAsyncComponent(() => import('@/components/MsgBody.vue')))
    },
    userList: [],
    showList: [],
    systemNoticesList: undefined,
    onMsgList: [],
    loginInfo: {},
    botInfo: {},
    sysConfig: {},
    messageList: [],
    popBoxList: []
}

export const runtimeData: RunTimeDataElem = reactive(baseRuntime)
export const appendMsg: { [key: string]: (msg: any) => void } = reactive({})
export const notificationList: Notification[] = reactive([])

// 重置 Runtime，但是保留应用设置之类已经加载好的应用内容
export function resetRimtime() {
    runtimeData.tags = reactive(baseRuntime.tags)
    runtimeData.chatInfo = reactive(baseRuntime.chatInfo)
    runtimeData.userList = reactive([])
    runtimeData.showList = reactive([])
    runtimeData.systemNoticesList = reactive([])
    runtimeData.onMsgList = reactive([])
    runtimeData.loginInfo = reactive([])
    runtimeData.botInfo = reactive([])
    runtimeData.messageList = reactive([])
}