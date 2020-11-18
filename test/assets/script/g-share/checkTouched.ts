import { showConfirm } from "../common/ui"
import Game from "./game";
//检查一局游戏中玩家是否点击过屏幕
const { ccclass, property } = cc._decorator;
const delay = 2.3
@ccclass
export default class CheckTouched extends cc.Component {
    userTouched: boolean = false

    game: Game = undefined;

    setGame(game) {
        this.game = game;
    }

    onEnable() {
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.on(cc.Node.EventType.TOUCH_END, (ev) => {
            this.userTouched = true;
        })
        if ((<any>this.node)["_touchListener"]) {
            (<any>this.node)["_touchListener"].setSwallowTouches(false)
        }
    }

    check() {
        if (this.userTouched) return
        let toLeave = () => {
            if (this.game) this.game.leaveGame()
        }
        this.scheduleOnce(toLeave, delay)

        let cf = showConfirm("亲，您已经一局未操作了，是否要继续游戏？", "继续", "退出")
        cf.okFunc = () => {
            this.unschedule(toLeave);
        };
        cf.cancelFunc = () => {
            this.unschedule(toLeave);
            toLeave();
        };
    }
}
