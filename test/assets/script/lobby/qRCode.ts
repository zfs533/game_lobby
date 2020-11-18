const { ccclass, property } = cc._decorator
@ccclass
export default class QRCode extends cc.Component {
	@property(cc.Color)
	color: cc.Color = cc.Color.WHITE

	@property(cc.Node)
	parent: cc.Node = undefined

	public setContent(str: string) {
		var qrcode = new window.QRCode(-1, 1) // var QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 }
		qrcode.addData(str)
		qrcode.make()
		let num = qrcode.getModuleCount()//横竖排点的个数
		var gg = this.node.getComponent(cc.Graphics)
		gg.clear()
		let wh = str.length < 80 ? 3.5 : 2.5
		let offx = Math.floor(wh * num / 2)
		gg.fillColor = this.color
		gg.rect(-offx - wh, -offx - wh, (num + 2) * wh, (num + 2) * wh)//左下角是(0,0)点
		gg.fill()

		// draw in the Graphics
		gg.fillColor = cc.Color.BLACK
		for (var row = 0; row < num; row++) {
			for (var col = 0; col < num; col++) {
				if (qrcode.isDark(row, col)) {
					gg.rect(-offx + col * wh, -offx + row * wh, wh, wh)
					gg.fill()
				}
			}
		}
		if (this.parent)
			this.parent.setContentSize(wh * num + 24, wh * num + 24)
	}
}