import BCBMPath from "./bcbmPath";

/**
 * 车子跑的另一种方案
 */
const { ccclass, property } = cc._decorator;

export enum ArriviedArea {
    top = 0,
    right = 1,
    bottom = 2,
    left = 3,
}

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    body: cc.Node = null;

    @property(BCBMPath)
    bcbmPath: BCBMPath = null;

    private angle: number = 0;
    private r: number = 210;
    private speed: number = 1;
    private speed2: number = 0.3;
    private centerX: number = 201.72;
    private isRight: boolean = false;
    private isLeft: boolean = false;
    private isTop: boolean = true;
    private isbottom: boolean = false;
    /* ********************************************* */
    /* 到达中奖位置，停止跑动 */
    private isArrivied: boolean = false;
    /* 中奖位置 */
    private resultLoc: number = 1;
    /* 中奖区域，上下左右（非下注区域） */
    private arriviedArea: number = 0;
    private count: number = 0;
    private indexCount: number = 0;
    private speedMax = 7;

    start() {
        this.node.setPosition(cc.v2(0, this.r));
    }

    changeSpeed(): void {
        this.speed = 1;
        this.testtest();
        this.resultLoc = Math.floor(Math.random() * 32);
        this.isArrivied = false;
        this.setTargetLocation();
        console.log(this.speed, "resultLoc = " + this.resultLoc);
    }

    testtest() {
    }


    update() {
        this.count++;
        if (Math.abs(this.count % 60) == 0) {
            this.indexCount++;
            console.log(this.indexCount);
        }
        if (this.indexCount <= 2) {
            this.speed += 0.03;
            if (this.speed >= this.speedMax - 1) {
                this.speed = this.speedMax - 1;
            }
        }
        else if (this.indexCount > 2 && this.indexCount <= 6) {
            this.speed += 0.01;
            if (this.speed >= this.speedMax) {
                this.speed = this.speedMax;
            }
        }
        else if (this.indexCount > 6) {
            this.speed -= 0.02;
            if (this.speed <= 1) {
                this.speed = 1;
            }
            if (this.isArrivied) {
                return;
            }
        }



        this.startMove();
        this.startMove();
        this.startMove(true);
    }

    startMove(bool: boolean = false) {
        if (this.isRight) {
            this.angle += this.speed / 4.5;
            this.body.rotation = (this.angle - 80)
            // console.log(this.angle);//90-270
            let rota: number = this.angle * Math.PI / 180;
            let x = -this.r * Math.cos(rota);
            let y = this.r * Math.sin(rota);
            if (this.angle >= 270) {
                this.isRight = false;
                this.isbottom = true;
            }
            this.node.setPosition(cc.v2(x + this.centerX, y));
            if (bool)
                this.handleRight();
        }

        if (this.isLeft) {
            this.angle += this.speed / 4.5;//270-450
            let rota: number = this.angle * Math.PI / 180;
            let x = -this.r * Math.cos(rota);
            let y = this.r * Math.sin(rota);
            if (this.angle >= 270 + 180) {
                this.isLeft = false;
                this.isTop = true;
            }
            this.body.rotation = (this.angle - 80);
            this.node.setPosition(cc.v2(x - this.centerX, y));
            if (bool)
                this.handleLeft();
        }

        if (this.isTop) {
            this.node.x += this.speed;
            if (this.node.x >= this.centerX) {
                this.isTop = false;
                this.isRight = true;
                this.angle = 90;
            }
            this.body.rotation = 0;
            if (bool)
                this.handleTop();
        }

        if (this.isbottom) {
            this.node.x -= this.speed;
            if (this.node.x <= -this.centerX) {
                this.isbottom = false;
                this.isLeft = true;
                this.angle = 270;
            }
            this.body.rotation = 180;
            if (bool)
                this.handleBottom();
        }
    }

    handleTop() {
        let patharr = this.bcbmPath.getPaths();
        let x = this.node.x;
        for (let i = 0; i < 6; i++) {
            if (x >= patharr[i].x && x < patharr[i + 1].x) {
                this.bcbmPath.setLightColor(i);
                if (this.arriviedArea == ArriviedArea.top) {
                    if (i == this.resultLoc && this.speed < 2) {
                        this.isArrivied = true;
                        return;
                    }
                }
            }
        }
    }

    handleBottom() {
        let patharr = this.bcbmPath.getPaths();
        let x = this.node.x;
        for (let i = 16; i < 22; i++) {
            if (x <= patharr[i].x && x > patharr[i + 1].x) {
                this.bcbmPath.setLightColor(i);
                if (this.arriviedArea == ArriviedArea.bottom) {
                    if (i == this.resultLoc && this.speed < 2) {
                        this.isArrivied = true;
                        return;
                    }
                }
            }
        }
    }

    handleLeft() {
        let patharr = this.bcbmPath.getPaths();
        for (let i = 31; i > 21; i--) {
            let p = patharr[i];
            let roti = Math.atan2(p.y, -p.x - this.centerX);
            let angP1 = Math.ceil(180 * roti / Math.PI) + 360;//270-450
            p = patharr[i - 1];
            roti = Math.atan2(p.y, -p.x - this.centerX);
            let angP2 = Math.ceil(180 * roti / Math.PI) + 360;//270-450
            let angS = this.angle;//270-450
            if (angS <= angP1 && angS > angP2) {
                this.bcbmPath.setLightColor(i);
                if (this.arriviedArea == ArriviedArea.left) {
                    if (i == this.resultLoc && this.speed < 2) {
                        this.isArrivied = true;
                        return;
                    }
                }
            }
        }

        /* 第一个点单独处理 */
        let i = 22;
        let p = patharr[i];
        let roti = Math.atan2(p.y, -p.x - this.centerX);
        let angP1 = Math.ceil(180 * roti / Math.PI) + 360;//270-450
        p = patharr[i + 1];
        roti = Math.atan2(p.y, -p.x - this.centerX);
        let angP2 = Math.ceil(180 * roti / Math.PI) + 360;//270-450
        let angS = this.angle;//270-450
        if (angS >= angP1 && angS < angP2) {
            this.bcbmPath.setLightColor(i);
            if (this.arriviedArea == ArriviedArea.left) {
                if (i == this.resultLoc && this.speed < 2) {
                    this.isArrivied = true;
                    return;
                }
            }
        }
    }

    handleRight() {
        let patharr = this.bcbmPath.getPaths();

        for (let i = 15; i > 5; i--) {
            let p = patharr[i];
            let roti = Math.atan2(p.y, p.x - this.centerX);
            let angP1 = Math.abs(Math.ceil(180 * roti / Math.PI) - 90);//0 - 180
            p = patharr[i - 1];
            roti = Math.atan2(p.y, p.x - this.centerX);
            let angP2 = Math.abs(Math.ceil(180 * roti / Math.PI) - 90);//0 - 180
            let angS = this.angle - 90;//0-180
            if (angS <= angP1 && angS > angP2) {
                this.bcbmPath.setLightColor(i);
                if (this.arriviedArea == ArriviedArea.right) {
                    if (i == this.resultLoc && this.speed < 2) {
                        this.isArrivied = true;
                        return;
                    }
                }
            }
        }

        let i = 6
        let p = patharr[i];
        let roti = Math.atan2(p.y, p.x - this.centerX);
        let angP1 = Math.abs(Math.ceil(180 * roti / Math.PI) - 90);//0 - 180
        p = patharr[i + 1];
        roti = Math.atan2(p.y, p.x - this.centerX);
        let angP2 = Math.abs(Math.ceil(180 * roti / Math.PI) - 90);//0 - 180
        let angS = this.angle - 90;//0-180
        if (angS >= angP1 && angS < angP2) {
            this.bcbmPath.setLightColor(i);
            if (this.arriviedArea == ArriviedArea.right) {
                if (i == this.resultLoc && this.speed < 2) {
                    this.isArrivied = true;
                    return;
                }
            }
            return;
        }
    }

    /**
     * 中奖位置停下来
     * 1:落点区域判断，上下左右
     * 2:减速时机
     * 3:停下来
     */
    setTargetLocation() {
        /* 落点区域判断 */
        this.arriviedArea = this.getArriviedArea();
    }

    /**
     * 获取落点区域
     */
    getArriviedArea(): number {
        let arriArea: number = 0;
        if (this.resultLoc >= 0 && this.resultLoc < 6) {
            arriArea = ArriviedArea.top;
        }
        else if (this.resultLoc >= 6 && this.resultLoc < 16) {
            arriArea = ArriviedArea.right;
        }
        else if (this.resultLoc >= 16 && this.resultLoc < 22) {
            arriArea = ArriviedArea.bottom;
        }
        else if (this.resultLoc >= 22 && this.resultLoc < 32) {
            arriArea = ArriviedArea.left;
        }
        return arriArea;
    }
}
