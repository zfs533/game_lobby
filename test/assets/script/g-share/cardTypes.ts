import PopActionBox from "../lobby/popActionBox";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardTypes extends PopActionBox {
    @property(cc.ScrollView)
    private svList: cc.ScrollView = undefined

    onLoad () {
        super.onLoad()
        this.autoDestroy = false
        if (this.svList)
            this.svList.node.active = false
    }

    protected start () {
        this.openAnim(() => {
            if (this.svList)
                this.svList.node.active = true
        })
    }
}
