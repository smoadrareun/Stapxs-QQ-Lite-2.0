<!--
 - @FileDescription: 设置页面（群/好友设置页面）
 - @Author: Stapxs
 - @Date: 2023/2/7
 - @Version: 1.0 - 初始版本
-->

<template>
    <div class="info-pan-set" style="padding:0">
        <!-- 公用设置 -->
        <!-- 群设置 -->
        <template v-if="type == 'group'">
            <div class="opt-item"
                v-if="(chat.info.group_info.gOwner && chat.info.group_info.gOwner === runtimeData.loginInfo.uin) || (chat.info.group_info.gAdmins && chat.info.group_info.gAdmins.indexOf(runtimeData.loginInfo.uin) >= 0)">
                <font-awesome-icon :icon="['fas', 'pen']" />
                <div>
                    <span>{{ $t('chat_chat_info_group_name') }}</span>
                    <span>{{ $t('chat_chat_info_group_name_tip') }}</span>
                </div>
                <input class="ss-input" style="width:150px" type="text" @keyup="setGroupName"
                    v-model="runtimeData.chatInfo.show.name">
            </div>
            <div class="opt-item">
                <font-awesome-icon :icon="['fas', 'note-sticky']" />
                <div>
                    <span>{{ $t('chat_chat_info_group_card') }}</span>
                    <span>{{ $t('chat_chat_info_group_card_tip') }}</span>
                </div>
                <input class="ss-input" style="width:150px" type="text" @keyup="setGroupCard" v-model="runtimeData.chatInfo.info.me_info.card">
            </div>

            <button class="ss-button" style="width: calc(100% - 60px); margin: 30px 30px 0 30px;"
                @click="leaveGroup()">
                {{ $t('exit_group') }}
            </button>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { runtimeData } from '@/function/msg'
import { Connector } from '@/function/connect'
import { reloadUsers } from '@/function/utils/appUtil'

export default defineComponent({
    name: 'ViewOptInfo',
    props: ['type', 'chat'],
    data() {
        return {
            runtimeData: runtimeData
        }
    },
    methods: {
        /**
         * 设置群名片
         * @param event 按键事件
         */
        setGroupCard(event: KeyboardEvent) {
            if (event.key === 'Enter') {
                Connector.send(
                    'set_group_card', 
                    {
                        group_id: this.chat.show.id,
                        user_id: runtimeData.loginInfo.uin,
                        card: runtimeData.chatInfo.info.me_info.card
                    },
                    'setGroupCard'
                )
            }
        },

        /**
         * 设置群名
         * @param event 按键事件
         */
        setGroupName(event: KeyboardEvent) {
            if (event.key === 'Enter' && runtimeData.chatInfo.show.name != '') {
                Connector.send(
                    'set_group_name', 
                    {
                        group_id: this.chat.show.id,
                        group_name: runtimeData.chatInfo.show.name
                    },
                    'setGroupName'
                )
            }
        },

        /**
         * 退出群聊
        */
        leaveGroup() {
            const popInfo = {
                html: '<span>' + this.$t('trust_leave_group') + '</span>',
                button: [
                    {
                        text: this.$t('btn_yes'),
                        fun: () => {
                            if(runtimeData.jsonMap.leave_group?.name) {
                                Connector.send(runtimeData.jsonMap.leave_group?.name, {
                                    group_id: this.chat.show.id
                                }, 'leaveGroup')
                            }
                            // 从消息列表中删除该群聊
                            runtimeData.onMsgList = runtimeData.onMsgList.filter((item: any) => item.group_id !== this.chat.show.id)
                            // 关闭群聊窗口
                            runtimeData.chatInfo.show.id = 0
                            // 刷新好友/群列表
                            reloadUsers()

                            runtimeData.popBoxList.shift()
                        }
                    },
                    {
                        text: this.$t('btn_no'),
                        master: true,
                        fun: () => { runtimeData.popBoxList.shift() }
                    }
                ]
            }
            runtimeData.popBoxList.push(popInfo)
        }
    }
})
</script>

<style scoped>
.opt-item:hover input[type="text"] {
    background: var(--color-card-2);
    transition: background .2s;
}
</style>
