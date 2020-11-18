import { parseLocation, getActorFrameScale } from "../common/util";
import { getAvatar, getAvatarFrame } from "../common/ui";
import { GameId } from "../common/enum";
import { SCENE_NAME } from "../common/cfg";

const { ccclass, property } = cc._decorator
@ccclass
export default class BRplayers extends cc.Component {
    @property(cc.Node)
    private oSvContent: cc.Node = undefined;

    @property(cc.Node)
    private oSvItem: cc.Node = undefined;

    @property([cc.SpriteFrame])
    private sfBg: cc.SpriteFrame[] = [];

    private _showDs: boolean = false;

    get active() {
        return this.node.active;
    }

    set showDs(show: boolean) {
        this._showDs = show;
    }

    show(people: gameIface.brPlayerInfo[]) {
        this.node.active = true;
        this.openAnim();
        this.oSvItem.active = false;
        if (people.length < 1) return;
        people.sort((a, b) => {
            return b.winCnt - a.winCnt;
        })
        let dsPlayerInfo;
        if (this._showDs) {
            // 将赌神从排列中移除
            let dsPos = people[0].pos;
            for (let idx = 0; idx < people.length; idx++) {
                let info = people[idx]
                if (info.pos === dsPos) {
                    dsPlayerInfo = info;
                    people.splice(idx, 1);
                    break;
                }
            }
        }
        people.sort((a, b) => {
            return +b.totalBets - +a.totalBets;
        })
        if (this._showDs) {
            people.unshift(dsPlayerInfo);
        }

        let tempList = [];
        for (let idx = 0; idx < people.length; idx++) {
            let playInfo = people[idx];
            if (cc.director.getScene().name === SCENE_NAME[GameId.FQZS]) {
                if (playInfo.totalBets == undefined)
                    playInfo.totalBets = '0';
                if (playInfo.winCnt == undefined)
                    playInfo.winCnt = 0;
            }
            if (playInfo.totalBets !== undefined && playInfo.winCnt !== undefined) {
                tempList.push(playInfo);
            }
        }
        people = tempList;
        for (let idx = 0; idx < people.length; idx++) {
            let playInfo = people[idx];
            let item;
            if (idx < this.oSvContent.childrenCount - 1) {
                item = this.oSvContent.children[idx];
            } else {
                item = cc.instantiate(this.oSvItem);
                this.oSvContent.addChild(item);
            }
            item.active = true;

            let bg = item.getComponent(cc.Sprite);
            let logo1 = item.getChildByName("logo1");
            let logo2 = item.getChildByName("logo2");
            let sort1 = logo2.getComponentInChildren(cc.Label);
            let logo3 = item.getChildByName("logo3");
            let sort2 = logo3.getComponentInChildren(cc.Label);

            let head = item.getChildByName("def1").getComponent(cc.Sprite);
            let vipLevel = item.getChildByName("vip").getChildByName("level").getComponent(cc.Label);
            let headFrame = item.getChildByName("def1").getChildByName("def").getComponent(cc.Sprite);
            let loc = item.getChildByName("loc").getComponent(cc.Label);
            let money = item.getChildByName("bg").getComponentInChildren(cc.Label);
            let bet = item.getChildByName("bet").getComponent(cc.Label);
            let winNum = item.getChildByName("win").getComponent(cc.Label);
            if (this._showDs) {
                if (idx === 0) {
                    logo1.active = true;
                    logo2.active = false;
                    logo3.active = false;
                } else if (idx < 9) {
                    logo1.active = false;
                    logo2.active = true;
                    logo3.active = false;
                    sort1.string = idx.toString();
                } else {
                    logo1.active = false;
                    logo2.active = false;
                    logo3.active = true;
                    sort2.string = idx.toString();
                }
            } else {
                logo1.active = false;
                if (idx < 8) {
                    logo2.active = true;
                    logo3.active = false;
                    sort1.string = (idx + 1).toString();
                } else {
                    logo2.active = false;
                    logo3.active = true;
                    sort2.string = (idx + 1).toString();
                }
            }
            bg.spriteFrame = this.sfBg[idx % 2];
            head.spriteFrame = getAvatar(!!playInfo.gender, playInfo.avatar);
            if (playInfo.avatarFrame) {
                getAvatarFrame(playInfo.avatarFrame, headFrame)
                headFrame.node.scale *= getActorFrameScale(playInfo.avatarFrame)
            }
            vipLevel.string = playInfo.vipLevel.toString();
            loc.string = parseLocation(playInfo.location) ? parseLocation(playInfo.location) : "--";
            money.string = playInfo.money;
            if (playInfo.totalBets !== undefined && playInfo.winCnt !== undefined) {
                bet.string = playInfo.totalBets.toString();
                winNum.string = playInfo.winCnt.toString();
            } else {
                bet.string = "0";
                winNum.string = "0";
            }

            if (people.length < this.oSvContent.childrenCount) {
                for (let idx = people.length; idx < this.oSvContent.childrenCount; idx++) {
                    let item = this.oSvContent.children[idx];
                    item.active = false;
                }
            }
        }
    }
    hide() {
        this.closeAction();
    }
    openAnim(cb?: Function) {
        let node = this.node.getChildByName("panel");
        node.active = true;
        node.position = cc.v3()
        let animTime = 0.3;
        let actions = cc.sequence(
            cc.scaleTo(animTime, 1, 1).easing(cc.easeBackOut()),
            cc.callFunc(() => {
            }),
        )
        // node.runAction(actions)
        cc.tween(node).then(actions).start();
    }


    closeAction(cb?: Function) {
        let node = this.node.getChildByName("panel");
        let animTime = 0.3;
        let actions = cc.sequence(
            cc.scaleTo(animTime, 0).easing(cc.easeBackIn()),
            cc.callFunc(() => {
                this.node.active = false;
            }))
        // node.runAction(actions)
        cc.tween(node).then(actions).start();
    }
}