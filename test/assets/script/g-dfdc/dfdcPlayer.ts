import DFDCGame from "./dfdcGame";
import TurningPlayer from "../g-share/turningPlayer";
const Decimal = window.Decimal;
const { ccclass, property } = cc._decorator;



@ccclass
export default class DFDCPlayer extends TurningPlayer {
    changeState(): void { }
    noticeTurnOver(): void { }

    @property(cc.Label)
    Playergold: cc.Label = undefined;

    @property(cc.Label)
    lblWinGold: cc.Label = undefined;

    @property(cc.Node)
    ndWinEffect3: cc.Node = undefined;

    @property(cc.Node)
    ndWinEffect4: cc.Node = undefined;

    @property(cc.Node)
    firewSpe: cc.Node = undefined;

    @property(cc.Prefab)
    fireworks: cc.Prefab = undefined;

    @property(cc.Label)
    lalCobet: cc.Label = undefined;

    @property(cc.Sprite)
    lalGearPos: cc.Sprite = undefined;

    @property(cc.Sprite)
    lalMulitiple: cc.Sprite = undefined;

    @property([cc.SpriteFrame])
    private MultipleBg: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    private gearPosBg: cc.SpriteFrame[] = [];

    @property([cc.Prefab])
    private preBGWEffect: cc.Prefab[] = [];

    @property(cc.Node)
    panBGWEffect: cc.Node = undefined;

    private effect: cc.Node = undefined;

    private geshu = 5;
    game: DFDCGame;
    public isRatio: boolean = false;

    /**
   * 快速停止状态
   */
    public isQuickStop: boolean = false;
    private firew: cc.NodePool = undefined;     // 烟花池

    onLoad() {

    }

    get isLooker() {
        return false;
    }

    public goldUpdate() {
        return this.money;
    }

    //总押注
    public changeBetsScore(bets: string) {
        //cc.log("<<<<<<<<总押注", bets);
        this.lalCobet.string = bets;
    }
    //倍数
    public mulitipleScore(bets: string) {

        for (let index = 0; index < this.game.multiple_list.length; index++) {
            if (this.game.multiple_list[index].toString() === bets) {
                this.lalMulitiple.spriteFrame = this.MultipleBg[index];
                break;
            }
        }

    }

    //档位
    public gearPosScore(bets: string) {
        for (let index = 0; index < this.game.gearPos_List.length; index++) {
            if (this.game.gearPos_List[index].toString() === bets) {
                this.lalGearPos.spriteFrame = this.gearPosBg[index];
                break;
            }
        }
    }

    public showWinEffect(index: number) {
        // this.ndWinEffect1.active = show;c
        //cc.log("<<<<<<<<<<<特效  ", this.preBGWEffect[index].name);
        this.effect = this.game.instObj(this.preBGWEffect[index], this.panBGWEffect)
        this.effect.active = true;
        this.effect.position = cc.v3(0, 0);
        this.unschedule(this.showWinEffectPlay);
        this.schedule(this.showWinEffectPlay, 2);
    }

    public hideWinEffect() {
        for (let index = 0; index < this.panBGWEffect.childrenCount; index++) {
            this.effect.active = false;
            this.effect.children[index].getComponent(cc.ParticleSystem).stopSystem();
        }
        this.unschedule(this.showWinEffectPlay);
    }

    showWinEffectPlay() {

        for (let index = 0; index < this.effect.childrenCount; index++) {
            this.effect.children[index].getComponent(cc.ParticleSystem).resetSystem();
        }
    }


    public showWinEffect2(show: boolean) {
        // this.ndWinEffect2.active = show;
    }

    public showWinEffect3(show: boolean) {
        this.ndWinEffect3.active = show;
    }
    public showWinEffect4(show: boolean) {
        let shijian = 1;

        if (show) {
            this.jishiq = 0;
            this.firewSpe.active = true;
            this.schedule(this.Fireworksplay, shijian);
        } else {
            this.firewSpe.active = false;
            this.unschedule(this.Fireworksplay);
            this.recoverAllCoins();
        }
        this.ndWinEffect4.active = show;
    }
    private jishiq = 0;

    private Fireworksplay() {
        this.geshu = Math.floor(Math.random() * 5 + 1);
        for (let i = 0; i < this.geshu; i++) {
            let coin = this.getBetCoin();
            if (!coin) {
                return;
            }
            coin.opacity = 255;
            coin.position = cc.v3(this.range());
            coin.getComponent(cc.Animation).play();
        }
        this.jishiq++;
        if (this.jishiq >= 10) {
            this.showWinEffect4(false);
        }
    }

    private range() {
        let xm = 170;
        let xn = -170;
        let ym = 320;
        let yn = -320;
        let ce = xm - xn + 1;
        let ce1 = ym - yn + 1;
        return cc.v2(Math.floor(Math.random() * ce1 + yn), Math.floor(Math.random() * ce + xn));
    }


    //烟花池
    private getBetCoin(): cc.Node {
        let coin: cc.Node;
        if (this.firew.size() > 0) {
            coin = this.firew.get();
        } else {
            coin = cc.instantiate(this.fireworks);
        }
        this.ndWinEffect4.addChild(coin);
        return coin;
    }
    //烟花回收处理
    recoverAllCoins() {
        let coins = this.ndWinEffect4.children;
        for (let index = 0; index < coins.length; index++) {
            let coin = coins[index];
            coin.removeFromParent(true);
            coin.opacity = 255;
            coin.name = "";
            this.firew.put(coin);
        }
        if (this.ndWinEffect4.children.length > 0) {
            this.recoverAllCoins();
        }
    }
    public showWinGold(stop: number) {
        if (stop <= 0 && this.game.curFreeTimes == 0 && this.game.isFree) {
            let verss = this.lblWinGold.string;
            if (Number(verss) > 0) {
                //cc.log("<<<<<<结束免费");
            }
            return;
        } else if (stop <= 0) {
            return;
        }
        // cc.log("<<<<<<<  赢了1111", stop);
        this.scorllWinGold(this.lblWinGold, stop);
    }

    public resetWinGold() {
        if (!this.game.isFree) {
            this.lblWinGold.node.stopAllActions();
            this.lblWinGold.string = "0.00";
        }
        if (this.game.isFree && this.game.curFreeTimes === 8) {
            this.lblWinGold.node.stopAllActions();
            this.lblWinGold.string = "0.00";
        }
    }

    // 金币滚动
    async scorllWinGold(lbl: cc.Label, nStop: number) {
        if (!this.isRatio && !this.isQuickStop) {
            // cc.log("等待金币递增")
            await this.winAdd(lbl, nStop);
            // cc.log("金币递增结束")
            this.game.endGameFastStopBtn();
        }
    }
    //赢分递加
    public winAdd(lbl: cc.Label, nStop: number, ses?: cc.Label, nStops?: number, nCount: number = 100, nInterval: number = 0) {
        return new Promise(resolve => {
            let nStart: number = undefined;
            nStart = +lbl.string;
            let index = 0;
            let diff = nStop + nStart;
            lbl.node.active = true;
            let delay = cc.delayTime(nInterval);
            let isEnd = false;
            let func = cc.callFunc(() => {
                let num = (nStop / this.game.autoTime) / 60;
                index += num;
                let score = nStart + index;
                if (this.game.isGaming) {
                    score = diff;
                    //lbl.node.stopAction(action2);
                    cc.tween(lbl.node).stop()
                }
                if (this.isRatio || this.isQuickStop) {
                    score = diff;
                    //lbl.node.stopAction(action2);
                    cc.tween(lbl.node).stop()
                    lbl.string = diff.toFixed(2).toString();
                    resolve();
                }
                if (score >= (nStop + nStart) && !isEnd) {
                    isEnd = true;
                    lbl.string = diff.toFixed(2).toString();
                    if (ses) {
                        ses.string = "0";
                    }
                    //lbl.node.stopAction(action2);
                    cc.tween(lbl.node).stop()
                    resolve();
                } else if (!isEnd) {
                    lbl.string = score.toFixed(2).toString();
                    if (ses) {
                        let score1 = nStops - index;
                        ses.string = score1.toFixed(2).toString();
                    }
                }
            });
            let action1 = cc.sequence(delay, func);
            let action2 = cc.repeatForever(action1);
            //lbl.node.runAction(action2);
            //cc.log('dcdfplayer-action')
            cc.tween(lbl.node).then(action2).start();
        });
    }
    //刷新赢分信息
    private RefreshWin(nStop: number, isbool: boolean) {
        let self = this;
        setTimeout(function () {
            self.freeDecrement(isbool, nStop);
            //self.showGetAndLost({ get: "+" + nStop });
        }, 800);
    }
    //免费结束后赢分递减，金币递加(或直接刷新)
    private freeDecrement(isbool: boolean, money: number) {
        let principal = parseFloat(this.Playergold.string);
        let Playergold = this.Playergold;
        let lblWinGold = this.lblWinGold;
        if (isbool) {
            let kesey = new Decimal(money).add(principal).toFixed(2);
            if (!this.isRatio && !this.isQuickStop) {
                this.winAdd(Playergold, +kesey, lblWinGold, money);
            }
        } else {
            Playergold.string = new Decimal(money).add(principal).toFixed(2);

        }
    }

    /**
     * 更新下注额，通过specialPlayer来判断是否重复更新
     * @param bets
     * @param specialPlayer
     */
    updateBets(bets: number, balance: number, specialPlayer: boolean = false) {
        if (this.money !== undefined && !specialPlayer) {
            //this.money = add(balance, bets).toNumber();
            //this.updateBalance();
            //this.game.playerMgr.updateBalance(this.serverPos, this.money);
        } else {
            //  this.money = balance;
            // this.updateBalance();
            //this.game.playerMgr.updateBalance(this.serverPos, this.money);
        }
    }






}
