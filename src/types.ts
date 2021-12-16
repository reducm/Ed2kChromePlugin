import magnetTool from 'magnet-uri'


// const ed2k_regex = /ed2k:\/\/\|file\|.+?\//gi;
const ed2k_regex = /ed2k:\/\/\|file\|(.+?)\|(.+?)\|.+?\//ig
const magnet_regex = /magnet\:\?[^\"]+/gi
const magnet_name_regex = /dn=(.+?)&/

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


        let countName: string = "" 
        try {
            let magnetObj = magnetTool.decode(link);
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
        this.sequence = sequence
        // 每次需要重制一下
        let tempRegExp = new RegExp(ed2k_regex);
        let [tempLink, countName, big] = tempRegExp.exec(link) || []
        console.log("ed2kTestRegex: ", {tempLink, countName, big, link})
        let fileSizeInt: number = big ? (parseInt(big) / (1024 * 1024)) : 0
        this.fileSize = this.dealBig( fileSizeInt )

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

        num = parseInt( num.toFixed(3) );

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

const TestString = '\n<nav class="navbar navbar-default">\n    <div class="container-fluid">\n        <\!-- Brand and toggle get grouped for better mobile display -->\n        <div class="navbar-header">\n            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">\n                <span class="sr-only">Toggle navigation</span>\n                <span class="icon-bar"></span>\n                <span class="icon-bar"></span>\n                <span class="icon-bar"></span>\n            </button>\n            <a class="navbar-brand" href="/">狗波</a>\n        </div>\n        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">\n            <ul class="nav navbar-nav">\n                <li><a href="/movie">电影<span class="sr-only">(current)</span></a></li>\n                <li><a href="/av">AV</a></li>\n                <li><a href="/tv">美剧日剧港剧动漫</a></li>\n            </ul>\n\n\n\n\n\n\n\n            <\!--\n            <ul class="nav navbar-nav navbar-right">\n\n                <li class="dropdown">\n                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">\n                        <span class="glyphicon glyphicon-user" aria-hidden="true"></span>\n                        <span class="caret"></span>\n                    </a>\n                    <ul class="dropdown-menu">\n                        <li><a href="#">登录</a></li>\n                        <li><a href="#">注册 </a></li>\n                    </ul>\n                </li>\n            </ul>\n            -->\n        </div><\!-- /.navbar-collapse -->\n    </div><\!-- /.container-fluid -->\n</nav>\n\n\n    <div class="container">\n        <ul>\n            <li>名称: 镜像双胞胎</li>\n            <li>英文名称: MIRROR TWINS</li>\n            <li>别名: </li>\n            <li>类型: 日剧</li>\n        </ul>\n        <div id="links" data-uid="60375850b446a37527fa0f03"><ul class="nav nav-tabs"><li role="presentation" class="active"><a href="#">第1季</a></li><li role="presentation" class=""><a href="#">第2季</a></li></ul> <table class="table table-striped"><thead><tr><td>视像</td> <td>类型</td> <td>名称</td> <td>大小</td></tr></thead> <tbody><tr><td>MP4</td> <td>ed2k</td> <td><a href="ed2k://|file|%E9%95%9C%E5%83%8F%E5%8F%8C%E8%83%9E%E8%83%8E.MIRROR.TWINS.S01E01.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4|521651036|e35465522ebdf022c8af81eff3ec0828|h=i5zoyn6kkzgviadeliudczcgvffy57el|/">镜像双胞胎.MIRROR.TWINS.S01E01.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>497.49MB</td></tr><tr><td>MP4</td> <td>ed2k</td> <td><a href="ed2k://|file|%E9%95%9C%E5%83%8F%E5%8F%8C%E8%83%9E%E8%83%8E.MIRROR.TWINS.S01E02.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4|593621415|96f27bd29c32c9e2c70a4359eb68e67f|h=ju7a67rybbn64s2fvnt7ufyt75muq7ly|/">镜像双胞胎.MIRROR.TWINS.S01E02.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>566.12MB</td></tr><tr><td>MP4</td> <td>ed2k</td> <td><a href="ed2k://|file|%E9%95%9C%E5%83%8F%E5%8F%8C%E8%83%9E%E8%83%8E.MIRROR.TWINS.S01E03.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4|511171202|b05512e440f4021cf3c63f4dd017bd25|h=e4er264jye456aks3bv64cva2qq57aib|/">镜像双胞胎.MIRROR.TWINS.S01E03.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>487.49MB</td></tr><tr><td>MP4</td> <td>ed2k</td> <td><a href="ed2k://|file|%E9%95%9C%E5%83%8F%E5%8F%8C%E8%83%9E%E8%83%8E.MIRROR.TWINS.S01E04.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4|557816933|beb674f9897fc8618d1500a29d3cca4c|h=ciq5lf42j5ucowv63uqiooqlbgh3z5av|/">镜像双胞胎.MIRROR.TWINS.S01E04.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>531.98MB</td></tr><tr><td>MP4</td> <td>ed2k</td> <td><a href="ed2k://|file|%E9%95%9C%E5%83%8F%E5%8F%8C%E8%83%9E%E8%83%8E.MIRROR.TWINS.S01E05.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4|442546389|9691b099833856a5384d1fd6beb5cdf7|h=gcq2qqeptf4y7tywl7cjtgjxb6nkp75j|/">镜像双胞胎.MIRROR.TWINS.S01E05.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>422.05MB</td></tr><tr><td>MP4</td> <td>ed2k</td> <td><a href="ed2k://|file|%E9%95%9C%E5%83%8F%E5%8F%8C%E8%83%9E%E8%83%8E.MIRROR.TWINS.S01E06.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4|455594603|fdba9a36343fb5daaa5897a3750c690a|h=lnh4pzkqkvfqugtqbtznvn6v4kh6huqz|/">镜像双胞胎.MIRROR.TWINS.S01E06.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>434.49MB</td></tr><tr><td>MP4</td> <td>ed2k</td> <td><a href="ed2k://|file|%E9%95%9C%E5%83%8F%E5%8F%8C%E8%83%9E%E8%83%8E.MIRROR.TWINS.S01E07.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4|400652695|bb77ef67ae4d596a1822b39079cfccd2|h=b5lp5yu4dxobpju2xdhzgzm4mujvm7b3|/">镜像双胞胎.MIRROR.TWINS.S01E07.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>382.09MB</td></tr><tr><td>MP4</td> <td>ed2k</td> <td><a href="ed2k://|file|%E9%95%9C%E5%83%8F%E5%8F%8C%E8%83%9E%E8%83%8E.MIRROR.TWINS.S01E08.Final.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4|475240302|7e28bf32eeefa3473d34e90cc28ed5fa|h=xhq2fzocejmhbjsbnca2zos5bxdmm2do|/">镜像双胞胎.MIRROR.TWINS.S01E08.Final.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>453.22MB</td></tr><tr><td>MP4</td> <td>magnet</td> <td><a href="magnet:?xt=urn:btih:155d1d62017e96d8279159f836dfe0032268fd34&amp;tr=udp://9.rarbg.to:2710/announce&amp;tr=udp://9.rarbg.me:2710/announce&amp;tr=http://tr.cili001.com:8070/announce&amp;tr=http://tracker.trackerfix.com:80/announce&amp;tr=udp://open.demonii.com:1337&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=udp://p4p.arenabg.com:1337&amp;tr=wss://tracker.openwebtorrent.com&amp;tr=wss://tracker.btorrent.xyz&amp;tr=wss://tracker.fastcast.nz">镜像双胞胎.MIRROR.TWINS.S01E01.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>497.49MB</td></tr><tr><td>MP4</td> <td>magnet</td> <td><a href="magnet:?xt=urn:btih:a6ce193c7fdb29fd9464bff6b273d57fc83a1dd1&amp;tr=udp://9.rarbg.to:2710/announce&amp;tr=udp://9.rarbg.me:2710/announce&amp;tr=http://tr.cili001.com:8070/announce&amp;tr=http://tracker.trackerfix.com:80/announce&amp;tr=udp://open.demonii.com:1337&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=udp://p4p.arenabg.com:1337&amp;tr=wss://tracker.openwebtorrent.com&amp;tr=wss://tracker.btorrent.xyz&amp;tr=wss://tracker.fastcast.nz">镜像双胞胎.MIRROR.TWINS.S01E02.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>566.12MB</td></tr><tr><td>MP4</td> <td>magnet</td> <td><a href="magnet:?xt=urn:btih:3521826959b84ca6bd25bc6c15ffc0e95da71d87&amp;tr=udp://9.rarbg.to:2710/announce&amp;tr=udp://9.rarbg.me:2710/announce&amp;tr=http://tr.cili001.com:8070/announce&amp;tr=http://tracker.trackerfix.com:80/announce&amp;tr=udp://open.demonii.com:1337&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=udp://p4p.arenabg.com:1337&amp;tr=wss://tracker.openwebtorrent.com&amp;tr=wss://tracker.btorrent.xyz&amp;tr=wss://tracker.fastcast.nz">镜像双胞胎.MIRROR.TWINS.S01E03.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>487.49MB</td></tr><tr><td>MP4</td> <td>magnet</td> <td><a href="magnet:?xt=urn:btih:f184a244413f0375b6d06a28354fd52b19814406&amp;tr=udp://9.rarbg.to:2710/announce&amp;tr=udp://9.rarbg.me:2710/announce&amp;tr=http://tr.cili001.com:8070/announce&amp;tr=http://tracker.trackerfix.com:80/announce&amp;tr=udp://open.demonii.com:1337&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=udp://p4p.arenabg.com:1337&amp;tr=wss://tracker.openwebtorrent.com&amp;tr=wss://tracker.btorrent.xyz&amp;tr=wss://tracker.fastcast.nz">镜像双胞胎.MIRROR.TWINS.S01E04.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>531.98MB</td></tr><tr><td>MP4</td> <td>magnet</td> <td><a href="magnet:?xt=urn:btih:3a898177d6409f489c2fc47d162c1b8044e138b4&amp;tr=udp://9.rarbg.to:2710/announce&amp;tr=udp://9.rarbg.me:2710/announce&amp;tr=http://tr.cili001.com:8070/announce&amp;tr=http://tracker.trackerfix.com:80/announce&amp;tr=udp://open.demonii.com:1337&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=udp://p4p.arenabg.com:1337&amp;tr=wss://tracker.openwebtorrent.com&amp;tr=wss://tracker.btorrent.xyz&amp;tr=wss://tracker.fastcast.nz">镜像双胞胎.MIRROR.TWINS.S01E05.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>422.05MB</td></tr><tr><td>MP4</td> <td>magnet</td> <td><a href="magnet:?xt=urn:btih:39c0615287f63941d31dd149dad3e27e526be728&amp;tr=udp://9.rarbg.to:2710/announce&amp;tr=udp://9.rarbg.me:2710/announce&amp;tr=http://tr.cili001.com:8070/announce&amp;tr=http://tracker.trackerfix.com:80/announce&amp;tr=udp://open.demonii.com:1337&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=udp://p4p.arenabg.com:1337&amp;tr=wss://tracker.openwebtorrent.com&amp;tr=wss://tracker.btorrent.xyz&amp;tr=wss://tracker.fastcast.nz">镜像双胞胎.MIRROR.TWINS.S01E06.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>434.49MB</td></tr><tr><td>MP4</td> <td>magnet</td> <td><a href="magnet:?xt=urn:btih:d4151c69e5cb93b0012b32ec6eaa356ae121d0e5&amp;tr=udp://9.rarbg.to:2710/announce&amp;tr=udp://9.rarbg.me:2710/announce&amp;tr=http://tr.cili001.com:8070/announce&amp;tr=http://tracker.trackerfix.com:80/announce&amp;tr=udp://open.demonii.com:1337&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=udp://p4p.arenabg.com:1337&amp;tr=wss://tracker.openwebtorrent.com&amp;tr=wss://tracker.btorrent.xyz&amp;tr=wss://tracker.fastcast.nz">镜像双胞胎.MIRROR.TWINS.S01E07.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>382.09MB</td></tr><tr><td>MP4</td> <td>magnet</td> <td><a href="magnet:?xt=urn:btih:ba6882c618325f1e9f08c72f4d5a29a316420ed3&amp;tr=udp://9.rarbg.to:2710/announce&amp;tr=udp://9.rarbg.me:2710/announce&amp;tr=http://tr.cili001.com:8070/announce&amp;tr=http://tracker.trackerfix.com:80/announce&amp;tr=udp://open.demonii.com:1337&amp;tr=udp://tracker.opentrackr.org:1337/announce&amp;tr=udp://p4p.arenabg.com:1337&amp;tr=wss://tracker.openwebtorrent.com&amp;tr=wss://tracker.btorrent.xyz&amp;tr=wss://tracker.fastcast.nz">镜像双胞胎.MIRROR.TWINS.S01E08.Final.Chi_Jap.HDTVrip.1280X720-ZhuixinFan.mp4</a></td> <td>453.22MB</td></tr></tbody></table></div>\n    </div>\n\n    <\script type="text/javascript">\n        var uid = $("#links").data("uid");\n        var app = new Vue({\n          el: "#links",\n          beforeMount(){\n            const that = this\n            $.ajax({\n              url: `/api/tv/links`,\n              method: "post",\n              data: {uid},\n            }).then((res) => {\n              console.log({res});\n              if(res.links && res.links.length < 1){\n                return;\n              }\n              // 把第一个设成active\n              for( let link_obj of res.links) {\n                link_obj.is_active = false;\n              }\n\n\n              res.links[0].is_active = true;\n\n              that.links_with_season = res.links;\n              that.links = that.links_with_season[0].links;\n            }).catch(console.error);\n          },\n          data: {\n            links_with_season: [],\n            links: []\n          },\n          methods: {\n            change_season: function(season_num){\n               for(const obj of this.links_with_season) {\n                  obj.is_active = false;\n               }\n\n               for(const obj of this.links_with_season) {\n                  if(obj.season_num == season_num) {\n                    obj.is_active = true;\n                    this.links = obj.links;\n                    break;\n                  }\n               }\n            }\n          }\n        });\n    <\/script>\n\n\n\n\n\n\n'


export {
    DispatchMessageType,
    DocumentContentType,
    ResponseFunctionType,
    MagnetLink,
    ed2k_regex,
    magnet_regex,
    magnet_name_regex,
    Ed2kLink,
    TestString
}