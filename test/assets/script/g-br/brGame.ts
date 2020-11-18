import { randf, setInteractable } from "../common/util";
import { GameId } from "../common/enum";
import { SCENE_NAME } from "../common/cfg";
import g from "../g";

let Decimal = window.Decimal;
const { ccclass, property } = cc._decorator
@ccclass
export default class BRgame extends cc.Component {
    @property({ type: [cc.Button], tooltip: "下注筹码" })
    protected chsBetBtns: cc.Button[] = [];

    @property({ type: [cc.Node], tooltip: "显示已选中筹码" })
    protected lightBets: cc.Node[] = [];

    @property({ type: [cc.Node], tooltip: "下注区域" })
    protected chsBetAreas: cc.Node[] = [];

    @property({ type: [cc.Node], tooltip: "显示已选中区域" })
    public lightAreas: cc.Node[] = []

    @property({ type: [cc.Node], tooltip: "显示胜利区域" })
    protected winAreas: cc.Node[] = [];

    @property({ type: [cc.Prefab], tooltip: "筹码预制" })
    private preChip: cc.Prefab[] = [];

    @property({ type: cc.Node, tooltip: "筹码父节点" })
    private nChip: cc.Node = undefined;

    @property({ type: cc.Node, tooltip: "等待下一局提示" })
    private waitTips: cc.Node = undefined;

    @property({ tooltip: "区域允许的最大筹码数" })
    private maxAreaCnt: number = 10;

    @property({ tooltip: "筹码大小" })
    private chipScale: number = 0.8;

    // 筹码显示点数
    private _chipPoints: string[] = [];
    get chipPoints() {
        return this._chipPoints;
    }

    getChipindex(index: string) {
        for (let i = 0; i < this._chipPoints.length; i++) {
            if (this._chipPoints[i] == index) {
                return i;
            }
        }
    }
    getWaitTipsActive(): boolean {
        return !this.waitTips.active;
    }
    // 筹码对象池
    protected chipPools: cc.NodePool[] = [];

    clickBetLsr: (idx: number) => boolean;
    clickAreaLsr: (aIdx: number) => boolean;

    protected offy: number = 0;    //筹码按钮的初始y值
    setChipPoint(cps: string[]) {
        this._chipPoints = cps;
        for (let idx = 0; idx < this.chsBetBtns.length; idx++) {
            const btn = this.chsBetBtns[idx];
            btn.node.active = false;
            if (idx < this.chipPoints.length) {
                btn.node.active = true;
                let lab = btn.node.getComponentInChildren(cc.Label);
                lab.string = this.chipPoints[idx].toString();
                let handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = cc.js.getClassName(this);
                handler.handler = "onClickBet";
                handler.customEventData = idx.toString();
                btn.clickEvents.push(handler);
            }
        }
        for (let idx = 0; idx < this.chsBetAreas.length; idx++) {
            const node = this.chsBetAreas[idx];
            let btn = node.getComponent(cc.Button);
            let handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = cc.js.getClassName(this);
            handler.handler = "onClickArea";
            handler.customEventData = idx.toString();
            btn.clickEvents.push(handler);
        }
        for (let i = 0; i < this.chipPoints.length; i++) {
            let pool = new cc.NodePool();
            this.chipPools.push(pool);
        }
        this.offy = this.chsBetBtns[0].node.position.y;
    }

    setClickAreasEanble(_show: boolean) {
        for (let i = 0; i < 3; i++) {
            let area_node = this.chsBetAreas[i];
            let area_btn = area_node.getComponent(cc.Button);
            area_btn.interactable = _show;
        }
    }

    protected onClickBet(ev: cc.Event.EventTouch, idx: string) {
        // 不能点击
        let btnIdx = +idx;
        let btn = this.chsBetBtns[+idx];
        if (!btn.interactable) return;

        if (!this.clickBetLsr) return
        let suc = this.clickBetLsr(+idx);
        if (!suc) return;

        this.setBetLight(btnIdx);
    };

    setEnabled(index: number, IsShow: boolean) {
        let btn = this.chsBetBtns[index];
        btn.node.opacity = 150;
        btn.interactable = IsShow;
    }

    protected onClickArea(ev: cc.Event.EventTouch, idx: string) {
        if (!this.clickAreaLsr) return
        let suc = this.clickAreaLsr(+idx);
        if (!suc) return;
        //飞禽走兽下注筹码改为收到自己下注后才做动画
        if (cc.director.getScene().name === SCENE_NAME[GameId.FQZS]) return;
        let areaIdx = +idx;
        this.lightAreas[areaIdx].active = false;
        this.scheduleOnce(() => {
            this.lightAreas[areaIdx].active = true;
        }, 0.05);
    };

    showHideChooseLight(inx: string, show: boolean) {
        let areaIdx = +inx;
        this.lightAreas[areaIdx].active = !!show;
    }

    //显示等待下局
    setWaitTips(show: boolean) {
        this.waitTips.active = show;
    }

    /**
     * 挑选自己可选择的筹码
     */
    setAllowBet(allowNum: number) {
        for (let idx = 0; idx < this.chsBetBtns.length; idx++) {
            let btn = this.chsBetBtns[idx];
            btn.node.opacity = idx < allowNum ? 255 : 150;
            let visible = idx < allowNum ? true : false;
            setInteractable(btn, visible);
        }
    }

    /**
     * 隐藏区域显示
     */
    hideArea() {
        this.lightAreas.forEach(light => {
            light.active = false;
        });
        this.winAreas.forEach(area => {
            area.stopAllActions();
            area.active = false;
        });
    }

    /**
     * 隐藏所有筹码按钮
     */
    hideBet() {
        for (let idx = 0; idx < this.chsBetBtns.length; idx++) {
            let btn = this.chsBetBtns[idx];
            btn.node.opacity = 150;
            setInteractable(btn, false);
        }
        this.setBetLight(-1);
    }

    /**
    * 设置筹码按钮选中效果
    * @param betIdx
    */
    setBetLight(betIdx: number) {
        for (let idx = 0; idx < this.lightBets.length; idx++) {
            let sprite = this.lightBets[idx];
            if (idx === betIdx) {
                sprite.active = true;
                this.chsBetBtns[idx].node.y = this.offy + 9;
            } else {
                sprite.active = false;
                this.chsBetBtns[idx].node.y = this.offy;
            }
        }
    }

    /**
     * 设置胜利区域的特效
     * @param areaIdx
     */
    setAreaEff(areaIdx: number) {
        let area = this.winAreas[areaIdx];
        area.active = true;
        if (g.gameVal.lastGame == GameId.BCBM) {
            let anim = this.winAreas[areaIdx].getChildByName("bc_ef_zhongjiang2").getComponent(cc.Animation);
            anim.play();
            setTimeout(() => {
                anim.stop();
            }, 1000);
            return;
        }
        area.stopAllActions();

        let binkTime = 0.3;
        let actions = cc.repeatForever(cc.sequence(
            cc.fadeTo(binkTime, 255),
            cc.fadeTo(binkTime, 0),
            cc.fadeTo(binkTime, 255),
        ))
        //area.runAction(actions);
        cc.tween(area).then(actions).start();
    }
    async setAreaEffArr(areaIdxArr: Array<number>) {
        let promiseArr = []
        for (let i = 0; i < areaIdxArr.length; i++) {
            if (g.gameVal.lastGame == GameId.FQZS) {
                let areaIdx = areaIdxArr[i];
                let area = this.winAreas[areaIdx];
                area.active = true;
                let anim = area.getComponent(cc.Animation);
                let animState = anim.play();
                animState.wrapMode = cc.WrapMode.Loop;
                animState.repeatCount = 2;

                // setTimeout(() => {
                //     anim.stop();
                // }, 1000);
                continue;
            }

            let promise = new Promise((reslove) => {
                let areaIdx = areaIdxArr[i];
                let area = this.winAreas[areaIdx];
                area.active = true;
                area.stopAllActions();

                let binkTime = 0.3;
                let actions = cc.sequence(
                    cc.fadeTo(binkTime, 255),
                    cc.fadeTo(binkTime, 0),
                    cc.fadeTo(binkTime, 255),
                    cc.fadeTo(binkTime, 0),
                    cc.fadeTo(binkTime, 255),
                    cc.fadeTo(binkTime, 0),
                    cc.fadeTo(binkTime, 0),
                    cc.fadeTo(binkTime, 255),
                    cc.fadeTo(binkTime, 0),
                    cc.callFunc(() => {
                        reslove()
                    })
                )
                area.runAction(actions);
                //cc.tween(area).then(actions).start();
            })
            promiseArr.push(promise)
        }
        return Promise.all(promiseArr);
    }
    /**
     * 设置该区域所有的筹码
     */
    setAreaMoney(areaIdx: number, money: number) {
        if (areaIdx < 0) {
            cc.error("setAreaMoney areaIdx error ", areaIdx);
            return
        }
        if (money < 0) {
            cc.error("setAreaMoney money error ");
            return
        }
        let chips = this.getFlyChip(money);
        if (chips) {
            chips.forEach(chip => {
                chip.name = areaIdx.toString();
                chip.setPosition(this.getAreaRandomPos(areaIdx));
            });
        }
    }

    /**
     * 每个下注区域单独控制
     */
    cleanBCBMChip() {
        let areMax = this.maxAreaCnt / 8;
        let list = [[], [], [], [], [], [], [], []];
        for (let i = 0; i < this.nChip.childrenCount; i++) {
            let index: number = Number(this.nChip.children[i].name);
            if (index >= 0 && index < list.length) {
                list[index].push(this.nChip.children[i]);
            }
        }
        list.forEach(item => {
            if (item.length > areMax) {
                let len = item.length * 0.3;
                for (let j = 0; j < len; j++) {
                    let actions = cc.sequence(
                        cc.fadeTo(0.5, 0),
                        cc.callFunc(() => {
                            this.recycleChip(item[j]);
                        })
                    )
                    // item[j].runAction(actions);
                    cc.tween(item[j]).then(actions).start();
                }
            }
        });
    }

    /**
     * 清除多余的筹码
     */
    cleanSurplusChip() {
        let chipLength = this.nChip.childrenCount;
        if (g.gameVal.lastGame == GameId.BCBM || g.gameVal.lastGame == GameId.FQZS) {
            this.cleanBCBMChip();
            return;
        }
        if (chipLength > this.maxAreaCnt) {
            let recycleCount = Math.floor(chipLength * 0.3);
            for (let idx = 0; idx < chipLength; idx++) {
                const chip = this.nChip.children[idx];
                if (idx < recycleCount) {
                    let actions = cc.sequence(
                        cc.fadeTo(0.5, 0),
                        cc.callFunc(() => {
                            this.recycleChip(chip);
                        })
                    )
                    //chip.runAction(actions)
                    cc.tween(chip).then(actions).start();
                }
            }
        }
    }

    cleanUpChip() {
        this.nChip.children.forEach(chip => this.recycleChip(chip));
        for (let i = 0; i < this.nChip.childrenCount; i++) {
            this.nChip.children[i].opacity = 0;
        }

    }

    /**
     * 筹码从下注区飞向赢钱玩家
     * @param areaIdx
     * @param playerPos
     * @param money
     */
    chipFlyPly(areaIdx: number, playerPos: cc.Vec2, money?: number) {
        let chips = this.getFlyPlyChips(areaIdx, money);
        playerPos = this.nChip.convertToNodeSpaceAR(playerPos);
        return new Promise(resolve => {
            if (chips === undefined) resolve();
            let moveTime = 0.8;
            for (let idx = 0; idx < chips.length; idx++) {
                let chip = chips[idx];
                if (idx > this.maxAreaCnt * 0.5) {
                    this.recycleChip(chip);
                } else {
                    if (money)
                        chip.setPosition(this.getAreaRandomPos(areaIdx));

                    let oldScale = chip.scale;
                    chip.stopAllActions();
                    let actions = cc.sequence(
                        cc.delayTime(0.02 * idx),
                        cc.scaleTo(0.05, oldScale * 1.5),
                        cc.spawn(cc.moveTo(moveTime, playerPos).easing(cc.easeBackIn()), cc.scaleTo(moveTime, oldScale), cc.fadeTo(moveTime, 200)),
                        cc.callFunc(() => {
                            this.recycleChip(chip);
                            if (idx === chips.length - 1) {
                                resolve();
                            }
                        })
                    )
                    //chip.runAction(actions);
                    cc.tween(chip).then(actions).start();
                }
            }
            resolve();
        })
    }

    chipFlyPlyOther(areaIdx: number, playerPos: cc.Vec2 | cc.Vec3, money?: number) {
        let chips = this.getFlyPlyChips(areaIdx, money);
        //playerPos = this.nChip.convertToNodeSpaceAR(playerPos);
        return new Promise(resolve => {
            if (chips === undefined) resolve();
            let moveTime = 0.8;
            for (let idx = 0; idx < chips.length; idx++) {
                let chip = chips[idx];
                if (idx > this.maxAreaCnt * 0.5) {
                    this.recycleChip(chip);
                } else {
                    if (money)
                        chip.setPosition(this.getAreaRandomPos(areaIdx));

                    let oldScale = chip.scale;
                    chip.stopAllActions();
                    let actions = cc.sequence(
                        cc.delayTime(0.02 * idx),
                        cc.scaleTo(0.05, oldScale * 1.5),
                        cc.spawn(cc.moveTo(moveTime, playerPos).easing(cc.easeBackIn()), cc.scaleTo(moveTime, oldScale), cc.fadeTo(moveTime, 200)),
                        cc.callFunc(() => {
                            this.recycleChip(chip);
                            if (idx === chips.length - 1) {
                                resolve();
                            }
                        })
                    )
                    //chip.runAction(actions);
                    cc.tween(chip).then(actions).start();
                }
            }
            resolve();
        })
    }
    private getFlyPlyChips(areaIdx: number, money?: number) {
        if (areaIdx < 0) {
            cc.error("chipFlyPly areaIdx error ", areaIdx);
            return undefined;
        }
        if (money <= 0) {
            cc.error("chipFlyPly money error ");
            return undefined;
        }

        let chips: cc.Node[] = [];
        if (money) {
            chips = this.getFlyChip(money);
        } else {
            chips = this.nChip.children.filter(chip => {
                if (chip.name === areaIdx.toString() || !chip.name) return chip;
            });
            chips.sort((a, b) => { return a.zIndex - b.zIndex });
        }
        if (chips.length === 0) return undefined;
        return chips;
    }

    /**
     * 筹码从玩家飞向下注区
     * @param money
     * @param pos
     * @param areaIdx
     */
    chipFlyArea(areaIdx: number, beginPos: cc.Vec2, money: number, dTime: number = 0) {
        if (areaIdx < 0) {
            cc.error("chipFlyArea areaIdx error ", areaIdx);
            return
        }
        if (money <= 0) {
            cc.error("chipFlyArea money error ");
            return
        }

        let starPos = this.nChip.convertToNodeSpaceAR(beginPos);
        return new Promise(resolve => {
            let chips = this.getFlyChip(money);
            if (chips) {
                let moveTime = 0.5;
                for (let idx = 0; idx < chips.length; idx++) {
                    let chip = chips[idx];
                    chip.name = areaIdx.toString();
                    chip.setPosition(starPos);
                    chip.opacity = 100;
                    let areaPos = this.getAreaRandomPos(areaIdx);
                    let oldScale = chip.scale;
                    let actions = cc.sequence(
                        cc.delayTime(dTime + 0.02 * idx),
                        cc.spawn(cc.moveTo(moveTime, areaPos).easing(cc.easeSineOut()), cc.fadeTo(moveTime, 255), cc.scaleTo(moveTime, oldScale)),
                        cc.callFunc(() => {
                            if (idx === chips.length - 1) {
                                this.cleanSurplusChip();
                                resolve();
                            }
                        })
                    )
                    //chip.runAction(actions);
                    cc.tween(chip).then(actions).start();
                }
            }
        })
    }
    chipFlyAreaOther(areaIdx: number, beginPos: cc.Vec2 | cc.Vec3, money: number, dTime: number = 0) {
        if (areaIdx < 0) {
            cc.error("chipFlyArea areaIdx error ", areaIdx);
            return
        }
        if (money <= 0) {
            cc.error("chipFlyArea money error ");
            return
        }

        let starPos = beginPos;
        return new Promise(resolve => {
            let chips = this.getFlyChip(money);
            if (chips) {
                let moveTime = 0.5;
                for (let idx = 0; idx < chips.length; idx++) {
                    let chip = chips[idx];
                    chip.name = areaIdx.toString();
                    chip.setPosition(starPos);
                    chip.opacity = 100;
                    let areaPos = this.getAreaRandomPos(areaIdx);
                    let oldScale = chip.scale;
                    let actions = cc.sequence(
                        cc.delayTime(dTime + 0.02 * idx),
                        cc.spawn(cc.moveTo(moveTime, areaPos).easing(cc.easeSineOut()), cc.fadeTo(moveTime, 255), cc.scaleTo(moveTime, oldScale)),
                        cc.callFunc(() => {
                            if (idx === chips.length - 1) {
                                this.cleanSurplusChip();
                                resolve();
                            }
                        })
                    )
                    //chip.runAction(actions);
                    if (cc.director.getScene().name === SCENE_NAME[GameId.FQZS]) {
                        actions = cc.sequence(
                            cc.delayTime(dTime + 0.02 * idx),
                            cc.spawn(cc.moveTo(moveTime, areaPos).easing(cc.easeSineOut()), cc.fadeTo(moveTime, 255), cc.scaleTo(moveTime, oldScale)),
                            cc.scaleTo(0.5, 0.5),
                            cc.callFunc(() => {
                                if (idx === chips.length - 1) {
                                    this.cleanSurplusChip();
                                    resolve();
                                }
                            })
                        )

                    }
                    cc.tween(chip).then(actions).start();
                }
            }
        })
    }
    getChipArea(areaIdx: number) {
        return this.nChip.children.filter(chip => {
            if (chip.name === areaIdx.toString() || !chip.name) return chip;
        });
    }

    /**
     * 生成筹码
     */
    getFlyChip(money: number) {
        let baseScore = new Decimal(this.chipPoints[0]);
        let chips: cc.Node[] = [];

        for (let i = this.chipPoints.length - 1; i >= 0; i--) {
            let prefab = this.preChip[i];
            if (!prefab) {
                continue;
            }
            let num = baseScore.mul(this.chipPoints[i])
            if (num.gt(money)) {
                continue;
            }
            let count = Math.floor(new Decimal(money).div(num).toNumber());
            if (count < 1) {
                continue;
            }
            while (count-- > 0) {
                let node = this.chipPools[i].get();
                if (!node) {
                    node = cc.instantiate(prefab);
                }
                node.scale = this.chipScale;
                node.groupIndex = i;
                //node.rotation = randf(-1, 1) * 30;
                node.angle = -randf(-1, 1) * 30;
                chips.push(node);
                this.nChip.addChild(node);
            }
            money = new Decimal(money).mod(num).toNumber();
            if (money === 0) {
                break;
            }
        }
        return chips;
    }

    private recycleChip(c: cc.Node) {
        let tag = c.groupIndex;
        let pool = this.chipPools[tag];
        if (!pool) {
            return;
        }
        c.stopAllActions();
        c.removeFromParent();
        c.opacity = 255;
        c.scale = 0;
        //c.rotation = 0;
        c.angle = 0;
        pool.put(c);
    }

    /**
   * 随机生成区域内筹码坐标
   * @param areaIdx
   */
    private getAreaRandomPos(areaIdx: number): cc.Vec2 {
        let area = this.chsBetAreas[areaIdx];
        if (g.gameVal.lastGame == GameId.BCBM) {
            let index = Math.floor(Math.random() * area.childrenCount);
            area = area.children[index];
        }
        let worldPos = area.convertToWorldSpaceAR(cc.v2(0, 0));
        let chipPos = this.nChip.convertToNodeSpaceAR(worldPos);
        let areaSize = area.getContentSize();
        let areaX = chipPos.x;
        let areaY = chipPos.y;
        let x = randf(-1, 1) * areaSize.width * 0.38 + areaX;
        let y = randf(-1, 1) * areaSize.height * 0.24 + areaY;
        if (g.gameVal.lastGame == GameId.FQZS) {
            y = randf(-1, 1) * areaSize.height * 0.22 + areaY + 2;
        }
        return cc.v2(x, y);
    }
}