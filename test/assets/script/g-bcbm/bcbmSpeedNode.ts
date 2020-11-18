import BCBCGame from "./bcbmGame";

const { ccclass, property } = cc._decorator;
/**
 * 集气
 */
@ccclass
export default class BCBMSpeed extends cc.Component {

    @property(cc.Node)
    barBg: cc.Node = null;

    @property(cc.Node)
    bar: cc.Node = null;

    @property(cc.Node)
    btnNode: cc.Node = null;

    @property(cc.Node)
    headGuang: cc.Node = null;

    @property(cc.Node)
    effLb: cc.Node = null;

    @property(cc.Node)
    effLbNode: cc.Node = null;

    private isStart = false;
    private speed: number = 0.5;
    private isHide: boolean = false;

    private game: BCBCGame;

    start() {
        this.effLb.active = false;
        this.btnNode.on(cc.Node.EventType.TOUCH_START, this.handleButton, this);
        // this.startAction();
        // this.startProgress();

    }

    init(game: BCBCGame) {
        this.game = game;
        this.hideNode();
    }

    playEffLbAction() {
        let node: cc.Node = cc.instantiate(this.effLb);
        let num = Math.random() * 1 + 0.1;
        let str = num.toFixed(1);
        node.getComponent(cc.Label).string = "+" + str;
        node.active = true;
        node.scale = 0;
        node.y = 90 + Math.random() * 40;
        node.x = -80 + Math.random() * 160;
        this.effLbNode.addChild(node);
        let time = 0.25;
        let scaleTo = cc.scaleTo(time, 1.5, 1.5).easing(cc.easeBackOut())

        let moveTo = cc.moveTo(time, -155, 0);
        let scaleOut = cc.scaleTo(time, 0, 0);
        let fadeOut = cc.fadeOut(time);
        let spaw = cc.spawn(fadeOut, scaleOut, moveTo);

        let callbc = cc.callFunc(() => {
            node.destroy();
        });
        let sequence = cc.sequence(scaleTo, spaw, callbc);
        node.runAction(sequence);
    }

    handleButton() {
        if (this.isHide) { return; }
        this.game.adoMgr.playJiqi();
        let scale1 = cc.scaleTo(0.08, 1.2);
        let scale2 = cc.scaleTo(0.08, 1);
        let action = cc.sequence(scale1, scale2);
        // cc.tween(this.btnNode).then(action).start();
        this.btnNode.runAction(action);
        this.playEffLbAction();
        this.schedule(() => {
            this.bar.width += Math.random() * 2;
        }, 0.01, 5);
    }

    startAction() {
        let time = 0.07;
        let scale1 = cc.scaleTo(time, 1.1);
        let scale2 = cc.scaleTo(time, 1);
        let sequence = cc.sequence(scale1, scale2);
        let action = cc.repeatForever(sequence);
        // cc.tween(this.btnNode).then(action).start();
        this.btnNode.runAction(action);

        /* ------ */
        let scale3 = cc.scaleTo(time, 1, 1.5);
        let scale4 = cc.scaleTo(time, 1, 1);
        let sequence1 = cc.sequence(scale3, scale4);
        let action1 = cc.repeatForever(sequence1);
        // cc.tween(this.headGuang).then(action1).start();
        this.headGuang.runAction(action1);
    }

    update() {
        if (this.isStart) {
            if (this.bar.width > 350) {
                this.bar.width = 350;
                // this.bar.color = new cc.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 255);
                return;
            }
            this.bar.width += this.speed;
        }
    }

    startProgress() {
        this.bar.width = 10;
        this.isStart = true;
        this.startAction();
    }

    showNode() {
        this.isHide = false;
        this.node.active = true;
        this.startProgress();
        this.speed = 0.5;
        this.schedule(() => {
            this.speed += Math.random() * 0.12;
        }, 1, 5);
    }

    hideNode() {
        this.isHide = true;
        this.btnNode.stopAllActions();
        this.headGuang.stopAllActions();
        let scaleto = cc.scaleTo(0.3, 0);
        let callbk = cc.callFunc(() => {
            this.node.active = false;
        });
        let sequence = cc.sequence(scaleto, callbk);
        // cc.tween(this.btnNode).then(sequence).start();
        this.btnNode.runAction(sequence);
    }

}
