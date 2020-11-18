import Player from "./player";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class TurningPlayer extends Player {

    @property(cc.Sprite)
    protected spriteTimer: cc.Sprite = undefined;
    private proTimer: Function;

    showWaitingTimer(time: number, totalTime: number) {
        let node = this.spriteTimer.node;
        node.parent.active = true;
        node.active = true;
        node.color = cc.Color.GREEN;
        this.spriteTimer.fillRange = 0;
        let start = Date.now();
        let beep = false;
        let r1 = 0.02 / totalTime;
        if (this.proTimer) {
            this.unschedule(this.proTimer);
        }
        this.schedule(this.proTimer = function () {
            if (!node || !node.isValid) {
                this.spriteTimer.fillRange = 1;
                return;
            }
            if (this.isMe) {
                let deltaTime = Date.now() - start;
                let leftTime = time * 1000 - deltaTime;
                if (leftTime <= 3000) {
                    if (!beep) {
                        beep = true;
                        this.noticeTurnOver();
                        this.scheduleOnce(() => {
                            beep = false;
                        }, 1);
                    }
                }
            }
            this.spriteTimer.fillRange -= r1;
            let ratio = Math.abs(this.spriteTimer.fillRange);
            let r = Math.min(255, ratio * 2 * 255);
            let g = Math.min(255, (1 - ratio) * 2 * 255);
            node.color = cc.color(r, g, 0);
        }, 0.016);
    }

    clearWaitingTimer() {
        this.spriteTimer.node.stopAllActions();
        this.spriteTimer.node.active = false;
        this.spriteTimer.node.parent.active = false;
        this.unschedule(this.proTimer);
    }

    abstract noticeTurnOver(): void;
}
