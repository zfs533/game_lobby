
const { ccclass, property } = cc._decorator;

@ccclass
export default class ImageNode extends cc.Component {
    @property(cc.Node)
    ndCloseBtn: cc.Node = undefined;

    @property(cc.Node)
    spriteBg: cc.Node = undefined;

    @property(cc.Sprite)
    imgeSprite: cc.Sprite = undefined;

    private touch_1: cc.Vec2 = undefined;
    private touch_2: cc.Vec2 = undefined;

    private dd: number = 0;


    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (event: cc.Event.EventTouch) {
            // console.log("eventevent===TOUCH_START>>", event.getTouches());
            // console.log("eventTOUCH_START===>", event);
            // console.log("eventID=TOUCH_START=>", event.getID());
        });

        //监听触摸
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event: cc.Event.EventTouch) {
            if (event.getTouches().length > 1) {
                //此时为多点触摸，图片将进行缩放
                if (event.getID() === 0) {
                    self.touch_1 = event.getLocation();
                } else if (event.getID() === 1) {
                    self.touch_2 = event.getLocation();
                }
                let x1 = self.touch_1.x;
                let x2 = self.touch_2.x;
                let y1 = self.touch_1.y;
                let y2 = self.touch_2.y;
                var d = Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
                if ((d - self.dd) > 0) {
                    // console.log('此时为放大模式');
                    if (self.spriteBg.scale < 3) {
                        self.spriteBg.scale += 0.05;
                    }
                } else if ((d - self.dd) < 0) {
                    // console.log('此时为缩小模式');
                    if (self.spriteBg.scale > 1) {
                        self.spriteBg.scale -= 0.05;
                    }
                }
                self.dd = d;
            } else if (event.getTouches().length === 1) {
                //此时为单点触摸，图片将随手指划动方向移动
                if (self.spriteBg.scale > 1 || self.spriteBg.position != cc.Vec2.ZERO) {
                    var delta = event.touch.getDelta();
                    self.spriteBg.x += delta.x;
                    self.spriteBg.y += delta.y;
                }
            }
        });
    }

    onEnable() {
        let topNode = this.node.getParent().getChildByName("box").getChildByName("top");
        this.ndCloseBtn.y = topNode.position.y - 35;
    }

    showImageAction(tsp: cc.SpriteFrame) {
        // console.log("设置图片11111");
        this.node.active = true;
        // console.log("设置图片22222");
        this.spriteBg.scale = 1;
        // console.log("设置图片33333");
        this.spriteBg.position = cc.Vec2.ZERO;
        // console.log("设置图片44444");
        let spsize: cc.Size = tsp.getOriginalSize();
        // console.log("设置图片55555");
        let scale = 1;
        // let max = 640
        if (spsize.width > 640) scale = 640 / spsize.width;
        // console.log("设置图片666666");
        this.imgeSprite.node.height = spsize.height * scale;
        this.imgeSprite.node.width = spsize.width * scale;
        this.imgeSprite.spriteFrame = tsp;
    }

    onclickeCloserAction() {
        this.node.active = false;
    }
}
