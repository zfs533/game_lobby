import DFDCCOLORPOOL from "./dfdccolorPool";
import DFDCAudio from "./dfdcAudio";
import User from "../common/user";

const { ccclass, property } = cc._decorator;

@ccclass
export default class dfdcAmbienceEffect extends cc.Component {

    @property(cc.Node)
    jiangchi: cc.Node = undefined;

    @property(cc.Animation)
    goldLight: cc.Animation = undefined;

    @property(cc.Animation)
    goldLightBg: cc.Animation = undefined;

    @property(cc.Animation)
    yanhua: cc.Animation = undefined;

    @property([cc.Node])
    jiangPool: cc.Node[] = [];

    @property(cc.Label)
    effectNickNameLabel: cc.Label = undefined;

    @property(cc.Label)
    winMoneyLabel: cc.Label = undefined;

    @property(DFDCCOLORPOOL)
    colorPool: DFDCCOLORPOOL = undefined;

    @property(DFDCAudio)
    audioMgr: DFDCAudio = undefined;

    //昵称在奖牌下面的相对位置
    private effectNicKNameloc: cc.Vec2 = new cc.Vec2(-22, 332);
    //等待播放的效果列表
    private msgArray: ps.Dfdc_JackPotWinner[] = [];
    //是否有效果正在播放中
    private isPlaying = false;
    //中奖特效播放时间数组
    private playTimeArray = [7, 7, 10, 10];
    private needYanHua = [false, false, true, true];

    onLoad() {
        //cc.log("环境特效加载")
        this.msgArray = [];
        this.node.on('recAmEffectMsg', this.recMsg, this);
        this.isPlaying = false;
    }

    onDestroy() {
        this.node.off('recAmEffectMsg', this.recMsg, this);
    }

    pushMsg(msg: ps.Dfdc_JackPotWinner) {
        if (msg) {
            this.msgArray.push(msg);
            this.node.emit('recAmEffectMsg');
        }
    }

    private async recMsg() {
        if (!this.isPlaying && this.msgArray.length > 0) {
            let msgInfo = this.msgArray[0];
            this.msgArray.shift();

            //根据奖项的内容设定中奖玩家信息，并播放特效
            await this.play(msgInfo);
            this.recMsg();
        }
    }

    private async play(msgInfo: ps.Dfdc_JackPotWinner) {
        return new Promise(async resolve => {
            let effectIdx = msgInfo.winEggIcon;
            if (effectIdx < 0 || effectIdx >= this.jiangPool.length) {
                resolve();
                return;
            }

            if (msgInfo.name == User.nick) {
                // cc.log("自己收到了自己中奖的信息不处理");
                resolve();
                return;
            }

            this.isPlaying = true;
            //初始化中奖玩家的名字
            // this.effectNickNameLabel.string = msgInfo.name;
            if (msgInfo.location && msgInfo.location.length > 0) {
                this.effectNickNameLabel.string = msgInfo.location + "用户";
            } else {
                this.effectNickNameLabel.string = msgInfo.name;
            }
            this.winMoneyLabel.string = msgInfo.eggWinMoney;



            //播放刷屏特效
            this.playScrashAni();

            await this.playJiangchiAni(effectIdx);

            this.scheduleOnce(async () => {
                await this.resetJiangchi(effectIdx, msgInfo);
                await this.endAniGap();
                resolve();
            }, this.playTimeArray[effectIdx]);
        });
    }

    playScrashAni() {
        this.goldLight.node.active = false;
        this.goldLightBg.node.active = false;
        this.goldLight.node.active = true;
        this.goldLight.play();
        this.goldLightBg.node.active = true;
        this.goldLightBg.play();
    }

    async playJiangchiAni(effectIdx: number) {
        return new Promise(resolve => {
            this.scheduleOnce(() => {
                this.jiangchi.active = false;
                this.jiangPool[effectIdx].active = true;
                //this.jiangPool[effectIdx].getComponent(cc.Animation).play();
                this.effectNickNameLabel.node.active = true;
                this.winMoneyLabel.node.active = true;
                this.audioMgr.playClap();
                if (this.needYanHua[effectIdx]) {
                    this.yanhua.node.active = true;
                    this.yanhua.play();
                }
                resolve();
            }, 2);
        });

    }

    async resetJiangchi(effectIdx: number, msgInfo: ps.Dfdc_JackPotWinner) {
        return new Promise(resolve => {
            this.playScrashAni();

            this.scheduleOnce(() => {
                this.yanhua.node.active = false;
                this.jiangPool[effectIdx].active = false;
                this.effectNickNameLabel.node.active = false;
                this.winMoneyLabel.node.active = false;
                this.jiangchi.active = true;
                this.isPlaying = false;
                if (msgInfo.hasOwnProperty("initEggMoney") && msgInfo.initEggMoney != undefined
                    && msgInfo.initEggMoney != null && msgInfo.initEggMoney.length > 0) {
                    this.colorPool.setColorPoolScore(effectIdx, msgInfo.initEggMoney);
                }
                resolve();
            }, 2);
        });

    }

    async endAniGap() {
        return new Promise(resolve => {
            this.scheduleOnce(() => {
                resolve();
            }, 1);
        });

    }

}
