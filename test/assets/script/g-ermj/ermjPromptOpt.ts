
const { ccclass, property } = cc._decorator;

@ccclass
export default class ErmjPromptOpt extends cc.Component {

    show(optArr: number[], isTingPai: boolean) {
        this.node.active = true;

        this.node.children.forEach((btn, index) => {
            if (index < 4) {
                if (optArr.indexOf(+btn.name) >= 0) {
                    btn.active = true;

                    let playTime = 1.5;
                    let action1 = cc.repeatForever(cc.sequence(
                        cc.spawn(cc.scaleTo(0, .6), cc.fadeIn(0)),
                        cc.spawn(cc.scaleTo(playTime, 1.6), cc.fadeOut(playTime)),
                    ));
                    //btn.getChildByName('light').runAction(action1);
                    cc.tween(btn.getChildByName('light')).then(action1).start();
                    let action2 = cc.repeatForever(cc.sequence(
                        cc.fadeOut(playTime * 0.4),
                        cc.fadeIn(playTime * 0.6),
                    ))
                    //btn.getChildByName('cover').runAction(action2);
                    cc.tween(btn.getChildByName('cover')).then(action2).start();
                } else {
                    btn.active = false;
                }

            } else {
                let fb = btn.getChildByName('fb')
                fb.active = isTingPai;
            }
        })
    }

    hide() {
        this.node.active = false;

        this.node.children.forEach((btn) => {
            btn.children.forEach((n) => {
                n.stopAllActions();
            })
        })
    }

}
