
const { ccclass, property } = cc._decorator;
@ccclass
export default class NestableScrollView_Inner extends cc.ScrollView {
    private m_OuterScrollView = undefined;

    setOuterScrollView(outer) {
        this.m_OuterScrollView = outer;
    }
    _onTouchMoved(event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        var touch = event.touch;
        var deltaMove = touch.getLocation().sub(touch.getStartLocation());

        if (this.content) {
            if (!this.m_OuterScrollView.isDifferentBetweenSettingAndPlan(this)) {
                this._handleMoveLogic(touch);
            }
        }

        if (!this.cancelInnerEvents) {
            return;
        }

        if (deltaMove.mag() > 7) {
            if (!this._touchMoved && event.target !== this.node) {
                var cancelEvent = new cc.Event.EventTouch(event.getTouches(), event.bubbles);
                cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL;
                cancelEvent.touch = event.touch;
                cancelEvent.simulate = true;
                event.target.dispatchEvent(cancelEvent);
                this._touchMoved = true;
            }
        }
        this._stopPropagationIfTargetIsMe(event);
    }
}
