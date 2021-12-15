const ed2k_regex = /ed2k:\/\/\|file\|.+?\//gi;
const magnet_regex = /magnet\:\?[^\"]+/gi;
const magnet_name_regex = /dn=(.+?)&/;

interface DispatchMessageType {
    dispatch: string
}

interface DocumentContentType {
    documentBody: string
}

interface ResponseFunctionType {
    (x: DocumentContentType): void
}

interface Link {
    link: string;
    fileName?: string;
    fileSize?: string;
    sequence?: number; //选择的序号
}

class MagnetLink implements Link {
    link: string
    fileName?: string
    fileSize?: string
    sequence: number

    constructor(link: string, sequence: number, name?: string) {
        this.link = link
        this.sequence = sequence
        let [countName] = magnet_name_regex.exec(link) || []
        if (name) { //有传入的Atext 就用A textName
            this.fileName = name
        } else if (countName) { //否则用dn名
            this.fileName = countName
        } else { // 不然直接就用 link
            this.fileName = link
        }
        return this
    }
}


export {
    DispatchMessageType,
    DocumentContentType,
    ResponseFunctionType,
    MagnetLink,
    ed2k_regex,
    magnet_regex,
    magnet_name_regex,
}