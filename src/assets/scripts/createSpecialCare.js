/*
    title: 刷新特别关心
    discription: 有些框架获取分组可能不包含特别关心，
            你可以用这个脚本来指定特别关心的用户；
            享受特别关心的相关通知功能。
*/

const specialList = []
for (const user of this.runtimeData.userList) {
    if (specialList.includes(user.user_id)) {
        user.class_id = 9999
        user.class_name = '特别关心'
        const classInfo = this.runtimeData.tags.classes.find(
            (item) => item.class_id == 9999)
        if (classInfo == undefined) {
            this.runtimeData.tags.classes.unshift({
                class_id: 9999,
                class_name: '特别关心'
            })
        }
    }
}