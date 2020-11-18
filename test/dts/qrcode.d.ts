declare namespace qrcode {

    declare class QRCode {
        constructor(v1: any, v2: any)

        addData(x: string): void;

        make(): void;

        getModuleCount(): number;

        isDark(v1: number, v2: number): any;
    }
}

interface Window {
    QRCode: typeof qrcode.QRCode;
}
