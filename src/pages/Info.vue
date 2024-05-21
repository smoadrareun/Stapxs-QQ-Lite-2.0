<!--
 * @FileDescription: 群 / 好友信息页面
 * @Author: Stapxs
 * @Date: missing
 * @Version: 1.0
-->

<template>
    <div v-if="tags.openChatInfo" class="chat-info-pan">
        <div class="ss-card chat-info">
            <header>
                <span v-if="chat.show.type === 'group'">{{ $t('chat_chat_info_group') }}</span>
                <span v-if="chat.show.type === 'user'">{{ $t('chat_chat_info_user') }}</span>
                <font-awesome-icon @click="closeChatInfoPan" :icon="['fas', 'xmark']" />
            </header>
            <div :class="'chat-info-base ' + chat.show.type">
                <div>
                    <img :src="chat.show.avatar">
                    <div>
                        <a>{{ chat.show.name }}</a>
                        <span>{{ chat.show.id }}</span>
                    </div>
                </div>
                <div v-if="chat.show.type === 'group'" v-show="Object.keys(chat.info.group_info).length > 0">
                    <header>
                        <span>{{ $t('chat_chat_info_introduction') }}</span>
                    </header>
                    <span v-html="(chat.info.group_info.gIntro === undefined || chat.info.group_info.gIntro === '') ?
                    $t('chat_chat_info_nointroduction') : chat.info.group_info.gIntro"></span>
                    <div class="tags">
                        <div v-for="item in chat.info.group_info.tags" :key="item.md">
                            {{ item.tag }}
                        </div>
                    </div>
                    <!-- <header v-if="chat.info.group_info.gAdmins !== undefined">
                        <span>{{ $t('chat_member_type_admin') }}</span>
                    </header>
                    <div class="admin" v-if="chat.info.group_info.gAdmins !== undefined">
                        <img v-for="(item, index) in chat.info.group_info.gAdmins" :key="'chatinfoadmin-' + item"
                            :src="`https://q1.qlogo.cn/g?b=qq&s=0&nk=${item}`" :title="chat.info.group_info.ns[index]">
                    </div> -->
                </div>
                <div v-else-if="chat.show.type === 'user'">
                    <header>
                        <span>{{ $t('chat_chat_info_lnick') }}</span>
                    </header>
                    <span v-html="(chat.info.user_info.lnick === undefined || chat.info.user_info.lnick === '') ?
                    $t('chat_chat_info_nolnick') : chat.info.user_info.lnick"></span>
                    <header>
                        <span>{{ $t('chat_chat_info_other') }}</span>
                    </header>
                    <div class="outher">
                        <span>{{ $t('chat_chat_info_birthday') }}:
                            <span>
                                {{ chat.info.user === undefined ? '' : Intl.DateTimeFormat(trueLang,
                                        { year: 'numeric', month: "short", day: "numeric" }).format(
                                            new
                                                Date(`${chat.info.user_info.birthday.year}-${chat.info.user_info.birthday.month}-${chat.info.user_info.birthday.day}`)
                                        ) + ` (${$t('chat_chat_info_chinese_zodiac').split('&')[chat.info.user_info.shengxiao -
                                        1]})`
                                }}
                            </span>
                        </span>
                        <span>{{ $t('chat_chat_info_district') }}:
                            <span>
                                {{
                                        `${chat.info.user_info.country}-${chat.info.user_info.province}-${chat.info.user_info.city}`
                                }}
                            </span>
                        </span>
                    </div>
                    <template v-if="!chat.show.temp">
                        <!-- 临时会话没有这个板块 -->
                        <header>
                            <span>{{ $t('chat_chat_info_config') }}</span>
                        </header>
                        <OptInfo :type="'number'" :chat="chat"></OptInfo>
                    </template>
                </div>
            </div>
            <BcTab v-if="chat.show.type === 'group'" class="chat-info-tab">
                <div :name="$t('chat_chat_info_member')">
                    <div class="chat-info-tab-member">
                        <div class="search-view">
                            <input :placeholder="$t('base_search')" @input="searchList">
                        </div>
                        <div @click="startChat(item)" v-for="item in number_cache.length > 0 ? number_cache : chat.info.group_members" :key="'chatinfomlist-' + item.user_id">
                            <img loading="lazy" :src="`https://q1.qlogo.cn/g?b=qq&s=0&nk=${item.user_id}`">
                            <div>
                                <a>{{ item.card ? item.card : item.nickname }}</a>
                                <font-awesome-icon v-if="item.role === 'owner'" :icon="['fas', 'crown']" />
                                <font-awesome-icon v-if="item.role === 'admin'" :icon="['fas', 'star']" />
                            </div>
                            <span>{{ item.user_id }}</span>
                        </div>
                    </div>
                </div>
                <div :name="$t('chat_chat_info_notice')">
                    <div class="bulletins">
                        <BulletinBody
                            v-for="(item, index) in chat.info.group_notices ?? []"
                            :data="item"
                            :key="'bulletins-' + index"
                            :index="index">
                        </BulletinBody>
                    </div>
                </div>
                <div :name="$t('chat_chat_info_file')">
                    <div class="group-files" @scroll="fileLoad">
                        <div v-for="item in chat.info.group_files.file_list" :key="'file-' + item.id">
                            <FileBody :chat="chat" :item="item"></FileBody>
                        </div>
                        <div class="group-files-loader" v-show="chat.info.group_files !== undefined &&
                        chat.info.group_files.next_index !== undefined &&
                        chat.info.group_files.next_index !== 0">
                            <font-awesome-icon :icon="['fas', 'ellipsis']" />
                        </div>
                    </div>
                </div>
                <div :name="$t('chat_chat_info_config')">
                    <div class="layui-tab-item" style="padding: 0 20px;">
                        <OptInfo :type="'group'" :chat="chat"></OptInfo>
                    </div>
                </div>
            </BcTab>
        </div>
        <div class="card-info-pan-bg"></div>
    </div>
</template>
  
<script lang="ts">
import app from '@/main'
import BulletinBody from '@/components/BulletinBody.vue'
import FileBody from '@/components/FileBody.vue'
import OptInfo from './options/OptInfo.vue'
import BcTab from 'vue3-bcui/packages/bc-tab'

import { defineComponent, toRaw } from 'vue'
import { getTrueLang } from '@/function/utils/systemUtil'
import { runtimeData } from '@/function/msg'
import { UserFriendElem, UserGroupElem } from '@/function/elements/information'

export default defineComponent({
    name: 'ViewInfo',
    props: ['tags', 'chat'],
    components: { BulletinBody, FileBody, OptInfo, BcTab },
    data() {
        return {
            runtimeData: runtimeData,
            trueLang: getTrueLang(),
            isTop: false,
            number_cache: [] as any[]
        }
    },
    methods: {
        /**
         * 关闭面板
         */
        closeChatInfoPan() {
            this.$emit('close', null)
        },

        /**
         * 加载更多文件
         * @param event 滚动事件
         */
        fileLoad(event: Event) {
            this.$emit('loadFile', event)
        },

        /**
         * 发起聊天
         */
        startChat(info: any) {
            // 如果是自己的话就忽略
            if (info.user_id != runtimeData.loginInfo.uin) {
                // 检查这个人是否已经在聊天列表中
                let chat = runtimeData.onMsgList.find((item: UserFriendElem & UserGroupElem) => {
                    return item.user_id == info.user_id
                })
                if(!chat) {
                    // 检查这个人是不是好友
                    let friend = runtimeData.userList.find((item: UserFriendElem & UserGroupElem) => {
                        return item.user_id == info.user_id
                    })
                    if(friend) {
                        runtimeData.onMsgList.push(friend)
                        chat = friend
                    } else {
                        // 创建一个临时聊天
                        const user = {
                            user_id: info.user_id,
                            // 因为临时消息没有返回昵称
                            nickname: app.config.globalProperties.$t('chat_temp'),
                            remark: info.user_id,
                            group_id: info.group_id,
                            group_name: ''
                        } as UserFriendElem & UserGroupElem
                        runtimeData.onMsgList.push(user)
                        chat = user
                    }
                }
                // 切换到这个聊天
                this.$nextTick(() => {
                    if(chat) {
                        const item = document.getElementById('user-' + chat.user_id)
                        if(item) {
                            item.click()
                        }
                    }
                })
            }
        },

        searchList(event: Event) {
            const value = (event.target as HTMLInputElement).value
            if (value !== '') {
                this.number_cache = toRaw(this.chat.info.group_members)
                this.number_cache = this.number_cache.filter((item) => {
                    const name = item.card.toLowerCase() + '('+ item.nickname.toLowerCase() + ')'
                    const id = item.user_id
                    return name.indexOf(value.toLowerCase()) != -1 || id.toString() === value
                })
            } else {
                this.number_cache = [] as any[]
            }
        }
    }
})
</script>
  
<style scoped>
.search-view {
    background: transparent !important;
    margin-top: -10px;
}
.search-view > input {
    background: var(--color-card-1);
    border-radius: 7px;
    margin: 0 -10px;
    padding: 0 10px;
    height: 35px;
    width: 100%;
    border: 0;
}
</style>
