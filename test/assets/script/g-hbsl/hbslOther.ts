import { parseLocation } from "../common/util";
import { getAvatar, getAvatarFrame } from "../common/ui"
import { Gender } from "../common/enum";
import HbslGame from "./hbslGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HbslOther extends cc.Component {
    @property(cc.Node)
    private oSvContent: cc.Node = undefined;

    @property(cc.Node)
    private oSvItem: cc.Node = undefined;

    @property([cc.SpriteFrame])
    private sfBg: cc.SpriteFrame[] = [];

    private game: HbslGame;

    setGame(game: HbslGame) {
        this.game = game;
    }
    show() {
        this.node.active = true;
        this.oSvItem.active = false;

        let people = this.game.plyMgr.getAllPlayerInfo().concat();
        // cc.log("qhbOther show() people", people);
        if (!people || people.length === 0) return;

        people.sort((a, b) => {
            return b.noBoomCnt - a.noBoomCnt;
        })

        let dsPos = people[0].pos;
        let dsPlayerInfo;
        for (let idx = 0; idx < people.length; idx++) {
            let info = people[idx];
            if (info.pos === dsPos) {
                dsPlayerInfo = info;
                people.splice(idx, 1);
                break;
            }
        }
        people.sort((a, b) => {
            return +b.totalSendMoney - +a.totalSendMoney;
        })
        people.unshift(dsPlayerInfo);
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
            let sort1 = logo2.getChildByName("sort").getComponent(cc.Label);
            let logo3 = item.getChildByName("logo3");
            let sort2 = logo3.getComponentInChildren(cc.Label);
            let head = item.getChildByName("def1").getComponent(cc.Sprite);
            let headFrame = item.getChildByName("def1").getChildByName("def").getComponent(cc.Sprite);
            let vipLevel = item.getChildByName("vip").getChildByName("level").getComponent(cc.Label);
            let loc = item.getChildByName("loc").getComponent(cc.Label);
            let money = item.getChildByName("bg").getComponentInChildren(cc.Label);
            let bet = item.getChildByName("bet").getComponent(cc.Label);
            let winNum = item.getChildByName("win").getComponent(cc.Label);
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
            if (idx < 2) {
                bg.spriteFrame = this.sfBg[0];
            } else {
                bg.spriteFrame = this.sfBg[1];
            }
            head.spriteFrame = getAvatar((playInfo.gender === Gender.MALE), playInfo.avatar);
            if (playInfo.avatarFrame) {
                getAvatarFrame(playInfo.avatarFrame, headFrame);
            }
            vipLevel.string = playInfo.vipLevel;
            loc.string = parseLocation(playInfo.location) ? parseLocation(playInfo.location) : "--";
            money.string = playInfo.money;
            bet.string = playInfo.totalSendMoney ? playInfo.totalSendMoney.toString() : "0"
            winNum.string = playInfo.noBoomCnt  ? playInfo.noBoomCnt.toString() : "0"
        }

        if (people.length < this.oSvContent.childrenCount) {
            for (let idx = people.length; idx < this.oSvContent.childrenCount; idx++) {
                let item = this.oSvContent.children[idx];
                item.active = false;
            }
        }
    }

    hide() {
        this.node.active = false;
    }
}
