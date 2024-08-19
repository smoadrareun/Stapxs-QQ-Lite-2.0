'use strict'

import path from 'path'
import Store from 'electron-store'
import installExtension from 'electron-devtools-installer'

import windowStateKeeper from 'electron-window-state'
import { noticeList, regIpcListener } from './function/electron/ipc'
import { version } from '../package.json'
import { Menu, session, app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { touchBar } from './function/electron/touchbar'

const isDevelopment = process.env.NODE_ENV !== 'production'
const isPrimary = app.requestSingleInstanceLock()

protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

export let win = undefined as BrowserWindow | undefined
export let touchBarInstance = undefined as touchBar | undefined

/* eslint-disable no-console */
async function createWindow() {
    console.log('')
    console.log(' _____ _____ _____ _____ __ __  \n' +
                '|   __|_   _|  _  |  _  |  |  | \n' +
                '|__   | | | |     |   __|-   -| \n' +
                '|_____| |_| |__|__|__|  |__|__| CopyRight © Stapx Steve')
    console.log('=======================================================')
    console.log('Welcome to Stapxs QQ Lite, current version: ' + version)
    console.log('The background language component will be initialized after the frontend is loaded.')
    
    console.log('Platform：' + process.platform)
    console.log('Start creating main window ……')
    Menu.setApplicationMenu(null)
    // 创建窗口
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1200,
        defaultHeight: 800
    })
    const store = new Store()
    let windowConfig = {
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 350,
        minHeight: 450,
        icon: path.join(__dirname,'./public/img/icons/icon.png'),
        webPreferences: {
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: false
        },
        maximizable: false,
        fullscreen: false
    } as Electron.BrowserWindowConstructorOptions
    if(process.platform === 'darwin') {
        // macOS
        windowConfig = {
            ...windowConfig,
            titleBarStyle: 'hidden',
            trafficLightPosition: { x: 11, y: 10 },
            vibrancy: 'fullscreen-ui',
            transparent: true,

            visualEffectState: process.env.NODE_ENV 
                    === 'development' ? 'active' : 'followWindow'
        }
    } else if(process.platform === 'win32') {
        // Windows
        windowConfig = {
            ...windowConfig,
            backgroundColor: '#00000000',
            backgroundMaterial: 'acrylic',
            frame: false
        }
        store.set('opt_no_window', 'true')
    } else if(process.platform === 'linux') {
        // Linux
        windowConfig = {
            ...windowConfig,
            transparent: true,
            frame: false
        }
        store.set('opt_no_window', 'true')
    }
    win = new BrowserWindow(windowConfig)
    win.once('focus', () => {if(win)win.flashFrame(false)})
    mainWindowState.manage(win)     // 窗口状态管理器
    console.log('Create main window to complete.')
    // 注册 IPC 事务
    regIpcListener()
    // macOS：创建 TouchBar
    touchBarInstance = new touchBar(win)
    // 加载应用
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        win.loadURL('app://./index.html')
    }

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        if (details.responseHeaders) {
            const imageAddress = [
                'https://gchat.qpic.cn/gchatpic_new',
                'https://multimedia.nt.qq.com.cn/download'
            ]
            const ignoreAddress = [
                'devtools://',
                'chrome-extension://',
                'http://localhost:8080',
                'https://registry.npmjs.org'
            ]
            if(imageAddress.some((address) => details.url.startsWith(address))) {
                // 给这个域名添加文件名头
                const contentType = details.responseHeaders['content-type']
                if(contentType && contentType[0]) {
                    const typeName = contentType[0].split('/')[1]
                    details.responseHeaders['content-disposition'] =
                            ['attachment; filename="file.' + typeName]
                }
            } else if (!ignoreAddress.some((address) => details.url.startsWith(address))) {
                // 绕过 CSP 限制，X-Frame-Options 限制
                details.responseHeaders['content-security-policy'] = ['*']
                delete details.responseHeaders['x-frame-options']
            }
        }
        callback({ cancel: false, responseHeaders: details.responseHeaders })
    })
}

app.on('open-url', (event, url) => {
    sendUrlToWindow(url)
})
app.on('second-instance', (event, cmd, workingDirectory) => {
    sendUrlToWindow(workingDirectory, cmd)
})
function sendUrlToWindow(url: string ,args: string[] = []) {
    win?.webContents.send('sys:handleUri', {
        url: url,
        args: args
    })
}

app.on('window-all-closed', () => {
    // 清空通知
    Object.keys(noticeList).forEach((key) => {
        noticeList[key].forEach((notice) => {
            notice.close()
        })
    })
    if (process.platform === 'win32')
    {
        app.removeAsDefaultProtocolClient('stapx-qq-lite')   // 取消默认协议
    }
    app.quit()
})

app.on('ready', async () => {
    // 单例模式
    if (!isPrimary) {
        app.quit()
        return
    }
    if (process.platform === 'win32')
    {
        app.setAppUserModelId('Stapx QQ Lite')              // 设置应用 ID
        app.setAsDefaultProtocolClient('stapx-qq-lite')     // 设置为默认协议
    }
    // 开发者工具
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            await installExtension('nhdogjmejiglipccpnnnanhbledajbpd')
        } catch (e: any) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
