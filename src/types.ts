// const ed2k_regex = /ed2k:\/\/\|file\|.+?\//gi;
const ed2k_regex = /ed2k:\/\/\|file\|(.+?)\|(.+?)\|.+?\//ig
// const magnet_regex = /magnet\:\?[^\"]+/gi
const magnet_name_regex = /dn=(.+?)&/
// 先查找全局匹配项, 这里匹配不到括号内的内容, 但能把整个文档素有magnet_link拿出, dn修复成贪婪到 [&或者\s], 适配dn后没有其他值的问问题
const magnet_regex = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}(&dn=.+?[&\s])?/gi  //tr不要，查看是否有dn, 用&结束的话，把最后的一个字符去掉
// 这里去掉g下表，可以获取dn里面的内容
const each_magnet_regex = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}(&dn=(.+))?[&\s]/i  //tr不要，查看是否有dn, 用&结束的话，把最后的一个字符去掉
const magnet_xt_reg = /xt=urn:btih:(.+?)&/
const magnet_xt_reg_with_no_end = /xt=urn:btih:(.+?)&?/
const magnet_dn_reg = /dn=(.+?)[\"&]/


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

const getDnByMagLink: Function = function (magLink: string): string {
    let match = magLink.match(new RegExp(magnet_dn_reg)) || []
    return match[1] || ""
}


class MagnetLink implements Link {
    link: string
    fileName?: string
    fileSize?: string
    sequence: number

    constructor(link: string, sequence: number, name?: string) {
        this.link = link
        this.sequence = sequence + 1


        let countName: string = ""
        try {
            let magnetObj = getDnByMagLink(link)
            countName = magnetObj.dn as string
        } catch (e) {
            // do nothing
        }

        if (name) { //有传入的Atext 就用A textName
            this.fileName = name
        } else if (countName as string) { //否则用dn名
            this.fileName = countName as string
        } else { // 不然直接就用 link
            this.fileName = link
        }
        return this
    }
}

class Ed2kLink implements Link {
    link: string
    fileName?: string
    fileSize?: string
    sequence: number

    constructor(link: string, sequence: number, name?: string) {
        this.link = link
        this.sequence = sequence + 1
        // 每次需要重制一下
        let tempRegExp = new RegExp(ed2k_regex);
        let [tempLink, countName, big] = tempRegExp.exec(link) || []
        // console.log("ed2kTestRegex: ", {tempLink, countName, big, link})
        let fileSizeInt: number = big ? (parseInt(big) / (1024 * 1024)) : 0
        this.fileSize = this.dealBig(fileSizeInt)

        if (name) { //有传入的Atext 就用A textName
            this.fileName = name
        } else if (countName) { //否则用dn名
            this.fileName = countName

        } else { // 不然直接就用 link
            this.fileName = link
        }
        return this
    }

    dealBig(num: number): string {
        let numstr;
        if (num === 0) {
            return "nosize";
        }

        num = parseInt(num.toFixed(3));

        numstr = "";
        if (num < 1) {
            numstr = `${num * 1000}KB`;
        } else if (num >= 1 && num < 10) {
            numstr = `${Math.round(num * 10) / 10}MB`;
        } else {
            numstr = `${Math.floor(num)}MB`;
        }
        return numstr;

    }
}


// 例如http://goubo.io/tv/603757f5b446a37527f4bfc3, 打开console, document.body.innerHTML 字符串复制到这里，修改App.vue下的sendToContentScript方法，即可mock
const TestString = ""


export {
    DispatchMessageType,
    DocumentContentType,
    ResponseFunctionType,
    MagnetLink,
    ed2k_regex,
    magnet_regex,
    each_magnet_regex,
    magnet_name_regex,
    Ed2kLink,
    TestString,
    magnet_xt_reg,
    magnet_dn_reg,
    magnet_xt_reg_with_no_end
}
