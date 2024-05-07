'use strict'

import Store from 'electron-store'
import windowStateKeeper from 'electron-window-state'
import { regIpcListener } from './function/electron/ipc'
import path from 'path'
import { version as appVersion } from '../package.json'

import installExtension from 'electron-devtools-installer'

import { Menu, session } from 'electron'
import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'

protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

export let win = undefined as BrowserWindow | undefined

async function createWindow() {
    console.log('')
    console.log(' _____ _____ _____ _____ __ __  \n' +
                '|   __|_   _|  _  |  _  |  |  | \n' +
                '|__   | | | |     |   __|-   -| \n' +
                '|_____| |_| |__|__|__|  |__|__| CopyRight © Stapx Steve')
    console.log('=======================================================')
    console.log('Welcome to Stapxs QQ Lite, current version: ' + appVersion)
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
        icon: path.join(__dirname,'./public/img/icons/icon.png'),
        webPreferences: {
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: false
        }
    } as Electron.BrowserWindowConstructorOptions
    if(process.platform === 'darwin') {
        // macOS
        windowConfig = {
            ...windowConfig,
            maximizable: false,
            fullscreen: false,
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
            frame: false,
            icon: path.join(__dirname,'./public/img/icons/icon.png')
        }
        store.set('opt_no_window', 'true')
    }
    win = new BrowserWindow(windowConfig)
    win.once('focus', () => {if(win)win.flashFrame(false)})
    mainWindowState.manage(win)     // 窗口状态管理器
    console.log('Create main window to complete.')
    // 注册 IPC 事务
    regIpcListener()
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
            if(imageAddress.some((address) => details.url.startsWith(address))) {
                // 给这个域名添加文件名头
                const contentType = details.responseHeaders['content-type']
                if(contentType && contentType[0]) {
                    const typeName = contentType[0].split('/')[1]
                    details.responseHeaders['content-disposition'] =
                            ['attachment; filename="file.' + typeName]
                }
            } else if (!details.url.startsWith('chrome-extension://')) {
                // 绕过 CSP 限制，X-Frame-Options 限制
                details.responseHeaders['content-security-policy'] = ['*']
                delete details.responseHeaders['x-frame-options']
            }
        }
        callback({ cancel: false, responseHeaders: details.responseHeaders })
    })
}

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
        app.quit()
    // }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            await installExtension('nhdogjmejiglipccpnnnanhbledajbpd')
        } catch (e: any) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
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
