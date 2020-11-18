
import { Animal } from "./fqzsConf"
import { AnimalType, AnimalTypeData } from "./fqzsTrendData"
const { ccclass, property } = cc._decorator;

@ccclass
export class FQZSTrendTypeItem extends cc.Component {

    @property({ type: cc.Label, tooltip: "局数" })
    lab_ju: cc.Label = null;

    lab_boeast: cc.Label = null;
    @property([cc.Label])
    private labelArr: Array<cc.Label> = [];//根据动物id来存储label

    @property(cc.Node)
    lineNode: cc.Node = null;
    @property(cc.Node)
    icon: cc.Node = null;
    @property([cc.SpriteFrame])
    animalIcons: cc.SpriteFrame[] = []
    @property(cc.Node)
    renderNode: cc.Node = null;

    private curlineNode: cc.Node = null;
    private data: AnimalTypeData = null;


    private spaceX: number = 0
    private leftX: number = 0

    onLoad() {
        this.spaceX = this.node.parent.getComponent(cc.Layout).spacingX
        //this.leftX = this.node.parent.getComponent(cc.Layout).paddingLeft
    }

    updateItemIndex(inx: number) {
        this.data.juIndex = inx;
        this.lab_ju.string = inx + ""
    }
    setRenderMode(show: boolean) {
        if (this.renderNode) {
            this.renderNode.active = !!show
        }
    } s
    setItemData(data: AnimalTypeData) {
        this.data = data;
        for (let i = Animal.Silver; i < this.data.dataArr.length; i++) {
            let lab = this.labelArr[i - Animal.Silver];
            lab.string = this.data.dataArr[i] === -1 ? "1" : this.data.dataArr[i] + ""
            if (lab.string === "0") {
                lab.string = ''
                this.icon.active = true;
                for (let inx = Animal.Chicken; inx <= Animal.Gold; inx++) {
                    if (data.dataArr[inx] === 0) {
                        this.icon.getComponent(cc.Sprite).spriteFrame = this.animalIcons[inx];
                        break;
                    }
                }
                this.icon.y = lab.node.position.y;
            }
        }
    }

    setNewJuSign(show: boolean = true) {
        this.lab_ju.node.children[0].active = false// !!show;
        if (this.curlineNode) {
            this.curlineNode.active = !show
        }
    }

    drawLineTo(offY: number) {
        //先添加线，再使用动物图标遮挡0的位置
        let indx = -1;
        for (let i = Animal.Silver; i < this.data.dataArr.length; i++) {
            if (this.data.dataArr[i] === 0) {
                indx = i; //cc.v2(this.labelArr[i].node.position)//
                break;
            }
        }
        if (indx < 0) return
        let offsetx = this.node.width + this.spaceX;
        let offsetY = offY - this.labelArr[indx - Animal.Silver].node.position.y
        //console.log("offsetx===", offsetx);
        //console.log("offsetY===", offsetY, " offY==", offY, " starty==", this.labelArr[indx].node.position.y);

        if (!this.curlineNode)
            this.curlineNode = cc.instantiate(this.lineNode);
        else {
            this.curlineNode.removeFromParent(false)
        }
        this.labelArr[indx - Animal.Silver].node.addChild(this.curlineNode);
        this.curlineNode.position = cc.v2();
        this.curlineNode.active = true;
        let vec = cc.v2(offsetx, offsetY)
        //获取旋转角度和长度
        let length = Math.sqrt(offsetx * offsetx + offsetY * offsetY)
        let scaleNode = this.labelArr[indx - Animal.Silver].node
        //console.log("斜边的长度==", length);
        this.curlineNode.setContentSize(10 / scaleNode.scaleX, length / scaleNode.scaleY);
        let compvec = cc.v2(0, 1);;
        let fudu = vec.signAngle(compvec);
        let jiaodu = cc.misc.radiansToDegrees(fudu);
        //console.log("length==", length, "jiaodu===", jiaodu, "index==", indx, " ju==", this.data.juIndex);
        this.curlineNode.angle = -jiaodu;
    }

    getChoosePiont(): number {
        //调用这个函数是在绘制之前，那么清除标记最新
        this.setNewJuSign(false)
        //返回0值的节点相对与父节点的偏移量，节点被Layout约束，x点为0，计算y的偏移
        let offsetY = 0
        for (let i = Animal.Silver; i < this.data.dataArr.length; i++) {
            if (this.data.dataArr[i] === 0) {
                // let pos = this.node.position
                // point.x = pos.x;
                // point.y = pos.y + this.labelArr[i].node.position.y
                offsetY = this.labelArr[i - Animal.Silver].node.position.y;
                break
            }
        }
        //console.log("需要连接的点的位置===", point);
        return offsetY;
    }
}
