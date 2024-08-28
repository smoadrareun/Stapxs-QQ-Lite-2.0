<!--
 * @FileDescription: 通知消息模板
 * @Author: Stapxs
 * @Date: 2022/12/04
 * @Version: 1.0
-->

<template>
    <div class="note">
        <div class="note-recall note-base" v-if="data.notice_type && data.notice_type.indexOf('recall') >= 0">
            <a>{{ info.name }}</a>
            <span>{{ $t('chat_notice_recall') }}</span>
            <div>

            </div>
        </div>
        <div class="note-ban note-base" v-if="data.notice_type == 'group_ban'">
            <template v-if="data.sub_type === 'ban'">
                <template v-if="isMe(data.user_id)">
                    <span>{{ $t('chat_member_type_admin') }}</span>
                    <a>&nbsp;{{ getName(data.operator_id) }}&nbsp;</a>
                    <span>{{ $t('note_ban_you') }}</span>
                    <span>&nbsp;{{ fTime(data.duration) }}</span>
                </template>
                <template v-else>
                    <span>{{ $t('note_ban_others') }}</span>
                    <a>&nbsp;{{ getName(data.user_id) }}&nbsp;</a>
                    <span>{{ fTime(data.duration) }}</span>
                </template>
            </template>
            <span v-else>{{ $t('note_unban', { name: isMe(data.user_id) ? $t('you') : getName(data.user_id) }) }}</span>
        </div>
        <div class="note-time note-base" v-if="data.sub_type === 'time'">
            <a>{{
                Intl.DateTimeFormat(trueLang, getTimeConfig(new Date(data.time * 1000)))
                    .format(new Date(data.time * 1000))
            }}</a>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { runtimeData } from '@/function/msg'
import { getTimeConfig, getTrueLang } from '@/function/utils/systemUtil'

export default defineComponent({
    name: 'NoticeBody',
    props: ['data'],
    data() {
        return {
            trueLang: getTrueLang(),
            getTimeConfig,
            info: ref(this.data) as { [key: string]: any }
        }
    },
    methods: {
        isMe(id: number) {
            return runtimeData.loginInfo.uin === id
        },
        getName(id: number) {
            const back = runtimeData.chatInfo.info.group_members.filter((item) => {
                return item.user_id === id
            })
            if (back.length === 1) {
                return back[0].card === '' || back[0].card == null ? back[0].nickname : back[0].card
            }
            return id
        },
        fTime(time: number) {
            // 将秒数转换为可阅读的时间，最大单位天
            const day = Math.floor(time / 86400)
            const hour = Math.floor((time % 86400) / 3600)
            const minute = Math.floor((time % 3600) / 60)
            const second = time % 60

            let back = ''
            if (day > 0) {
                back += `${day} ${this.$t('days')} `
            }
            if (hour > 0) {
                back += `${hour} ${this.$t('hours')} `
            }
            if (minute > 0) {
                back += `${minute} ${this.$t('minutes')} `
            }
            if (second > 0) {
                back += `${second} ${this.$t('seconds')} `
            }
            return back
        }
    },
    mounted() {
        if (this.info.notice_type && this.info.notice_type.indexOf('recall') >= 0) {
            // 补全撤回者信息
            if (runtimeData.chatInfo.show.type === 'group') {
                const id = this.info.operator_id
                // 寻找群成员信息
                if (runtimeData.chatInfo.info.group_members !== undefined) {
                    const back = runtimeData.chatInfo.info.group_members.filter((item) => {
                        return item.user_id === Number(id)
                    })
                    if (back.length === 1) {
                        this.info.name = back[0].card === '' || back[0].card == null ? back[0].nickname : back[0].card
                    } else {
                        this.info.name = id
                    }
                } else {
                    this.info.name = id
                }
            } else {
                this.info.name = runtimeData.chatInfo.show.name
            }
        }
    }
})
</script>
