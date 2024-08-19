<template>
    <div class="update-info">
        <span>{{ updated ? $t('update_history') : $t('new_update') }}</span>
        <a>{{ version }}</a>
        <div class="title">
            <img :src="user.avatar">
            <a :href="user.url">{{ user.name }}</a>
            <span> {{ Intl.DateTimeFormat(getTrueLang(), { year: 'numeric', month: 'short', day: 'numeric' })
                        .format(new Date(date)) }} </span>
        </div>
        <div class="info"><span>{{ info.title }}</span>
            <div>
                <div v-for="(str, index) in info.content" :key="'changelog-' + index">
                    <span>{{ str }}</span>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'
import { getTrueLang, gitmojiToEmoji } from '@/function/utils/systemUtil'

export default defineComponent({
    name: 'UpdatePan',
    props: ['version', 'date', 'user', 'message', 'updated'],
    data() {
        return {
            getTrueLang,
            info: {
                title: '' as string,
                content: [] as string[]
            }
        }
    },
    mounted() {
        const updateInfo = this.message.split('\n')
        this.info.title = updateInfo[0]
        for (let i = 1; i < updateInfo.length; i++) {
            let text = updateInfo[i]
            if (text.startsWith(':')) {
                const end = text.substring(1).indexOf(':')
                const name = text.substring(0, end + 2)
                const emj = gitmojiToEmoji(name)
                if (emj != undefined) {
                    text = text.replace(name, emj)
                }
            }
            this.info.content.push(text)
        }
    }
})
</script>