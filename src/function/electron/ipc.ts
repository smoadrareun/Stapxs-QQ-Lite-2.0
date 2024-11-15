import Store from 'electron-store'
import path from 'path'
import os from 'os'

import { ipcMain, shell, systemPreferences, app, Menu, MenuItemConstructorOptions, Notification as ELNotification } from 'electron'
import { GtkTheme, GtkData } from '@jakejarrett/gtk-theme'
import { runCommand } from './util'
import { win, touchBarInstance } from '@/background'
import { Connector } from '@/function/electron/connector'

let connector = undefined as Connector | undefined
const store = new Store()
let template = [] as any[]

// 消息缓存，key 为 tag
const noticeList = {} as {[key: string]: ELNotification}

export function regIpcListener() {
    // 后端连接模式
    ipcMain.on('onebot:connect', (event, args) => {
        if(!connector && win) {
            connector = new Connector(win)
        }
        connector?.connect(args.address, args.token)
    })
    // 获取系统平台
    ipcMain.handle('sys:getPlatform', () => {
        return process.platform
    })
    ipcMain.handle('sys:getRelease', () => {
        return os.release()
    })
    // 代理请求 HTTP
    // ipcMain.on('sys:requestHttp', (event, args) => {
        // console.log(args)

        // const cookies = JSON.parse(args.cookies)
        // console.log(cookies)
        // const cookieStrs = Object.keys(cookies).map((key) => {
        //     return key + '=' + cookies[key]
        // })
        // console.log(cookieStrs.join('; '))
        // // 异步请求，不需要立即返回
        // axios({
        //     method: args.type,
        //     url: args.url,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Cookie': cookieStrs.join('; '),
        //     },
        //     data: args.data
        // }).then((res) => {
        //     // res.data
        //     console.log(res.data)
        // }).catch((err) => {
        //     // err
        //     console.error(err)
        // })
    // })
    // 关闭窗口
    ipcMain.on('win:close', () => {
        if(win) win.close()
    })
    // 最小化
    ipcMain.on('win:minimize', () => {
        if(win) win.minimize()
    })
    // 最大化
    ipcMain.on('win:maximize', () => {
        if(win) win.maximize()
    })
    // 重启应用
    ipcMain.on('win:relaunch', () => {
        app.relaunch()
        app.exit()
    })
    // 置顶窗口
    ipcMain.on('win:alwaysTop', (event, args) => {
        if(win) win.setAlwaysOnTop(args)
    })
    // 获取窗口信息
    ipcMain.handle('win:getWindowInfo', () => {
        if(win) {
            const [x, y] = win.getPosition()
            const [width, height] = win.getSize()
            return {
                x: x, y: y,
                width: width, height: height
            }
        }
    })
    // 移动窗口位置
    ipcMain.on('win:move', (event, point) => {
        if(win) {
            win.setPosition(point.x, point.y)
        }
    })
    // 保存信息
    ipcMain.on('sys:store', (event, arg) => {
        store.set(arg.key, arg.value)
    })
    ipcMain.handle('sys:getStore', (event, key) => {
        return store.get(key)
    })
    // 保存设置
    // PS：升级至 electron 27 后 cookie 已完全无法持久化，只能进行保存
    ipcMain.on('opt:saveAll', (event, arg) => {
        store.store = arg
    })
    // 获取设置
    ipcMain.on('opt:getAll', (event) => {
        event.returnValue = store.store
    })
    ipcMain.on('opt:get', (event, arg) => {
        event.returnValue = store.get(arg)
    })
    // 重置设置
    ipcMain.on('opt:clearAll', (event) => {
        store.clear() 
        event.returnValue = true
    })
    // 获取补充的调试信息
    ipcMain.handle('opt:getSystemInfo', () => {
        const systemInfo = {} as { [key: string]: [string, string] }
        systemInfo.electron = ['Electron Version', process.versions.electron]
        return systemInfo
    })
    // 打开开发者工具
    ipcMain.on('win:openDevTools', () => {
        if(win) win.webContents.openDevTools()
    })
    // 下载文件
    ipcMain.on('sys:download', (evt, args) => {
        const downloadPath = args.downloadPath
        const fileName = args.fileName
        const ext = path.extname(fileName)
        const filters = [{ name: '全部文件', extensions: ['*'] }]
        if (ext && ext !== '.' && ext != null) {
            const array = ext.match(/[a-zA-Z]+$/)
            if (array) {
                filters.unshift({ name: '', extensions: [array[0]] })
            }
        }
        if (win) {
            win.webContents.session.on('will-download', (event, item) => {
                item.on('updated', (event, state) => {
                    if (state === 'progressing') {
                        if (!item.isPaused()) {
                            if (win) {
                                win.webContents.send('sys:downloadBack', {
                                    lengthComputable: true,
                                    loaded: item.getReceivedBytes(),
                                    total: item.getTotalBytes()
                                })
                                win.setProgressBar(item.getReceivedBytes() / item.getTotalBytes())
                            }
                        }
                    }
                })
                item.on('done', (event) => {
                    win?.setProgressBar(-1)
                    const sender = (event as any).sender
                    if(sender)
                        shell.showItemInFolder(sender.getSavePath())
                })
            })
            win.webContents.downloadURL(downloadPath)
        }
    })
    // 发送通知
    ipcMain.on('sys:sendNotice', async (event, data) => {
        const userId = data.tag.split('/')[0]
        const msgId = data.tag.split('/')[1]

        let showData = {
            title: data.title,
            body: data.body,
            icon: data.icon
        } as Electron.NotificationConstructorOptions
        if(process.platform === 'darwin') {
            showData = {
                ...showData,
                replyPlaceholder: '快速回复……',
                hasReply: true
            }
            if(data.is_important) {
                showData = {
                    ...showData,
                    sound: 'resources/tri-tone.aif'
                }
            }
        }
        if(process.platform === 'win32') {
            showData = {
                toastXml: `
                <toast launch="stapx-qq-lite:action=click" activationType="protocol">
                    <visual>
                        <binding template="ToastGeneric">
                            <image placement="appLogoOverride" hint-crop="circle" src="${(data.icon as string).replaceAll('&', '&amp;')}"/>
                            <text>${data.title}</text>
                            <text>${data.body}</text>
                        </binding>
                    </visual>
                    <actions>
                        <input id="quick" type="text" placeHolderContent="reply"/>
                        <action
                            content="▶"
                            hint-inputId="quick"
                            arguments="stapx-qq-lite:action=reply&amp;data=%quick%"
                            activationType="protocol"/>
                    </actions>
                </toast>`
            }
        }
        if(process.platform === 'linux') {
            if(data.is_important) {
                showData = {
                    ...showData,
                    urgency: 'critical'
                }
            }
        }
        const notification = new ELNotification(showData)
        notification.show()
        // 通知事件
        notification.on('click', () => {
            win?.focus()
            win?.webContents.send('app:jumpChat', {
                userId: userId,
                msgId: msgId
            })
        })
        notification.on('reply', (event, reply) => {
            win?.webContents.send('bot:quickReply', {
                type: data.type,
                id: userId,
                msg: msgId,
                content: reply
            })
        })
        // 保存通知对象
        noticeList[data.tag] = notification
    })
    // 关闭通知
    ipcMain.on('sys:closeNotice', (event, tag) => {
        if(noticeList[tag]) {
            noticeList[tag].close()
        }
    })
    // 清空通知
    ipcMain.on('sys:clearNotice', () => {
        Object.keys(noticeList).forEach((key) => {
            noticeList[key].close()
        })
    })
    // 关闭指定 ID 的所有通知
    ipcMain.on('sys:closeAllNotice', (event, id) => {
        Object.keys(noticeList).forEach((key) => {
            if(key.startsWith(id)) {
                noticeList[key].close()
            }
        })
    })
    // 运行命令
    ipcMain.handle('sys:runCommand', async (event, cmd) => {
        try {
            const info = await runCommand(cmd)
            const str = info.stdout as string
            return { success: true, message: str }
        } catch(ex) {
            return { success: false, message: (ex as Error).message }
        }
    })

    // Windows：闪烁状态栏图标
    ipcMain.on('win:flashWindow', () => {
        if(win) win.flashFrame(true)
    })
    // Winodws：通过注册表获取系统主题色
    ipcMain.handle('sys:getWinColor', () => {
        // 订阅颜色修改事件
        systemPreferences.addListener('accent-color-changed', () => {
            if(win) {
                win.webContents.send('sys:WinColorChanged', systemPreferences.getAccentColor())
            }
        })
        return systemPreferences.getAccentColor()
    })

    // Linux：获取 GTK 主题 CSS
    ipcMain.handle('sys:getGTKTheme', () => {
        const gtkTheme = new GtkTheme({events: {
            themeChange: (data: GtkData) => {
                const info = {} as {[key:string]:any}
                info.name = data.name
                info.css = data.gtk.css
                if(win) {
                    win.webContents.send('sys:updateGTKTheme', info)
                }
            }
        }})
        return gtkTheme.getTheme().gtk.css
    })
    // Linux：获取 gnome extension 设置
    // dconf dump /org/gnome/shell/extensions/ | awk -v RS='' '/\[blur-my-shell\/applications\]/'
    ipcMain.handle('sys:getGnomeExt', async () => {
        try {
            const info = await runCommand('dconf dump /org/gnome/shell/extensions/ | awk -v RS=\'\' \'/\\[blur-my-shell\\/applications\\]/\'')
            const str = info.stdout as string
            const data = {} as {[key: string]: string}
            if(str && str.startsWith('[blur-my-shell/applications]')) {
                const lines = str.split('\n').slice(1)
                lines.forEach((line) => {
                    const [key, value] = line.split('=')
                    if(key != '')
                        data[key] = value
                })
            }
            return data
        } catch(ex) {
            return (ex as Error).message
        }
    })

    // MacOS：初始化菜单
    // PS：由于本地化的存在，需要让 vue 获取到本地化信息之后再由 electron 构建
    ipcMain.on('sys:createMenu', (event, args) => {
        if (process.platform === 'darwin') {
            template = [
                {
                    label: args.title,
                    submenu: [
                        { label: args.about, click: () => { sendMenuClick('app:about') } },
                        { label: args.update },
                        { type: 'separator' },
                        { label: args.hide, role: 'hide' },
                        { label: args.hideOthers, role: 'hideothers' },
                        { label: args.unhide, role: 'unhide' },
                        { type: 'separator' },
                        { label: args.quit, role: 'quit' }
                    ],
                }, {
                    label: args.edit,
                    role: 'editMenu',
                    submenu: [
                        { label: args.undo, role: 'undo' },
                        { label: args.redo, role: 'redo' },
                        { type: 'separator' },
                        { label: args.cut, role: 'cut' },
                        { label: args.copy, role: 'copy' },
                        { label: args.paste, role: 'paste' },
                        { type: 'separator' },
                        { label: args.selectAll, role: 'selectall' }
                    ],
                }, {
                    label: args.account,
                    submenu: [
                        { id: 'userName', label: args.login },
                        { id: 'logout', label: args.logout, visible: false, click: () => { sendMenuClick('bot:logout') } },
                        { type: 'separator' },
                        { id: 'userList', label: args.userList, click: () => { sendMenuClick('app:changeTab', 'Friends') } },
                        { label: args.flushUser, click: () => { sendMenuClick('bot:flushUser') } }
                    ],
                }, {
                    label: args.help,
                    role: 'help',
                    submenu: [
                        { label: args.doc, click: () => { sendMenuClick('app:openLink', 'https://github.com/Stapxs/Stapxs-QQ-Lite-2.0/wiki') } },
                        { label: args.feedback, click: () => { sendMenuClick('app:openLink', 'https://github.com/Stapxs/Stapxs-QQ-Lite-2.0/issues') } },
                        { type: 'separator' },
                        { label: args.license, click: () => { sendMenuClick('app:openLink', 'https://github.com/Stapxs/Stapxs-QQ-Lite-2.0/blob/master/LICENSE') } }
                    ],
                }
            ] as MenuItemConstructorOptions[]
            Menu.setApplicationMenu(Menu.buildFromTemplate(template))
        }
    })
    ipcMain.on('sys:updateMenu', (event, args) => {
        if (process.platform === 'darwin') {
            const id = args.id
            const action = args.action
            const value = args.value
            // 在 template 里寻找这个 id 修改对应的值
            let menuIndex = -1;
            let itemIndex = -1;
            for (let i = 0; i < template.length; i++) {
                const menuItem = template[i]
                if(menuItem.id == id) {
                    menuIndex = i
                    break
                }
            }
            if (menuIndex == -1) {
                for (let i = 0; i < template.length; i++) {
                    const menuItem = template[i]
                    const submenu = menuItem.submenu as MenuItemConstructorOptions[];
                    if (submenu && submenu.length > 0) {
                        for (let j = 0; j < submenu.length; j++) {
                            const subMenuItem = submenu[j]
                            if (subMenuItem.id == id) {
                                menuIndex = i
                                itemIndex = j
                                break
                            }
                        }
                    }
                }
            }
            if (menuIndex > -1) {
                const item = itemIndex > -1 ? template[menuIndex].submenu[itemIndex] : template[menuIndex]
                switch (action) {
                    case 'label': item.label = value; break
                    case 'visible': item.visible = value; break
                }
            }
            Menu.setApplicationMenu(Menu.buildFromTemplate(template))
        }
    })
    function sendMenuClick(name: string, value = undefined as any) {
        if(win) {
            if(value) {
                win.webContents.send(name, value)
            } else {
                win.webContents.send(name)
            }
        }
    }
    // MacOS：刷新 touchBar 消息列表
    ipcMain.on('sys:flushTouchBar', (event, list) => {
        if(touchBarInstance) {
            touchBarInstance.flush(list)
        }
    })
    // MacOS：新消息，刷新 touchBar
    ipcMain.on('sys:newMessage', (event, data) => {
        if(touchBarInstance) {
            touchBarInstance.newMessage(data)
        }
    })
}
