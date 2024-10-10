/* eslint-disable no-console */

import { register } from 'register-service-worker'
import { PopInfo, PopType, Logger } from './function/base'
import app from './main'
import { runtimeData } from './function/msg'

const popInfo = new PopInfo()
const logger = new Logger()

if (process.env.NODE_ENV === 'production') {
    register(`${process.env.BASE_URL}sw.js`, {
        ready() {
            logger.debug(app.config.globalProperties.$t('应用已通过 service worker 服务从缓存中加载，更多信息请查看 https://goo.gl/AFskqB。'))
        },
        registered() {
            logger.debug(app.config.globalProperties.$t('Service worker 服务注册成功。'))
            runtimeData.tags.sw = true
        },
        cached() {
            console.log(app.config.globalProperties.$t('内容已完成缓存便于离线使用。'))
        },
        updatefound() {
            console.log(app.config.globalProperties.$t('正在下载新的内容 ……'))
        },
        updated(registration) {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
            console.log(app.config.globalProperties.$t('新的内容已缓存完成，请刷新以生效。'))
        },
        offline() {
            console.log(app.config.globalProperties.$t('没有有效的网络连接，应用正在以离线模式运行。'))
            popInfo.add(PopType.INFO, app.config.globalProperties.app.config.globalProperties.$t('没有网络'))
        },
        error(error) {
            console.error(app.config.globalProperties.$t('注册 service worker 时发生错误。') + ': ', error)
            runtimeData.tags.sw = false
        }
    })
}
