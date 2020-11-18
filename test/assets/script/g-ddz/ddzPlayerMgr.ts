import PlyMgr from "../g-dp/dpPlayerMgr";

const { ccclass, property } = cc._decorator
@ccclass
export default class DdzPlayerMgr extends PlyMgr {
    turnAddMul(leftTime: number) {
        this.players.forEach(player => {
            if (!player.addMul && !player.isDealer) {
                player.setWaitTime(leftTime);
            }
        });
    }

    endJiaoFen () {
        this.players.forEach(player => {
            player.hideAllStatus();
        });
    }
}
