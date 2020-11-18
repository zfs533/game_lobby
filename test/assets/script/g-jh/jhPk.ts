import JHGame from "./jhGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JHPk extends cc.Component {

    @property(cc.Node)
    private nodeBg: cc.Node = undefined;

    @property(cc.Node)
    private nodePlayers: cc.Node = undefined;

    @property(cc.Animation)
    private animPk: cc.Animation = undefined;

    @property(cc.Animation)
    private animFinalPk: cc.Animation = undefined;

    @property(cc.Animation)
    private animLosePk: cc.Animation = undefined;

    @property(cc.Node)
    private playerFrom: cc.Node = undefined;

    @property(cc.Node)
    private playerTo: cc.Node = undefined;

    private game: JHGame;



    private go1Action: cc.ActionInterval;
    private go2Action: cc.ActionInterval;
    private back1Action: cc.ActionInterval;
    private back2Action: cc.ActionInterval;

    private overAction: cc.ActionInterval;

    private pkFunc: Function = undefined;
    private loseFunc: Function = undefined;
    private backFunc: Function = undefined;
    private overFunc: Function = undefined;


    private ori_chan: cc.Node;
    private copy_chan: cc.Node;

    private ori_def: cc.Node;
    private copy_def: cc.Node;


    init(game: JHGame) {
        this.game = game;
    }

    private getPlayerCopy(rPos: number) {
        let mgr = this.game.plyMgr;

        let p = mgr.getPlyByPos(rPos);
        //不管是不是looker，服务器说谁pk就谁pk
        if (!p) {
            console.warn("cp is invalid");
            return;
        }
        let cOri = p.getPkNode();
        let cCopy = cc.instantiate(cOri);
        this.nodePlayers.addChild(cCopy);
        cCopy.setSiblingIndex(0);
        cCopy.setPosition(this.nodePlayers.convertToNodeSpaceAR(cOri.convertToWorldSpaceAR(cc.v2(0, 0))));
        return {
            ori: cOri,
            copy: cCopy
        };
    }

    clearPK() {
        this.nodeBg.active = false;
        this.animPk.node.active = false;
        if (this.animFinalPk) this.animFinalPk.node.active = false;
        this.nodePlayers.active = false;
        this.animLosePk.node.active = false;
        this.node.active = false;


        if (this.nodeBg)
            cc.director.getActionManager().removeAllActionsFromTarget(this.nodeBg, true);
        if (this.copy_chan)
            cc.director.getActionManager().removeAllActionsFromTarget(this.copy_chan, true);
        if (this.copy_def)
            cc.director.getActionManager().removeAllActionsFromTarget(this.copy_def, true);

        if (this.animPk)
            this.animPk.node.active = false;
        if (this.animLosePk)
            this.animLosePk.node.active = false;

        this.unschedule(this.pkFunc);
        this.unschedule(this.loseFunc);
        this.unschedule(this.backFunc);
        this.unschedule(this.overFunc);
        this.game.plyMgr.setPlayersActive();

    }

    /**
     * @description 展示PK动画
     * @param {number} from
     * @param {number} to
     * @param {boolean} win
     * @returns
     * @memberof JHPk
     */
    showPk(from: number, to: number, win: boolean) {
        return new Promise(resolve => {
            this.clearPK();

            let challenger = this.game.plyMgr.getPlyByPos(from);
            if (challenger) {
                this.game.adoMgr.noticePk(challenger.isMale);
            } else {
                console.warn("challenger is null")
            }
            if (this.copy_chan && this.copy_chan.isValid) {
                this.copy_chan.destroy();
            }
            if (this.copy_def && this.copy_def.isValid) {
                this.copy_def.destroy();
            }
            this.game.adoMgr.playPk();
            this.nodeBg.active = true;
            this.animPk.node.active = false;
            if (this.animFinalPk) this.animFinalPk.node.active = false;
            this.nodePlayers.active = true;
            this.animLosePk.node.active = false;
            this.node.active = true;
            this.nodeBg.opacity = 0;
            // this.nodeBg.runAction(cc.fadeTo(0.1, 127));
            cc.tween(this.nodeBg).to(0.1, { opacity: 127 }).start();
            //----------------------------------
            let chanObj = this.getPlayerCopy(from);
            if (!chanObj) {
                console.warn("no pk from");
                return;
            }
            let { ori: ori_chan0, copy: copy_chan0 } = chanObj;
            this.ori_chan = ori_chan0;
            this.copy_chan = copy_chan0;
            let oriFromPos = copy_chan0.position;
            //----------------------------------
            let defObj = this.getPlayerCopy(to);
            if (!defObj) {
                console.warn("no pk to");
                return;
            }
            let { ori: ori_def0, copy: copy_def0 } = defObj;
            this.ori_def = ori_def0;
            this.copy_def = copy_def0;
            //----------------------------------
            this.copy_chan.active = true;
            this.copy_def.active = true;
            this.ori_chan.active = false;
            this.ori_def.active = false;
            let oriToPos = copy_def0.position;
            //---------------出战-------------------
            let nowScale = this.copy_chan.scale;
            let ease = cc.easeQuarticActionOut();
            this.go1Action = cc.sequence(
                cc.scaleBy(0.7, 1.3).easing(ease),
                cc.scaleTo(0.3, nowScale).easing(ease),
                cc.spawn(cc.moveTo(0.5, <cc.Vec2>this.playerFrom.position).easing(ease), cc.scaleTo(0.5, 1))
            )
            // this.copy_chan.runAction(this.go1Action);
            cc.tween(this.copy_chan).then(this.go1Action).start();
            //-----------------出战-----------------
            let nowScale2 = this.copy_def.scale;
            let ease2 = cc.easeQuarticActionOut();
            this.go2Action = cc.sequence(
                cc.scaleBy(0.7, 1.3).easing(ease2),
                cc.scaleTo(0.3, nowScale2).easing(ease2),
                cc.spawn(cc.moveTo(0.5, <cc.Vec2>this.playerTo.position).easing(ease2), cc.scaleTo(0.5, 1))
            );
            // this.copy_def.runAction(this.go2Action);
            cc.tween(this.copy_def).then(this.go2Action).start();
            //----------------------------------

            this.scheduleOnce(this.pkFunc = () => {
                this.animPk.node.active = true;
                this.animPk.stop();
                this.animPk.node.opacity = 255;
                this.animPk.play();
            }, 1);



            this.scheduleOnce(this.loseFunc = () => {
                this.animLosePk.stop();
                this.animLosePk.node.setPosition(win ? this.playerTo.position : this.playerFrom.position);
                this.animLosePk.node.active = true;
                this.animLosePk.play();
                this.game.adoMgr.playSoundPkLose();
            }, 1.9);

            this.scheduleOnce(this.backFunc = () => {
                let self = this;
                this.back1Action = cc.sequence(
                    cc.moveTo(0.5, <cc.Vec2>oriFromPos).easing(cc.easeQuarticActionOut()),
                    cc.callFunc(() => {
                        if (this.copy_chan && this.copy_chan.isValid) {
                            this.copy_chan.destroy();
                        }
                    })
                );
                this.back2Action = cc.sequence(
                    cc.moveTo(0.5, oriToPos).easing(cc.easeQuarticActionOut()),
                    cc.callFunc(() => {

                        if (this.copy_def && this.copy_def.isValid) {
                            this.copy_def.destroy();
                        }
                    })
                );
                // this.copy_chan.runAction(this.back1Action);
                cc.tween(this.copy_chan).then(this.back1Action).start()
                // this.copy_def.runAction(this.back2Action);
                cc.tween(this.copy_def).then(this.back2Action).start();
            }, 3);

            this.scheduleOnce(this.overFunc = () => {
                let self = this;
                this.ori_chan.active = true;
                this.ori_def.active = true;
                let mgr = self.game.plyMgr;
                let loser = win ? mgr.getPlyByPos(to) : mgr.getPlyByPos(from);
                if (loser) {
                    loser.lose();
                }
                this.overAction = cc.sequence(
                    cc.fadeOut(0.1),
                    cc.callFunc(() => {
                        self.animPk.node.active = false;
                        self.node.active = false;
                    })
                );
                // self.nodeBg.runAction(this.overAction);
                cc.tween(self.nodeBg).then(this.overAction).start();
                resolve();
            }, 3.5);
        });
    }

    /**
     * @description 终极PK动画
     * @returns
     * @memberof JHPk
     */
    showFinalPk() {
        if (!this.animFinalPk) return;
        return new Promise(resolve => {
            this.nodeBg.active = true;
            this.animPk.node.active = false;
            this.animFinalPk.node.active = true;
            this.animFinalPk.node.opacity = 255;
            this.nodePlayers.active = false;
            this.animLosePk.node.active = false;
            this.node.active = true;
            this.nodeBg.opacity = 0;
            // this.nodeBg.runAction(cc.fadeTo(0.1, 127));
            cc.tween(this.nodeBg).to(0.1, { opacity: 127 }).start();
            this.animFinalPk.play();
            this.game.adoMgr.playPk();
            this.animFinalPk.on("stop", () => {
                this.nodeBg.active = false;
                this.node.active = false;
                resolve();
            });
        })
    }
}
