

const { ccclass, property } = cc._decorator;

@ccclass
export default class scrollView_Outer extends cc.ScrollView {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    m_PlanDir
    m_InnerScrollViews
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onLoad() {
        this.m_PlanDir = null;
        this.m_InnerScrollViews.forEach(inner => {
            inner.setOuterScrollView(this);
        });
    }

    //是否为子物体
    //注意，这里递归, 如果child藏的太深, 可能影响效率。其实也还好，只是开始滑动时执行一次。
    _isHisChild(child, undeterminedParent) {
        if (child == undeterminedParent) {
            return true;
        }
        if (child.parent != null) {
            if (child.parent == undeterminedParent) {
                return true;
            } else {
                return this._isHisChild(child.parent, undeterminedParent);
            }
        }
        return false;
    }
    start() {

    }

    // update (dt) {}
}
