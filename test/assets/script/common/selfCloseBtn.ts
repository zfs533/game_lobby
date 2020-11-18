/**
 * 通用隐藏/销毁节点脚本
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class SelfCloseBtn extends cc.Component {

    /* 要隐藏/销毁的节点 */
    @property(cc.Node)
    nnode: cc.Node = undefined;

    /* 释放销毁 */
    @property(Boolean)
    isDestroy: Boolean = false;


    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.nnode) {
                if (this.isDestroy) {
                    this.nnode.destroy();
                }
                else {
                    this.nnode.active = false;
                }
            }
        });
    }
}
