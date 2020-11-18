import ErmjTicker from "./ermjTicker";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ErmjTimer extends cc.Component {


    @property(cc.Node)
    private nodeSeat: cc.Node = undefined;

    @property(cc.Label)
    private labRemain: cc.Label = undefined;

    @property(cc.Label)
    private labScore: cc.Label = undefined;

    private _remainNum = 0;
    private PAI_NUM_REMAIN_BEGIN = 64;

    @property(ErmjTicker)
    ticker: ErmjTicker = null;

    setGameTicker(time: number) {
        this.ticker.startTick(time);
    }

    start() {
        let fadeTime = 1.5;
        this.nodeSeat.children.forEach(element => {
            element.active = true;
            //element.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(fadeTime), cc.fadeIn(fadeTime))));
            cc.tween(element).then(cc.repeatForever(cc.sequence(cc.fadeOut(fadeTime), cc.fadeIn(fadeTime)))).start();
            element.active = false;
        });
    }

    reset() {
        this.nodeSeat.children.forEach((v) => {
            v.active = false;
        });
    }



    setBet(bet: number) {
        if (this.labScore) {
            this.labScore.node.active = true;
            this.labScore.string = `${bet}`;
        }
    }

    setTurn(seat: number) {
        for (let index = 0; index < this.nodeSeat.children.length; index++) {
            let nodeTurn = this.nodeSeat.children[index];
            if (index === seat)
                nodeTurn.active = true;
            else
                nodeTurn.active = false;
        }
    }

    setRemainPaiTotal(total: number, isAll = false) {
        this._remainNum = isAll ? this.PAI_NUM_REMAIN_BEGIN : total;
        this.labRemain.string = this._remainNum + "";
    }

    setPlayerDraw() {
        this._remainNum -= 1;
        this.labRemain.string = this._remainNum + "";
    }

    setWait(leftTime: number, seat: number) {
        this.setGameTicker(leftTime);
        this.setTurn(seat);
    }
}
