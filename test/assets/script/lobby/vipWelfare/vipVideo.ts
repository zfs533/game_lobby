const { ccclass, property } = cc._decorator;

@ccclass
export default class VipVideo extends cc.Component {
    @property(cc.Prefab)
    preGunRes: cc.Prefab[] = [];

    @property(cc.Sprite)
    spGun: cc.Sprite = undefined;

    @property(cc.Sprite)
    spGunFire: cc.Sprite = undefined;

    @property(cc.Sprite)
    spBullets: cc.Sprite[] = [];

    @property(cc.Sprite)
    spFishNets: cc.Sprite[] = [];

    @property(cc.Animation)
    aniByVideo: cc.Animation = undefined;

    public changeGun(level: number) {
        let paoNode
        if (level < 8) {
            paoNode = cc.instantiate(this.preGunRes[level]);
        } else if (level === 8) {
            paoNode = cc.instantiate(this.preGunRes[7]);
        } else if (level < 11) {
            paoNode = cc.instantiate(this.preGunRes[8]);
        } else if (level < 13) {
            paoNode = cc.instantiate(this.preGunRes[9]);
        } else if (level < 15) {
            paoNode = cc.instantiate(this.preGunRes[10]);
        } else {
            paoNode = cc.instantiate(this.preGunRes[11]);
        }

        this.spGun.spriteFrame = paoNode.getChildByName("gun").getComponent(cc.Sprite).spriteFrame;
        this.spGunFire.spriteFrame = paoNode.getChildByName("flame").getComponent(cc.Sprite).spriteFrame;
        for (let i = 0; i < 11; i++) {
            this.spBullets[i].spriteFrame = paoNode.getChildByName("bullet").getComponent(cc.Sprite).spriteFrame;
            this.spFishNets[i].spriteFrame = paoNode.getChildByName("net").getComponent(cc.Sprite).spriteFrame;
        }
    }

    playByAnimation() {
        this.aniByVideo.play();
    }

    stopByAnimation() {
        this.aniByVideo.stop();
    }

    onDestroy() {
        cc.director.getScheduler().unscheduleAllForTarget(this);
        cc.director.getActionManager().removeAllActionsFromTarget(this.node, true);
    }
}
