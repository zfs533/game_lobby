import ScrollViewBox from "../lobby/scrollViewBox"

const { ccclass, property } = cc._decorator

@ccclass
export default class GameHelp extends ScrollViewBox {
    @property(cc.RichText)
    protected label: cc.RichText = undefined

    protected onLoad() {
        super.onLoad()
        this.label.string = "暂无说明"
    }

    showContent(str: string) {
        this.label.string = str
    }
}
