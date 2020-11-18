import { ItemNames } from "./common/enum";
import User from "./common/user";
import Debug from "./start/debug";
import setProtos from "./start/registerProtos";
import { loadEffectCfg } from './common/cfg';
import g from "./g"

const FRAME_RATE = 60;

const { ccclass, property, executionOrder } = cc._decorator;
@ccclass
@executionOrder(0)
export default class Main extends cc.Component {
    // 这里可以设置一些全局需要用到的预制件进来（因为这个节点，不会被释放，可以永久保存）
    // 比如保存Tips，Dialog， 操作条，等全局资源预制件。
    @property(cc.Prefab)
    loading: cc.Prefab = undefined;
    @property(cc.Prefab)
    tips: cc.Prefab = undefined;

    @property(cc.Prefab)
    confirm: cc.Prefab = undefined;

    @property(cc.Prefab)
    curtain: cc.Prefab = undefined;

    @property(cc.Prefab)
    avatars: cc.Prefab = undefined;

    @property(cc.Prefab)
    avatarsFrame: cc.Prefab = undefined;

    @property(cc.Prefab)
    fort: cc.Prefab = undefined;

    @property(cc.Prefab)
    goToUrl: cc.Prefab = undefined;

    //十二星座动态头像框
    @property({ type: cc.Prefab, tooltip: "十二星座动态头像框切换" })
    dynamicNode: cc.Prefab = null;



    onLoad() {
        // 这个地方是在Start场景里就加载了。然后不会释放掉。
        cc.game.addPersistRootNode(this.node);
        // 设置ccc的帧率
        cc.game.setFrameRate(FRAME_RATE);
        // Decimal
        let Decimal = window.Decimal;
        Decimal.set({
            precision: 20,
            rounding: Decimal.ROUND_HALF_UP,
            toExpNeg: -7,
            toExpPos: 21
        });

        loadEffectCfg()
    }

    start() {
        setProtos();
        let act = localStorage.getItem(ItemNames.account);
        if (act) g.login.act = User.act;
        let pwd = localStorage.getItem(ItemNames.password);
        if (pwd) g.login.pwd = User.pwd;;
    }
}
