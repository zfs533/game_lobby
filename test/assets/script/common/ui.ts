import Main from "../main";
import Loading from "./loading";
import Tips from "./tips";
import Confirm from "./confirm";
import GoToUrl from "./goToUrl";
import user from "./user";

const enum Ui_Zorder {
    Bottom = 1000,
    Middle,
    Top,
}

let main: Main;
function getMain() {
    if (!main) {
        main = cc.find("main").getComponent(Main);
    }
    return main;
}

/**
 * 显示加载转圈，可以附加文本信息
 */
export function showLoading(info?: string): void {
    let canvas = cc.find("Canvas")
    if (!canvas) return
    let node = canvas.getChildByName('loading')
    if (!node) {
        let main = getMain()
        node = cc.instantiate(main.loading)
        canvas.addChild(node, Ui_Zorder.Middle)
    }
    node.getComponent(Loading).show(info)
}

/**
 * 隐藏加载转圈
 */
export function hideLoading() {
    let canvas = cc.find("Canvas")
    if (!canvas) return
    let node = canvas.getChildByName('loading')
    if (node) {
        node.getComponent(Loading).close();
    }
}

/**
 * 显示飘窗信息
 *
 * @export
 * @param {string} info 信息
 */
export function showTip(info: string) {
    let main = getMain();
    let canvas = cc.find("Canvas");
    let node = cc.instantiate(main.tips);
    canvas.addChild(node, Ui_Zorder.Middle);
    let tips = <Tips>node.getComponent(Tips);
    tips.show(info);
}

/**
 * 显示对话框
 * 不传第2、3参数，则显示“确定”按钮
 * 传第2参数，则显示“okStr”按钮
 * 传第2、3参数，则显示“确定”“取消”按钮
 *
 * @export
 * @param {string} info 要显示的信息
 * @returns 对话框实例
 */
export function showConfirm(info: string, okStr: string = "确定", cancelStr?: string): Confirm {
    let main = getMain();
    let canvas = cc.find("Canvas");
    let node = canvas.getChildByName(main.confirm.name);
    if (!node) {
        node = cc.instantiate(main.confirm);
        canvas.addChild(node, Ui_Zorder.Bottom);
    }
    let confirm = <Confirm>node.getComponent(Confirm);
    confirm.show(info, okStr, cancelStr);
    return confirm;
}

let nodeCurtain: cc.Node;
/**
 * 显示幕布，用于切换场景
 *
 * @export
 * @param {boolean} fadeIn 渐显？
 */
export function showCurtain(fadeIn?: boolean, cb?: Function) {
    let node: cc.Node;
    if (nodeCurtain && nodeCurtain.isValid) {
        node = nodeCurtain;
    } else {
        let main = getMain();
        let canvas = cc.find("Canvas");
        node = canvas.getChildByName('curtain');
        if (!node) {
            node = cc.instantiate(main.curtain);
            canvas.addChild(node, Ui_Zorder.Top);
        }
    }
    node.stopAllActions();
    node.active = true;
    nodeCurtain = node;
    if (fadeIn === undefined) {
        node.opacity = 255;
        if (cb) {
            cb();
        }
    } else if (fadeIn) {
        if (cb) {
            //node.runAction(cc.sequence(cc.fadeIn(0.1), cc.callFunc(cb)));
            cc.tween(node)
                .to(0.1, { opacity: 255 })
                .call(() => { cb() })
                .start()
        } else {
            //node.runAction(cc.fadeIn(0.1));
            cc.tween(node).to(0.1, { opacity: 255 }).start();
        }
    } else {
        let disActive = function () {
            node.active = false;
        }
        if (cb) {
            let actions = cc.sequence(cc.fadeOut(0.1), cc.callFunc(disActive), cc.callFunc(cb))
            //node.runAction(actions);
            cc.tween(node).then(actions).start();
        } else {
            let actions = cc.sequence(cc.fadeOut(0.1), cc.callFunc(disActive))
            //node.runAction(actions);
            cc.tween(node).then(actions).start();
        }
    }
}
/**
 * 点击屏幕跳转
 * @param url
 * @param cb
 */
export function goToUrl(url: string, cb?: Function) {
    let main = getMain();
    let canvas = cc.find("Canvas");
    let node = canvas.getChildByName('openUrl');
    if (!node) {
        node = cc.instantiate(main.goToUrl);
        canvas.addChild(node, 0);
    }
    let goToUrl = <GoToUrl>node.getComponent(GoToUrl);
    goToUrl.show(url, cb);
}

export function addEvent(btn: cc.Button, handler: cc.Component.EventHandler) {
    if (btn.clickEvents.filter(e =>
        e.component === handler.component && e.target === handler.target && e.handler === handler.handler
    ).length === 0) {
        btn.clickEvents.push(handler)
    }
}

let avatar: cc.Node;
/**
 * 获取头像
 */
export function getAvatar(male: boolean, id: number) {
    let main = getMain();
    if (!avatar) {
        avatar = cc.instantiate(main.avatars);
    }
    id = id % 10;
    if (id < 0 || id > 14) {
        let def = avatar.getChildByName("default");
        return def.getComponent(cc.Sprite).spriteFrame;
    }
    let genderNode = avatar.getChildByName(male ? "male" : "female");
    let child = genderNode.getChildByName(id.toString());
    return child.getComponent(cc.Sprite).spriteFrame;
}

let avatarFrame: cc.Node;
let dynamicAvatarBox: cc.Node;
let dynamicAvatarBoxList: Array<number> = [175, 179, 129, 183, 147, 151, 155, 159, 163, 167, 171, 187, 120];

export function getAvatarFrame(id: number, frame: cc.Sprite) {
    let main = getMain();
    if (!avatarFrame) {
        avatarFrame = cc.instantiate(main.avatarsFrame);
    }
    for (let i = 0; i < frame.node.childrenCount; i++) {
        frame.node.children[i].active = false;
    }
    frame.enabled = true;
    if (!id || id > 16 || id < 0) {
        if (dynamicAvatarBoxList.indexOf(id) >= 0) {
            if (!dynamicAvatarBox) {
                dynamicAvatarBox = getdynamicAvatarBoxNode();
            }
            let aFrame = frame.node.getChildByName(id.toString())
            if (!aFrame) {
                let frame = dynamicAvatarBox.getChildByName(id.toString());
                aFrame = cc.instantiate(frame);
                aFrame.scale = 1.1
                aFrame.getChildByName("unclock").active = false;
                aFrame.getComponent(cc.Toggle).interactable = false;
            }
            aFrame.parent = frame.node;
            aFrame.position = new cc.Vec3(0, 0);
            aFrame.active = true;
            frame.enabled = false;
        } else {
            let genderNode = avatarFrame.getChildByName("default");
            frame.spriteFrame = genderNode.getComponent(cc.Sprite).spriteFrame;
        }
    } else {
        let genderNode = avatarFrame.getChildByName(id.toString());
        frame.spriteFrame = genderNode.getComponent(cc.Sprite).spriteFrame;
    }
}

/**
 * 获取周返利头像
 */
export function getdynamicAvatarBoxNode() {
    let main = getMain();
    let dynamicNode = cc.instantiate(main.dynamicNode);
    return dynamicNode;
}

let fort: cc.Node;
export function getFort(id: number) {
    let main = getMain();
    if (!fort) {
        fort = cc.instantiate(main.fort);
    }
    if (!id || id > 13 || id < 0) {
        let genderNode = fort.getChildByName("default");
        return genderNode.getComponent(cc.Sprite).spriteFrame;
    } else {
        let genderNode = fort.getChildByName(id.toString());
        return genderNode.getComponent(cc.Sprite).spriteFrame;
    }
}