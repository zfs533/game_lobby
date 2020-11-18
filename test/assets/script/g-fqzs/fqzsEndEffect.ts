import { getAnimalTypeNumber, AnimalType, RoundId } from "./fqzsConf"
import { EventCenter } from "./EventManager"
import FQZSAudio from "./fqzsAudio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    @property(cc.Animation)
    private node_effect: cc.Animation = null;

    @property(cc.Label)
    private lab_title: cc.Label = null;

    @property({ type: FQZSAudio, override: true })
    adoMgr: FQZSAudio = undefined;


    @property([cc.Node])
    private node_animals: cc.Node[] = [];

    onLoad() {

        EventCenter.instance.addListener("onShowEndEffect", this.showEffect, this);
    }

    onDestroy() {
        EventCenter.instance.removeListener("onShowEndEffect", this);

    }
    start() {
        this.node_effect.node.active = false;

    }

    showEffect(type) {
        for (let item of this.node_animals) {
            item.active = false;
        }
        let self = this;
        this.node_effect.node.active = true;
        this.node_animals[RoundId[type].type].active = true;
        this.lab_title.string = RoundId[type].name + 'x' + RoundId[type].multiple;
        this.adoMgr.playOpenPrize();
        this.adoMgr.playShape(RoundId[type].type);
        this.node_effect.play();

    }

    // update (dt) {}
}
