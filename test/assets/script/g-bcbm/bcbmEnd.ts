import BCBCGame from "./bcbmGame";
import BCBMCarLog from "./bcbmCarLog";
import { AreaAwardType } from "./bcbmEnum";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BCBMEnd extends cc.Component {

    @property(cc.Label)
    labelWin: cc.Label = null;

    @property(cc.Label)
    labelLos: cc.Label = null;

    @property([cc.Node])
    effectArr: cc.Node[] = [];

    private game: BCBCGame = null;
    private curEffectNode: cc.Node = null;


    @property
    area001: number = 1
    @property
    awardType: number = 1

    test() {
        // this.playLoseMoneyAction(10000);
        this.playAddMoneyAction(10000);
        this.labelLos.node.active = false;
        this.labelWin.node.active = true;
        let dt: ps.LocInfo = { loc: 0, area: this.area001, awardType: this.awardType }
        let multiple = this.getMultiple(dt);
        this.showEffect(multiple);
    }



    showInfo(game: BCBCGame, money: number, loc: number, area: number) {
        this.labelLos.node.active = false;
        this.labelWin.node.active = false;
        this.game = game;
        let award = this.game.bcbmPath.getCarLogType(loc);
        let dt: ps.LocInfo = { loc: loc, area: area, awardType: award }
        let multiple = this.getMultiple(dt);
        this.showEffect(multiple);

        if (money == 0) {
            return;
        }
        if (money > 0) {
            this.game.adoMgr.playWin();
            this.labelWin.node.active = true;
            this.playAddMoneyAction(money);
        }
        else {
            this.game.adoMgr.playLose();
            this.labelLos.node.active = true;
            this.playLoseMoneyAction(money);
        }

        //车标，倍率，分数
    }

    showEffect(multiple: number) {
        for (let i = 0; i < this.effectArr.length; i++) {
            this.effectArr[i].active = false;
        }
        this.curEffectNode.active = true;
        this.game.playAnima(this.curEffectNode);
    }

    playAddMoneyAction(scoreNum: number) {
        this.labelWin.node.y = 56;
        this.labelWin.string = "";
        let score = Math.abs(scoreNum);
        let num = 1;
        let func = () => {
            num += score / 40;
            let str = "+" + num.toFixed(1);
            if (num >= score) {
                str = "+" + score;
                this.labelWin.string = str;
                this.unscheduleAllCallbacks();
                this.labelWin.node.stopAllActions();
                return;
            }
            this.labelWin.string = str;
        }
        this.schedule(() => {
            func();
        }, 0);

        let moveBy = cc.moveTo(0.04, this.labelWin.node.x, this.labelWin.node.y + 5);
        let moveBy1 = cc.moveTo(0.04, this.labelWin.node.x, this.labelWin.node.y - 5);
        let sequence = cc.sequence(moveBy, moveBy1);
        // this.labelWin.node.runAction(sequence.repeatForever());
        cc.tween(this.labelWin.node).then(sequence.repeatForever()).start();
    }

    playLoseMoneyAction(scoreNum: number) {
        this.labelLos.node.y = 56;
        this.labelLos.string = "";
        let score = Math.abs(scoreNum);
        let num = 1;
        let func = () => {
            num += score / 40;
            let str = "-" + num.toFixed(1);
            if (num >= score) {
                str = "-" + score;
                this.labelLos.string = str;
                this.unscheduleAllCallbacks();
                this.labelLos.node.stopAllActions();
                return;
            }
            this.labelLos.string = str;
        }
        this.schedule(() => {
            func();
        }, 0);

        let moveBy = cc.moveTo(0.04, this.labelLos.node.x, this.labelLos.node.y + 5);
        let moveBy1 = cc.moveTo(0.04, this.labelLos.node.x, this.labelLos.node.y - 5);
        let sequence = cc.sequence(moveBy, moveBy1);
        // this.labelLos.node.runAction(sequence.repeatForever());
        cc.tween(this.labelLos.node).then(sequence.repeatForever()).start();
    }

    /**
     * 获取倍率
     * @param locs
     */
    getMultiple(locs: ps.LocInfo): number {
        let index = 1;
        switch (locs.area) {
            case 1:
                if (locs.awardType == AreaAwardType.Big) {
                    index = 40;
                    this.curEffectNode = this.effectArr[0];
                }
                else {
                    index = 4;
                    this.curEffectNode = this.effectArr[4];
                }
                break;
            case 2:
                if (locs.awardType == AreaAwardType.Big) {
                    index = 30;
                    this.curEffectNode = this.effectArr[1];
                }
                else {
                    index = 3;
                    this.curEffectNode = this.effectArr[5];
                }
                break;
            case 3:
                if (locs.awardType == AreaAwardType.Big) {
                    index = 15;
                    this.curEffectNode = this.effectArr[2];
                }
                else {
                    index = 2;
                    this.curEffectNode = this.effectArr[6];
                }
                break;
            case 4:
                if (locs.awardType == AreaAwardType.Big) {
                    index = 10;
                    this.curEffectNode = this.effectArr[3];
                }
                else {
                    index = 1;
                    this.curEffectNode = this.effectArr[7];
                }
                break;
        }
        return index;
    }

}
