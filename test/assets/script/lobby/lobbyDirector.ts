import g from "../g";
import LobbyDirBtn from "./LobbyDirBtn";

const { ccclass, property } = cc._decorator;
@ccclass
export default class LobbyDirector extends cc.Component {

    @property(cc.Prefab)
    lbtnPre: cc.Prefab = undefined;

    @property(cc.Node)
    content: cc.Node = undefined;

    @property(cc.Node)
    gamesNode: cc.Node = undefined;
    private gamelist: { gid: string, idx: number, active: number, show: number }[];

    start() {
        let typeList = g.hallVal.gameCates;
        this.gamelist = g.hallVal.saveGameList;
        for (let i = 0; i < typeList.length; i++) {
            if (typeList[i].active) {
                let item = cc.instantiate(this.lbtnPre);
                this.content.addChild(item);
                item.getComponent(LobbyDirBtn).init(this, typeList[i]);
            }
        }
    }

    getShow(gid: string) {
        for (let i = 0; i < this.gamelist.length; i++) {
            if (this.gamelist[i].gid == gid) {
                return this.gamelist[i].show;
            }
        }
    }

    onToggleClick(type: number, arr: string[]) {
        this.showAllGames(false);
        for (let i = 0; i < arr.length; i++) {
            let child = this.gamesNode.getChildByName(arr[i]);
            let isshow = this.getShow(arr[i]);
            if (child && isshow) {
                child.active = true;
            }
        }
    }

    /**
     * 显示或隐藏所有游戏icon
     * @param bool
     */
    showAllGames(bool: boolean) {
        for (let i = 0; i < this.gamesNode.childrenCount; i++) {
            this.gamesNode.children[i].active = bool;
            if (this.gamesNode.children[i].childrenCount < 1) {
                this.gamesNode.children[i].active = false;
            }
        }
    }
}
