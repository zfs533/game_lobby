import PokerRes from "./pokerRes"
import PokerCard from "./pokerCard";

const { ccclass, property } = cc._decorator
@ccclass

export default class PokerGame extends cc.Component {

    @property(cc.Prefab)
    private prePoker: cc.Prefab = undefined

    private _pokerRes: PokerRes
    private _turningDuration = 0.4

    get pokerRes() {
        if (!this._pokerRes) {
            this._pokerRes = cc.instantiate(this.prePoker).getComponent(PokerRes)
        }
        return this._pokerRes
    }

    /**
     * data传0返回牌背，其他正面
     */
    getPoker(data: number) {
        let node = this.pokerRes.getCard(data);
        node.getComponent(PokerCard).value = data
        return node
    }

    setPoker(card: cc.Node, data: number) {
        this.pokerRes.setCard(card, data);
        card.getComponent(PokerCard).value = data
    }

    getDdzCard(data: number) {
        let node = this.pokerRes.getDdzCard(data);
        node.getComponent(PokerCard).value = data
        return node;
    }

    setDdzCard(card: cc.Node, data: number) {
        this.pokerRes.setDdzCard(card, data);
        card.getComponent(PokerCard).value = data
    }

    // 显示正反面
    showFront(card: cc.Node, show: boolean) {
        let front = card.getChildByName("front")
        let back = card.getChildByName("back")
        if (front && back) {
            front.active = show
            back.active = !show
        }
    }

    isFront(card: cc.Node) {
        let front = card.getChildByName("front")
        if (front) return front.active
        return false
    }

    pokerTurn(card: cc.Node, toFront, doAnim = true, changeScale = 1) {
        return new Promise((resolve) => {
            if (doAnim) {
                let tweenDuration = this._turningDuration / 2
                card.scaleX = changeScale
                let actions = cc.sequence(
                    cc.scaleTo(tweenDuration, 0, changeScale),
                    cc.callFunc(() => {
                        this.showFront(card, toFront)
                    }),
                    cc.scaleTo(tweenDuration, changeScale, changeScale),
                    cc.callFunc(() => {
                        resolve()
                    })
                )
                // card.runAction(actions)
                cc.tween(card).then(actions).start();
                // cc.tween(card)
                //     .to(tweenDuration, { scaleX: 0, scaleY: changeScale })
                //     .call(
                //         () => {
                //             this.showFront(card, toFront)
                //         }
                //     )
                //     .to(tweenDuration, { scale: changeScale })
                //     .call(() => { resolve() })
                //     .start();
            } else {
                card.scaleX = changeScale
                card.scaleY = changeScale
                this.showFront(card, toFront)
                resolve()
            }
        });
    }

    lhTurnAnim(node: cc.Node, data: number, doAnim: boolean, changeScale: number) {
        return new Promise(resolve => {
            let turnTime = 0.1;
            let delayTime = doAnim ? 0.3 : 0;
            let scale1 = changeScale;
            if (doAnim) {
                scale1 += 0.3;
                //node.runAction(cc.scaleTo(0.5, scale1));
                cc.tween(node).to(0.5, { scale: scale1 }).start();
            }
            // node.runAction(cc.sequence(
            //     cc.delayTime(delayTime),
            //     cc.scaleTo(turnTime + delayTime * 0.5, 0, scale1),
            //     cc.callFunc(() => {
            //         this.setPoker(node, data);
            //     }),
            // cc.scaleTo(turnTime + delayTime * 0.5, changeScale, changeScale),
            //     cc.callFunc(() => {
            //         resolve();
            //     })
            // ));
            cc.tween(node)
                .delay(delayTime)
                .to(turnTime + delayTime * 0.5, { scaleX: 0, scaleY: scale1 })
                .call(() => { this.setPoker(node, data); })
                .to(turnTime + delayTime * 0.5, { scaleX: changeScale, scaleY: changeScale })
                .call(() => { resolve(); })
                .start();
        })
    }
}