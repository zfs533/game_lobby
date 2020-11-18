
import { EventCenter } from "./EventManager"
import { RoundId, rangeSize, getAnimalLookAt, LookDirection } from "./fqzsConf"
const { ccclass, property } = cc._decorator;

@ccclass
export class FQZSRoundItem extends cc.Component {

    @property(cc.Node)
    chooseState: cc.Node = null;
    @property(sp.Skeleton)
    chooseAni: sp.Skeleton = null;
    @property(cc.Node)
    spNode: cc.Node = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;
    effect_Win: cc.Animation = null;
    private m_inx: number = -1;
    onLoad() {
        this.effect_Win = this.chooseState.getChildByName('Effect_Win').getComponent(cc.Animation);
        this.effect_Win.node.active = false;
        this.effect_Win.on('finished', this.onFinished, this);

        EventCenter.instance.addListener("onChooseIndex", this.onChooseIndexAnimation, this);
        EventCenter.instance.addListener("OnTarget", this.onTarGetChoose, this);
    }
    onDestroy() {
        // this.effect_Win.off('finished', this.onFinished, this);

        EventCenter.instance.removeListener("onChooseIndex", this)
        EventCenter.instance.removeListener("OnTarget", this);
    }

    onFinished() {
        console.log('--------finish')
        this.effect_Win.node.active = false;
    }

    setChooseState(choose: boolean) {
        this.chooseState.active = !!choose;
        this.chooseState.stopAllActions();
        this.chooseState.opacity = 255
    }

    initItem(myIndex: number) {
        if (myIndex >= 0 && myIndex < rangeSize) {
            if (this.nameLabel) this.nameLabel.string = RoundId[myIndex].name + "";
        }
        this.m_inx = myIndex;
        this.chooseState.active = false;
        //this.chooseAni.active = false;
    }
    onChooseIndexAnimation(curIndex: number, isLook: boolean = false) {
        //console.log("收到通知位置==>", curIndex);
        if (this.chooseAni && curIndex === this.m_inx) {
            //this.chooseAni.active = true;
            this.chooseState.active = true;
            this.chooseState.stopAllActions();
            this.chooseState.opacity = 255;
            //cc.tween(this.chooseAni).to(0.5, { opacity: 0 }).start();
            // this.chooseState.runAction(cc.fadeOut(0.5));
            // this.chooseState.runAction(cc.sequence(cc.delayTime(0.3), cc.fadeOut(0.5)));
        } else {
            if (isLook) {
                this.chooseState.active = false;

            } else {
                this.chooseState.runAction(cc.fadeOut(0.2))
            }
        }
        // //观看方向
        // if (isLook) {
        //     this.showLookAt(true, getAnimalLookAt(curIndex, this.m_inx))
        // }
    }

    setTargetChoose(showani: boolean) {
        this.chooseState.active = true;
        this.chooseState.stopAllActions();
        this.chooseState.opacity = 255
        EventCenter.instance.fire("OnTarget", this.m_inx, showani)
    }

    onTarGetChoose(targetIndex, show) {
        if (targetIndex === this.m_inx) {
            //播放选中动画
            if (show) {
                console.log("播放被选中的动画");


                this.effect_Win.node.active = true;
                this.effect_Win.play();

                EventCenter.instance.fire("onShowEndEffect", this.m_inx)
                if (this.chooseAni) {
                    this.chooseAni.clearTracks();
                    // this.chooseAni.clearTrack(0); // 指定管道的索引
                    // this.chooseAni.clearTrack(0);
                    let self = this;
                    this.chooseAni.setAnimation(0, "Victory", true);
                    setTimeout(
                        () => {
                            self.chooseAni.addAnimation(0, "Normal", true); // 将我们的动画，以排队的方式 加入到管道
                        }, 3000
                    )
                }
            }
        } else {
            this.showLookAt(false, LookDirection.Default)
        }
    }

    showLookAt(show: boolean, dir: LookDirection) {
        if (!show || dir === LookDirection.Default) {
            this.spNode.active = false
            return;
        }
        this.spNode.children.forEach(item => {
            item.active = false;
        });
        switch (dir) {
            case LookDirection.UP:
                this.spNode.getChildByName("up").active = true;
                break;
            case LookDirection.DOWN:
                this.spNode.getChildByName("down").active = true;
                break;
            case LookDirection.LEFT:
                this.spNode.getChildByName("left").active = true;
                break;
            case LookDirection.RIGHT:
                this.spNode.getChildByName("right").active = true;
                break;
            default:
                break;
        }
        this.spNode.active = true;
    }
}
