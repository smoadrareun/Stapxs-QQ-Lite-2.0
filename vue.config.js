/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */

module.exports = {
    devServer: {
        client: {
            overlay: false
        }
    },
    publicPath: process.env.NODEJS_ENV === 'github-actions'
        ? '/Stapxs-QQ-Lite-2.0/'
        : undefined
    ,
    transpileDependencies: true,
    productionSourceMap: false,
    configureWebpack: {
        devtool: process.env.NODE_ENV == 'development' ? 'eval-source-map' : false,
        module: {
            rules: [
                {
                    test: /\.txt$/i,
                    use: 'raw-loader',
                },
                {
                    test: /\.po$/i,
                    use: 'raw-loader',
                },
                {
                    test: /\.yaml$/i,
                    use: 'js-yaml-loader',
                }
            ]
        },
        resolve: {
            fallback: {
                util: require.resolve('util/')
            }
        }
    },
    pwa: {
        name: 'Stapxs QQ Lite',
        themeColor: '#606E7A',
        iconPaths: {
            faviconSVG: 'img/icons/icon.svg',
            favicon512: 'img/icons/icon.png',
            appleTouchIcon: 'img/icons/icon-for-fuck-apple.png',
            maskIcon: 'img/icons/icon-maskable.png'
        },
        manifestOptions: {
            description: '一个兼容 OneBot 的非官方网页版 QQ 客户端，使用 Vue 重制的全新版本。',
            icons: [
                {
                    'src': 'img/icons/icon.svg',
                    'sizes': '1080x1080',
                    'purpose': 'any'
                },
                {
                    'src': 'img/icons/icon.png',
                    'type': 'image/png',
                    'sizes': '512x512'
                },
                {
                    'src': 'img/icons/icon-maskable.png',
                    'sizes': '1024x1024',
                    'type': 'image/png',
                    'purpose': 'maskable'
                }
            ],
            related_applications: [
                {
                  'platform': 'play',
                  'url': 'https://play.google.com/store/apps/details?id=com.tencent.mobileqq',
                  'id': 'com.tencent.mobileqq'
                },
                {
                    'platform': 'itunes',
                    'url': 'https://apps.apple.com/app/qq/id444934666'
                }
            ]
        }     
    },
    pluginOptions: {
        /**
         * Electron Builder 设置
         * @type {import('vue-cli-plugin-electron-builder').PluginOptions}
         */
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                appId: 'com.stapxs.qqweb',
                productName: 'Stapxs QQ Lite',
                copyright: 'Copyright © 2022-2024 Stapx Steve [林槐]',

                directories: {
                    output: 'dist_electron/out'
                },
                
                linux: {
                    target: [
                        {
                            target: 'deb',
                            arch: ['x64', 'arm64']
                        },
                        {
                            target: 'AppImage',
                            arch: ['x64', 'arm64']
                        },
                        {
                            target: 'tar.gz',
                            arch: ['x64', 'arm64']
                        }
                    ],
                    maintainer: 'Stapx Steve [林槐]',
                    vendor: 'Stapxs Steve Team',
                    synopsis: '一个兼容 OneBot 的非官方网页版 QQ 客户端。',
                    category: 'Network',
                    // TODO: 将来可能需要占用 QQ 自己的 MIME 类型
                    mimeTypes: ['application/x-stapxs-qq-lite'],
                    desktop: {
                        Type: 'Application',
                        Name: 'Stapxs QQ Lite',
                        GenericName: 'Stapxs QQ Lite Electron 客户端',
                        Comment: '一个兼容 OneBot 的非官方网页版 QQ 客户端。',
                        Terminal: 'false',
                        Category: 'Application',
                        Icon: 'stapxs-qq-lite'
                    }
                },

                win: {
                    target: [
                        {
                            target: 'portable',
                            // Windows 同时打包多个架构会融合在一个 exe 中，体积巨大
                            // 所以这儿只打了更常用 的 x64
                            arch: 'x64'
                        }
                    ],
                    appId: 'com.stapxs.qqweb',
                    icon: 'public/img/icons/icon-client-others.png',
                    legalTrademarks: 'Copyright © 2022-2024 Stapx Steve [林槐]',
                    publisherName: 'stapxs',
                },

                mac: {
                    target: [
                        {
                            target: 'dmg',
                            arch:['x64', 'arm64']
                        }
                    ],
                    category: 'public.app-category.social-networking',
                    icon: 'public/img/icons/icon-client-mac.icns',
                    darkModeSupport: true,
                    extraResources: [{
                        from: 'resources/tri-tone.aif',
                        to: 'tir-tone.aif'
                    }]
                },
                dmg: {
                    background: 'public/img/dmg-bg.png',
                    icon: 'public/img/icons/icon-client-mac.icns',
                    iconSize: 80,
                    sign: false,
                    contents: [
                        {
                            x: 112,
                            y: 110
                        },
                        {
                            type: 'link',
                            path: '/Applications',
                            x: 396,
                            y: 110
                        },
                    ],
                },
                afterAllArtifactBuild: async (context) => {
                    // 如果环境参数中有 `github-actions`，则删除 `dist_electron/out` 目录下所有的
                    //  `*-unpacked` 目录和 `build` 开头的文件，便于 GitHub Actions 上传构建结果
                    if (process.env.NODEJS_ENV === 'github-actions') {
                        const fs = require('fs')
                        const path = require('path')
                        // 寻找所有需要删除的文件和目录
                        const delList = fs.readdirSync(context.outDir).filter((item) => {
                            return item.endsWith('-unpacked') || item.startsWith('build') ||
                            item.startsWith('mac')
                        })
                        for (const item of delList) {
                            // 判断是文件还是目录
                            if (fs.statSync(path.join(context.outDir, item)).isDirectory()) {
                                fs.rmSync(path.join(context.outDir, item), { recursive: true })
                            } else {
                                fs.rmSync(path.join(context.outDir, item))
                            }
                        }
                    }
                }
            }
        }
    }
}
