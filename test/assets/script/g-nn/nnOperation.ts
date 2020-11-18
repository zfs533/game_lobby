import { addEvent } from "../common/ui"
import JDNNGame from "./jdnnGame"
import QznnGame from "./qznnGame"

const { ccclass, property } = cc._decorator
const BET_POINT = [5, 10, 15, 20, 25]

@ccclass
export default class NNOperation extends cc.Component {
    @property(cc.Node)
    private nodeDealer: cc.Node = undefined

    @property(cc.Node)
    private nodeBet: cc.Node = undefined

    private game: JDNNGame | QznnGame

    protected onLoad() {
        this.initDealer()
        this.initBet()
    }
    init(game: JDNNGame | QznnGame) {
        this.game = game
    }
    private initDealer() {
        for (let child of this.nodeDealer.children) {
            let btn = child.getComponent(cc.Button)
            let handler = new cc.Component.EventHandler()
            handler.target = this.node
            handler.component = cc.js.getClassName(this)
            handler.handler = "onClickDealer"
            handler.customEventData = child.name
            addEvent(btn, handler)
        }
    }
    private initBet() {
        for (let child of this.nodeBet.children) {
            let btn = child.getComponent(cc.Button)
            let handler = new cc.Component.EventHandler()
            handler.target = this.node
            handler.component = cc.js.getClassName(this)
            handler.handler = "onClickBet"
            handler.customEventData = child.name
            addEvent(btn, handler)
        }
    }
    private onClickDealer(btn: cc.Button, data: string) {
        this.game.msg.sendDealer(+data)
        this.game.info.hidePrompt();
    }
    private onClickBet(btn: cc.Button, data: string) {
        let val = BET_POINT[+data]
        this.game.msg.sendBet(val)
        this.game.info.hidePrompt();
    }
    showDealer(show: boolean = true) {
        this.nodeDealer.active = show
        // let btn = this.nodeDealer.getComponentsInChildren(cc.Button)
        // btn.forEach(btn => { btn.interactable = true })
    }
    showBet(show: boolean = true) {
        this.nodeBet.active = show
    }
}
