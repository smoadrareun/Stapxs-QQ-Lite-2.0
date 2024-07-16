import axios from 'axios'

import { BrowserWindow, TouchBar, ScrubberItem, nativeImage } from 'electron'
const { TouchBarButton, TouchBarScrubber, TouchBarPopover, TouchBarSpacer, TouchBarLabel } = TouchBar

export class touchBar {
    win: BrowserWindow

    touchBarScrubber = new TouchBarScrubber({
        overlayStyle: 'outline',
        showArrowButtons: true,
        continuous: false,
        mode: 'free',
        items: [],
        select: (index) => {
            const id = Object.keys(this.itemList)[index]
            this.win.webContents.send('app:jumpChat', {
                userId: id,
                messageId: 0
            })
        }
    })
    search = new TouchBarButton({
        icon: nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEDSURBVHgBtZKBEYIwDEWDE7CB3UBGwA3cQDbQDWAD3AA3QSdQJygbwAY19cIRa0OLp//un7lLfElKABwZYxS6Rmsz6YZu0DksEYFCsmAlMRIGa/CnYLkL+oEe0Bv0juU69DZJkg6EyUpnPeWpsU9xZnWtBFOsSKNTmBHmT6y+8BU0rEBBQLYhuhenpBXlFfzQig3xttEKnVF8hXjdWaxc4DcaWPwxYUfxGuKVCfDXe4yn0Ie+MPtPO16FL5mzB64jYAdWX4U6WpWRMC2eGR23doqPNH1OMW86ag8z3V2opD4aSuDCTMfuguxBp1QTDyVwylZWQuNl0Iimf4f28AsRVKObJwdbHWO7DC5FAAAAAElFTkSuQmCC'),
        click: () => {
            this.win.webContents.send('app:changeTab', 'Friends')
        }
    })
    itemList: {[key: number]: ScrubberItem} = {}

    constructor(win: BrowserWindow) {
        this.win = win
        this.win.setTouchBar(new TouchBar({ items: [this.search, this.touchBarScrubber] }))
    }
    flush(messageList: {
        id: number,
        name: string,
        image: string
    }[]) {
        this.itemList = {}
        this.win.setTouchBar(new TouchBar({ items: [this.search, this.touchBarScrubber] }))
        // 创建 item
        messageList.forEach(async (message) => {
            this.itemList[message.id] = { label: message.name }
        })
        this.touchBarScrubber.items = Object.values(this.itemList)
    }
    async newMessage(data: {
        id: number,
        image: string,
        name: string,
        msg: string
    }) {
        const response = await axios.get(data.image, {
            responseType: 'arraybuffer'
        })
        let image = nativeImage.createFromBuffer(response.data)
        image = image.resize({ width: 25, height: 25 })
        // 创建 poper
        const popover = new TouchBarPopover({
            label: '新消息',
            items: new TouchBar({
                items: [
                    new TouchBarButton({ icon: image, iconPosition: 'right', enabled: false, backgroundColor: '#000'}),
                    new TouchBarButton({ label: data.name ?? '' }),
                    new TouchBarSpacer({ size: 'small' }),
                    new TouchBarLabel({ label: data.msg ?? '' })
                ]
            }),
            showCloseButton: true
        })
        this.win.setTouchBar(new TouchBar({ items: [this.search, this.touchBarScrubber, popover] }))
    }
}