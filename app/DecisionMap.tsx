"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Circle as LeafletCircle, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

type Circle = {
  id: string;
  name: string;
  district: string;
  station: string;
  lines: string;
  status: "C" | "D";
  evidence: string;
  product: string;
  price: string;
  size: string;
  commute: string;
  riverside: boolean;
  familySupport?: string;
  coords: [number, number];
  facts: string[];
  verify: string[];
  nearby: string[];
};

type Poi = {
  id: string;
  name: string;
  category: "教育" | "医疗" | "商业" | "公园" | "交通" | "餐饮";
  coords: [number, number];
};

const circles: Circle[] = [
  { id:"pujiang",name:"浦江（浦江镇—江月路）",district:"闵行区",station:"浦江镇 / 江月路",lines:"8号线",status:"C",evidence:"证据不足",product:"2000年代后两房",price:"待补证",size:"70–85㎡",commute:"待实测",riverside:true,coords:[31.086,121.506],facts:["已有预算内挂牌样本","浦江南段临近黄浦江"],verify:["近12月可比成交","实际步行与通勤"],nearby:["浦江郊野公园","浦江城市生活广场"]},
  { id:"zhuanqiao",name:"颛桥（颛桥—银都路）",district:"闵行区",station:"颛桥 / 银都路",lines:"5号线",status:"C",evidence:"证据不足",product:"老公房与商品房两房",price:"待补证",size:"60–80㎡",commute:"待实测",riverside:false,coords:[31.064,121.401],facts:["成熟居住区","存在预算边界样本"],verify:["成交活跃度","噪声与老人楼层"],nearby:["颛桥万达","银都路商业"]},
  { id:"jiuting",name:"九亭（九亭站）",district:"松江区",station:"九亭",lines:"9号线",status:"C",evidence:"证据不足",product:"多层与电梯两房",price:"待补证",size:"65–85㎡",commute:"9号线直达",riverside:false,coords:[31.138,121.319],facts:["9号线直达漕河泾","挂牌样本较多"],verify:["高峰拥挤","小区步行距离"],nearby:["九亭金地广场","九里亭公园"]},
  { id:"sijing",name:"泗泾（泗泾站）",district:"松江区",station:"泗泾",lines:"9号线",status:"C",evidence:"证据不足",product:"次新电梯两房",price:"待补证",size:"70–90㎡",commute:"9号线直达",riverside:false,coords:[31.119,121.261],facts:["面积余量较大","9号线通勤"],verify:["站点拥挤","真实成交与流动性"],nearby:["泗泾公园","三湘商业广场"]},
  { id:"chuansha",name:"川沙生活圈",district:"浦东新区",station:"川沙",lines:"2号线",status:"C",evidence:"证据不足",product:"2010年代两房",price:"约215万样本",size:"约83㎡",commute:"待实测",riverside:false,coords:[31.191,121.699],facts:["出现83㎡两房挂牌","生活配套成熟"],verify:["挂牌真实性","到漕河泾通勤"],nearby:["川沙公园","百联川沙"]},
  { id:"south-station",name:"上海南站—华东理工",district:"徐汇区",station:"上海南站 / 华东理工",lines:"1/3/15号线",status:"C",evidence:"证据不足",product:"1990年代小两房",price:"约235–242万样本",size:"60–65㎡",commute:"相对便利",riverside:false,coords:[31.154,121.431],facts:["中心区边界存在样本","靠近工作地点"],verify:["是否稳定供给","楼层与噪声"],nearby:["上海南站","华理体育场"]},
  { id:"songbao",name:"淞宝（友谊路—宝杨路）",district:"宝山区",station:"友谊路 / 宝杨路",lines:"3号线",status:"C",evidence:"证据不足",product:"1990年代多层两房",price:"约200–230万样本",size:"61–73㎡",commute:"待实测",riverside:true,coords:[31.401,121.483],facts:["多套预算内挂牌","靠近北上海滨江"],verify:["3号线通勤","小区环境与成交"],nearby:["吴淞口","宝山滨江公园"]},
  { id:"tonghe",name:"通河新村生活圈",district:"宝山区",station:"通河新村",lines:"1号线",status:"C",evidence:"证据不足",product:"1990年代多层两房",price:"约150–250万样本",size:"63–77㎡",commute:"待实测",riverside:false,coords:[31.333,121.446],facts:["生活配套成熟","1号线通达"],verify:["异常低价","无电梯楼层"],nearby:["宝山万达","通河公园"]},
  { id:"fengzhuang",name:"丰庄生活圈",district:"嘉定区",station:"丰庄 / 真新新村",lines:"13/14号线",status:"C",evidence:"证据不足",product:"1990–2000年代两房",price:"约219–248万样本",size:"60–67㎡",commute:"待实测",riverside:false,coords:[31.241,121.367],facts:["多个预算边界样本","成熟社区"],verify:["真实成交","三人居住空间"],nearby:["丰庄茶城","金沙公园"]},
  { id:"jiangqiao",name:"江桥生活圈",district:"嘉定区",station:"封浜 / 嘉怡路",lines:"14号线",status:"C",evidence:"证据不足",product:"2000–2010年代两房",price:"约210–250万样本",size:"75–91㎡",commute:"待实测",riverside:false,coords:[31.251,121.327],facts:["面积明显优于中心区","电梯房样本"],verify:["通勤与接驳","房屋性质"],nearby:["江桥万达","嘉闵高架"]},
  { id:"qingpu",name:"青浦新城（漕盈路）",district:"青浦区",station:"漕盈路",lines:"17号线",status:"C",evidence:"证据不足",product:"2000年代两房",price:"约147–181万样本",size:"74–80㎡",commute:"待实测",riverside:false,coords:[31.166,121.102],facts:["总价余量较大","成熟城区配套"],verify:["通勤时间","流动性"],nearby:["青浦万达茂","环城水系公园"]},
  { id:"xujing",name:"徐泾北城生活圈",district:"青浦区",station:"徐盈路 / 蟠龙路",lines:"17号线",status:"C",evidence:"证据不足",product:"2010年代电梯两房",price:"约155万样本",size:"70–73㎡",commute:"待实测",riverside:false,coords:[31.196,121.259],facts:["次新电梯住宅","预算余量较大"],verify:["真实步行距离","人口密度与接驳"],nearby:["蟠龙天地","徐泾北城商业"]},
  { id:"nanqiao",name:"南桥新城生活圈",district:"奉贤区",station:"奉贤新城",lines:"5号线",status:"C",evidence:"证据不足",product:"2010年代电梯两房",price:"约228万样本",size:"约61㎡",commute:"待实测",riverside:false,coords:[30.918,121.475],facts:["有表面符合样本","城市配套较完整"],verify:["空间是否拥挤","长距离通勤"],nearby:["奉贤博物馆","泡泡公园"]},
  { id:"jinshan",name:"金山石化生活圈",district:"金山区",station:"无上海地铁",lines:"无",status:"D",evidence:"硬条件冲突",product:"1980–2000年代两房",price:"约60–70万样本",size:"61–78㎡",commute:"不满足地铁条件",riverside:true,coords:[30.731,121.337],facts:["价格和面积余量极大","滨海而非黄浦江沿线"],verify:["非地铁通勤可能性","房屋质量"],nearby:["金山城市沙滩","金山卫站"]},
  { id:"zhenru",name:"真如生活圈",district:"普陀区",station:"真如 / 上海西站",lines:"11/14/15号线",status:"C",evidence:"证据不足",product:"1980–1990年代两房",price:"约250万边界",size:"61–69㎡",commute:"待实测",riverside:false,coords:[31.255,121.401],facts:["预算边界样本","轨道交通较强"],verify:["稳定供给","低楼层潮湿噪声"],nearby:["真如环宇城MAX","真如公园"]},
  { id:"ganquan",name:"甘泉—宜川生活圈",district:"普陀区",station:"新村路 / 延长路",lines:"7号线",status:"C",evidence:"边界待证",product:"1980–1990年代小两房",price:"约249–270万边界",size:"59–61㎡",commute:"待实测",riverside:false,coords:[31.273,121.438],facts:["中心区边界样本","生活配套成熟"],verify:["面积预算同时满足","三人空间"],nearby:["宜川公园","甘泉市场"]},
  { id:"beixinjing",name:"北新泾生活圈",district:"长宁区",station:"北新泾 / 淞虹路",lines:"2号线",status:"C",evidence:"证据不足",product:"1990年代多层两房",price:"约214–250万样本",size:"61–68㎡",commute:"待实测",riverside:false,coords:[31.218,121.367],facts:["多套表面符合挂牌","2号线交通"],verify:["异常低价","高楼层养老适配"],nearby:["临空SOHO","新泾公园"]},
  { id:"xianxia",name:"仙霞生活圈",district:"长宁区",station:"水城路 / 伊犁路",lines:"10号线",status:"C",evidence:"证据不足",product:"1990年代多层两房",price:"约245–249万样本",size:"60–67㎡",commute:"相对便利",riverside:false,coords:[31.207,121.391],facts:["中心区预算内挂牌","生活成熟"],verify:["异常低价与产权","道路/航空噪声"],nearby:["虹桥公园","黄金城道步行街"]},
  { id:"hongkou",name:"虹口江湾—凉城",district:"虹口区",station:"江湾镇 / 殷高西路",lines:"3号线",status:"D",evidence:"当前未证实",product:"老公房与次新两房",price:"目前样本超250万",size:"55–75㎡",commute:"待实测",riverside:false,coords:[31.311,121.479],facts:["本轮未找到同时满足样本","不代表Joshua淘汰"],verify:["扩大平台与成交检索","普通住宅性质"],nearby:["彩虹湾公园","江湾镇商业"]},
  { id:"dahua",name:"大华生活圈",district:"宝山区",station:"大华三路 / 行知路",lines:"7号线",status:"C",evidence:"证据不足",product:"1990–2000年代两房",price:"约210–239万样本",size:"71–74㎡",commute:"待实测",riverside:false,coords:[31.278,121.424],facts:["70㎡以上预算内样本","成熟社区"],verify:["真实成交","无电梯楼层"],nearby:["大华虎城","大华公园"]},
  { id:"gucun",name:"顾村—刘行生活圈",district:"宝山区",station:"顾村公园 / 刘行",lines:"7/15号线",status:"C",evidence:"证据不足",product:"2000–2010年代两房",price:"约208–236万样本",size:"70–78㎡",commute:"待实测",riverside:false,coords:[31.348,121.375],facts:["面积与电梯条件较好","多套挂牌样本"],verify:["成交活跃度","通勤代价"],nearby:["顾村公园","龙湖天街"]},
  { id:"shanghai-u",name:"上海大学—祁连",district:"宝山区",station:"上海大学 / 祁华路",lines:"7/15号线",status:"C",evidence:"证据不足",product:"1990–2010年代两房",price:"约219–250万样本",size:"67–80㎡",commute:"待实测",riverside:false,coords:[31.320,121.389],facts:["普通两房与特殊复式混合","预算内样本"],verify:["排除赠送面积产品","产权与贷款"],nearby:["上海大学","上大聚丰园"]},
  { id:"caolu",name:"曹路生活圈",district:"浦东新区",station:"民雷路 / 曹路",lines:"9号线",status:"C",evidence:"证据不足",product:"1990–2010年代两房",price:"约160–233万样本",size:"64–78㎡",commute:"9号线长距离",riverside:false,coords:[31.269,121.681],facts:["总价面积余量明显","两代住宅混合"],verify:["房屋性质","站距与通勤"],nearby:["金海文化艺术中心","曹路宝龙"]},
  { id:"jinyang",name:"金杨—金桥生活圈",district:"浦东新区",station:"金桥路 / 博兴路",lines:"6/9号线",status:"C",evidence:"证据不足",product:"1990年代老公房",price:"约220–250万样本",size:"72–75㎡",commute:"待实测",riverside:true,coords:[31.257,121.588],facts:["预算内空间样本","成熟生活配套"],verify:["实际滨江可达性","楼层与噪声"],nearby:["金桥公园","碧云体育公园"]},
  { id:"zhaoxiang",name:"赵巷生活圈",district:"青浦区",station:"赵巷 / 汇金路附近",lines:"17号线",status:"C",evidence:"证据不足",product:"2010年代电梯两房",price:"约110–155万样本",size:"69–76㎡",commute:"待实测",riverside:false,coords:[31.159,121.193],facts:["价格余量很大","电梯住宅"],verify:["小区到地铁真实距离","通勤与流动性"],nearby:["奥特莱斯","赵巷公园"]},
  { id:"yangjing",name:"洋泾生活圈",district:"浦东新区",station:"北洋泾路 / 德平路",lines:"6/18号线",status:"D",evidence:"面积条件未证实",product:"老公房小两房",price:"约250万边界样本",size:"约43㎡边界样本",commute:"待实测",riverside:true,coords:[31.240,121.550],facts:["存在250万、约43㎡两房挂牌样本","成熟社区但主流两房明显高于预算"],verify:["60㎡以上预算内成交","从住宅区到滨江的实际路径"],nearby:["洋泾社区商业","浦东滨江"]},
  { id:"tangqiao",name:"塘桥生活圈",district:"浦东新区",station:"塘桥 / 蓝村路",lines:"4/6号线",status:"C",evidence:"紧凑两房边界",product:"1980–1990年代老公房",price:"约215万挂牌样本",size:"约50㎡",commute:"换乘9号线待实测",riverside:true,coords:[31.210,121.520],facts:["塘东小区出现约50㎡、215万两房挂牌样本","内环内、轨交与社区商业成熟"],verify:["60㎡以上房源是否可进入250万","噪声、楼层及真实滨江步行距离"],nearby:["塘桥公园","浦东滨江"]},
  { id:"nanmatou",name:"南码头—临沂生活圈",district:"浦东新区",station:"临沂新村 / 高科西路",lines:"6/7号线",status:"C",evidence:"紧凑两房可见",product:"1980–1990年代老公房",price:"约214–240万挂牌样本",size:"约49–50㎡",commute:"换乘9号线待实测",riverside:true,coords:[31.190,121.507],facts:["临沂七村、港机新村出现预算内紧凑两房样本","临沂路—浦三路社区级商业成熟"],verify:["60–70㎡预算内稳定供给","每个小区到连续滨江的真实步行时间"],nearby:["临沂路生活街区","南浦大桥滨江"]},
  { id:"zhoujiadu",name:"周家渡—云台生活圈",district:"浦东新区",station:"云台路 / 成山路",lines:"7/8/13号线",status:"D",evidence:"合格样本未证实",product:"老公房与动迁房两房",price:"250万边界待核",size:"待补证",commute:"换乘9号线待实测",riverside:true,coords:[31.181,121.502],facts:["生活配套与轨交密度较成熟","处在世博滨江住宅腹地"],verify:["普通住宅两房真实挂牌与成交","住宅到滨江是否被道路或大型地块阻隔"],nearby:["云台路商业","世博文化公园"]},
  { id:"shanggang",name:"上钢新村—昌里生活圈",district:"浦东新区",station:"长清路 / 耀华路",lines:"7/8/13号线",status:"C",evidence:"紧凑两房可见",product:"老公房小两房",price:"约208–248万挂牌样本",size:"约51–55㎡",commute:"换乘9号线待实测",riverside:true,coords:[31.177,121.491],facts:["上钢新村及上钢二村存在预算内两房样本","昌里路生活配套成熟、靠近世博滨江"],verify:["60㎡以上供给与成交","一楼潮湿、噪声和小区环境"],nearby:["昌里路生活街区","世博文化公园"]},
  { id:"yangsi",name:"杨思—德州生活圈",district:"浦东新区",station:"杨思 / 成山路",lines:"8/13号线",status:"C",evidence:"预算内两房样本",product:"1990年代老公房",price:"约220–238万挂牌样本",size:"约61㎡",commute:"换乘9号线待实测",riverside:true,coords:[31.166,121.500],facts:["杨思路502弄出现约61㎡、220–238万两房样本","面积首次落入Joshua的60–70㎡目标区间"],verify:["挂牌真实性与近12月成交","到滨江、地铁和漕河泾的门到门时间"],nearby:["杨思路生活街区","前滩休闲公园外围"]},
  { id:"sanlin",name:"凌兆—三林生活圈",district:"浦东新区",station:"凌兆新村 / 三林",lines:"8/11号线",status:"C",evidence:"预算内两房样本",product:"1990年代动迁房与老公房",price:"约175–212万挂牌样本",size:"约52–62㎡",commute:"换乘9号线待实测",riverside:true,coords:[31.142,121.497],facts:["凌兆二村与凌兆十五村出现预算内两房样本","总价余量优于北侧沿江板块"],verify:["60㎡以上稳定供给","老人适配楼层、小区环境与滨江实际可达性"],nearby:["凌兆新村社区商业","三林滨江"]},
  { id:"expo",name:"世博—后滩功能区",district:"浦东新区",station:"中华艺术宫 / 后滩",lines:"7/8/13号线",status:"D",evidence:"不是独立刚需住宅圈",product:"次新商品房与少量老住宅",price:"已见两房样本约282–288万",size:"约77–78㎡样本",commute:"换乘9号线待实测",riverside:true,coords:[31.185,121.476],facts:["滨江公共空间质量高","当前检索到的标准两房样本超过250万"],verify:["是否存在普通住宅预算内异常样本","把周边居住腹地与景观功能区分开"],nearby:["世博文化公园","后滩公园"]},
  { id:"qiantan-edge",name:"前滩外围（研究标签）",district:"浦东新区",station:"东方体育中心 / 灵岩南路",lines:"6/8/11号线",status:"D",evidence:"边界概念待拆分",product:"跨杨思、凌兆等不同住宅圈",price:"不可直接比较",size:"不可直接比较",commute:"待按具体小区实测",riverside:true,coords:[31.153,121.478],facts:["“前滩外围”是营销与区位标签，不是同质生活圈","预算内样本主要可能落在杨思、凌兆等既有社区"],verify:["具体小区归属与产权","避免为前滩标签支付溢价"],nearby:["前滩太古里","前滩休闲公园"]},
  { id:"jiading-new-city",name:"嘉定新城—白银路生活圈",district:"嘉定区",station:"嘉定新城 / 白银路",lines:"11号线",status:"C",evidence:"预算边界样本",product:"2000–2010年代电梯两房",price:"约250万挂牌样本",size:"约89㎡",commute:"11号线换乘待实测",riverside:false,familySupport:"嘉定新城亲属支持圈核心，具体门到门距离待录入",coords:[31.345,121.254],facts:["出现约89㎡、250万两房挂牌样本","与嘉定新城亲属家庭的空间联系最直接"],verify:["具体小区到妹妹家的门到门时间","成交、产权与贷款条件"],nearby:["嘉定新城站","远香湖"]},
  { id:"malu",name:"马陆—嘉定新城南生活圈",district:"嘉定区",station:"马陆 / 嘉定新城",lines:"11号线",status:"C",evidence:"两房供给可见",product:"2000年代后电梯两房",price:"250万以内供给待逐套核验",size:"约80–90㎡样本",commute:"11号线换乘待实测",riverside:false,familySupport:"邻近嘉定新城，适合作为亲属支持圈南侧样本",coords:[31.321,121.276],facts:["可见约84㎡商品住宅两房样本","面积与老人长期居住条件优于中心区紧凑房"],verify:["预算内稳定供给","到妹妹家及漕河泾双向时间"],nearby:["马陆站","大融城周边"]},
  { id:"juyuan",name:"菊园新区—嘉定北生活圈",district:"嘉定区",station:"嘉定北 / 嘉定西",lines:"11号线",status:"C",evidence:"预算内大两房样本",product:"2000年代多层与电梯两房",price:"约235万挂牌样本",size:"约96㎡样本",commute:"11号线长距离",riverside:false,familySupport:"嘉定新城亲属支持圈北侧，距离需按具体小区测量",coords:[31.397,121.238],facts:["出现约96㎡、235万两房挂牌样本","空间余量适合三人阶段性长期居住"],verify:["挂牌真实性与房屋性质","老人楼层及到妹妹家的时间"],nearby:["嘉定北站","菊园新区社区商业"]},
  { id:"jiading-old-town",name:"嘉定老城—新成路生活圈",district:"嘉定区",station:"嘉定北 / 新成路",lines:"11号线+公交",status:"D",evidence:"合格样本待证",product:"老公房与早期商品房",price:"250万以内待补证",size:"60–90㎡待补证",commute:"接驳与换乘待实测",riverside:false,familySupport:"邻近嘉定新城，但地铁接驳和具体距离差异较大",coords:[31.385,121.276],facts:["成熟老城生活配套","地理上处于嘉定新城亲属支持圈"],verify:["预算内两房供给","站距、楼层、小区环境与流动性"],nearby:["州桥老街","嘉定博物馆"]},
  { id:"nanxiang",name:"南翔—古猗园生活圈",district:"嘉定区",station:"南翔",lines:"11号线",status:"C",evidence:"预算边界样本",product:"1990年代多层大两房",price:"约250万挂牌样本",size:"约89–91㎡",commute:"11号线换乘待实测",riverside:false,familySupport:"在嘉定新城亲属支持圈南侧，需比较驾车与轨交通达性",coords:[31.294,121.311],facts:["出现约89–91㎡、250万两房挂牌样本","生活配套成熟且空间明显充足"],verify:["无电梯楼层与老人适配","到妹妹家和漕河泾的双向时间"],nearby:["古猗园","南翔老街"]},
];

const districts = ["全部区域", ...Array.from(new Set(circles.map((item) => item.district)))];

function statusText(status: Circle["status"]) {
  return status === "C" ? "C · 证据不足" : "D · 当前未证实";
}

export function DecisionMap() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markerInstances = useRef<LeafletMarker[]>([]);
  const poiMarkerInstances = useRef<LeafletMarker[]>([]);
  const radiusLayer = useRef<LeafletCircle | null>(null);
  const poiCache = useRef<Record<string, Poi[]>>({});
  const [mapReady, setMapReady] = useState(false);
  const [selectedId, setSelectedId] = useState("south-station");
  const [district, setDistrict] = useState("全部区域");
  const [query, setQuery] = useState("");
  const [riversideOnly, setRiversideOnly] = useState(false);
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiStatus, setPoiStatus] = useState<"loading" | "ready" | "error">("loading");
  const [showList, setShowList] = useState(true);

  const filtered = useMemo(() => circles.filter((item) => {
    const matchDistrict = district === "全部区域" || item.district === district;
    const matchQuery = `${item.name}${item.district}${item.station}`.toLowerCase().includes(query.toLowerCase());
    const matchArchive = showArchived ? archivedIds.includes(item.id) : !archivedIds.includes(item.id);
    return matchDistrict && matchQuery && matchArchive && (!riversideOnly || item.riverside) && (!shortlistOnly || shortlistIds.includes(item.id));
  }), [district, query, riversideOnly, shortlistOnly, shortlistIds, archivedIds, showArchived]);

  const selected = circles.find((item) => item.id === selectedId && !archivedIds.includes(item.id)) ?? filtered[0] ?? circles.find((item) => !archivedIds.includes(item.id)) ?? circles[0];
  const comparedCircles = useMemo(() => {
    const shortlisted = circles.filter((item) => shortlistIds.includes(item.id) && !archivedIds.includes(item.id));
    return [selected, ...shortlisted.filter((item) => item.id !== selected.id)];
  }, [selected, shortlistIds, archivedIds]);

  const comparisonRows = [
    { label: "01 总价可达性", value: (item: Circle) => item.price },
    { label: "02 户型与面积", value: (item: Circle) => `${item.product} · ${item.size}` },
    { label: "03 供给证据", value: (item: Circle) => `${item.evidence} · ${item.facts[0]}` },
    { label: "04 通勤可达性", value: (item: Circle) => `${item.lines} · ${item.commute}` },
    { label: "05 生活便利度", value: (item: Circle) => item.nearby.join(" / ") },
    { label: "06 父母长期居住", value: (item: Circle) => item.familySupport || (item.verify.some((text) => /楼层|电梯|老人|潮湿/.test(text)) ? item.verify.filter((text) => /楼层|电梯|老人|潮湿/.test(text)).join(" / ") : "老人适配待实地核验；到嘉定新城亲属家庭待测") },
    { label: "07 环境与噪声", value: (item: Circle) => item.verify.some((text) => /噪声|环境|步行|滨江/.test(text)) ? item.verify.filter((text) => /噪声|环境|步行|滨江/.test(text)).join(" / ") : "安静度与小区环境待核验" },
    { label: "08 滨江与休闲", value: (item: Circle) => item.riverside ? `沿江关注 · ${item.nearby.join(" / ")}` : `非沿江样本 · ${item.nearby.join(" / ")}` },
    { label: "09 流动性与风险", value: (item: Circle) => item.verify.join(" / ") },
  ];

  useEffect(() => {
    const saved = window.localStorage.getItem("joshua-home-shortlist");
    if (saved) {
      try { setShortlistIds(JSON.parse(saved)); } catch { /* ignore invalid old data */ }
    }
    const savedArchive = window.localStorage.getItem("joshua-home-archive");
    if (savedArchive) {
      try { setArchivedIds(JSON.parse(savedArchive)); } catch { /* ignore invalid old data */ }
    }
  }, []);

  function toggleShortlist(id: string) {
    setShortlistIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem("joshua-home-shortlist", JSON.stringify(next));
      return next;
    });
  }

  function toggleArchive(id: string) {
    setArchivedIds((current) => {
      const restoring = current.includes(id);
      const next = restoring ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem("joshua-home-archive", JSON.stringify(next));
      if (!restoring) {
        setShortlistIds((shortlist) => {
          const nextShortlist = shortlist.filter((item) => item !== id);
          window.localStorage.setItem("joshua-home-shortlist", JSON.stringify(nextShortlist));
          return nextShortlist;
        });
      }
      return next;
    });
  }

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!mapElement.current || mapInstance.current) return;
      const L = await import("leaflet");
      if (!mounted || !mapElement.current) return;
      const map = L.map(mapElement.current, { zoomControl: false, attributionControl: true }).setView([31.19, 121.47], 9);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstance.current = map;
      setMapReady(true);
    }
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    async function refreshMarkers() {
      const map = mapInstance.current;
      if (!map) return;
      const L = await import("leaflet");
      markerInstances.current.forEach((marker) => marker.remove());
      markerInstances.current = filtered.map((item) => {
        const active = item.id === selected.id;
        const icon = L.divIcon({
          className: "circle-marker-wrap",
          html: `<button class="circle-marker ${item.status === "D" ? "is-d" : ""} ${item.riverside ? "is-river" : ""} ${active ? "is-active" : ""}" aria-label="${item.name}"><span>${item.status}</span></button>`,
          iconSize: [active ? 34 : 28, active ? 34 : 28],
          iconAnchor: [active ? 17 : 14, active ? 17 : 14],
        });
        const marker = L.marker(item.coords, { icon }).addTo(map);
        marker.bindTooltip(item.name, { direction: "top", offset: [0, -16], className: "map-tooltip" });
        marker.on("click", () => setSelectedId(item.id));
        return marker;
      });
    }
    refreshMarkers();
  }, [filtered, selected.id, mapReady]);

  useEffect(() => {
    if (mapInstance.current && selected) {
      mapInstance.current.flyTo(selected.coords, 14, { duration: 0.65 });
    }
  }, [selected, mapReady]);

  useEffect(() => {
    async function drawResearchRadius() {
      const map = mapInstance.current;
      if (!map) return;
      const L = await import("leaflet");
      radiusLayer.current?.remove();
      radiusLayer.current = L.circle(selected.coords, {
        radius: 1500,
        color: "#6bc1c2",
        weight: 1.5,
        opacity: 0.9,
        fillColor: "#6bc1c2",
        fillOpacity: 0.07,
        dashArray: "6 6",
      }).addTo(map);
    }
    drawResearchRadius();
  }, [selected, mapReady]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadPois() {
      const cached = poiCache.current[selected.id];
      if (cached) {
        setPois(cached);
        setPoiStatus("ready");
        return;
      }
      setPoiStatus("loading");
      const [lat, lng] = selected.coords;
      const queryText = `[out:json][timeout:18];(
        nwr(around:1500,${lat},${lng})[amenity~"school|kindergarten|college|university|hospital|clinic|doctors|pharmacy|marketplace|restaurant|cafe|fast_food|food_court|bus_station"];
        nwr(around:1500,${lat},${lng})[shop~"supermarket|convenience|department_store|mall|greengrocer"];
        nwr(around:1500,${lat},${lng})[leisure~"park|playground|sports_centre|fitness_centre"];
        nwr(around:1500,${lat},${lng})[railway~"station|subway_entrance"];
      );out center tags;`;
      try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(queryText)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("POI request failed");
        const data = await response.json();
        const items: Poi[] = data.elements.flatMap((element: {
          id: number;
          lat?: number;
          lon?: number;
          center?: { lat: number; lon: number };
          tags?: Record<string, string>;
        }) => {
          const point = element.lat && element.lon ? [element.lat, element.lon] : element.center ? [element.center.lat, element.center.lon] : null;
          const name = element.tags?.["name:zh"] || element.tags?.name;
          if (!point || !name) return [];
          let category: Poi["category"] = "公园";
          if (element.tags?.railway || element.tags?.amenity === "bus_station") category = "交通";
          else if (element.tags?.shop || element.tags?.amenity === "marketplace") category = "商业";
          else if (/hospital|clinic|doctors|pharmacy/.test(element.tags?.amenity || "")) category = "医疗";
          else if (/school|kindergarten|college|university/.test(element.tags?.amenity || "")) category = "教育";
          else if (/restaurant|cafe|fast_food|food_court/.test(element.tags?.amenity || "")) category = "餐饮";
          return [{ id: `${element.id}-${category}`, name, category, coords: point as [number, number] }];
        });
        const unique = Array.from(new Map(items.map((item) => [`${item.name}-${item.category}`, item])).values()).slice(0, 100);
        poiCache.current[selected.id] = unique;
        setPois(unique);
        setPoiStatus("ready");
      } catch {
        if (!controller.signal.aborted) {
          setPois([]);
          setPoiStatus("error");
        }
      }
    }
    loadPois();
    return () => controller.abort();
  }, [selected]);

  useEffect(() => {
    async function refreshPoiMarkers() {
      const map = mapInstance.current;
      if (!map) return;
      const L = await import("leaflet");
      poiMarkerInstances.current.forEach((marker) => marker.remove());
      const symbol: Record<Poi["category"], string> = { 教育: "学", 医疗: "医", 商业: "购", 公园: "园", 交通: "行", 餐饮: "食" };
      poiMarkerInstances.current = pois.map((item) => {
        const icon = L.divIcon({
          className: "poi-marker-wrap",
          html: `<span class="poi-marker poi-${item.category}">${symbol[item.category]}</span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const marker = L.marker(item.coords, { icon }).addTo(map);
        marker.bindTooltip(`${item.category} · ${item.name}`, { direction: "top", offset: [0, -10], className: "map-tooltip" });
        return marker;
      });
    }
    refreshPoiMarkers();
  }, [pois, mapReady]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">购</div>
          <div>
            <p className="eyebrow">JOSHUA · HOME RESEARCH OS</p>
            <h1>上海购房研究地图</h1>
          </div>
        </div>
        <div className="header-note">
          <span className="live-dot" />
          数据截至 2026.07.26
        </div>
      </header>

      <section className="metrics" aria-label="研究概览">
        <div><strong>{circles.length - archivedIds.length}</strong><span>当前候选生活圈</span></div>
        <div><strong>{circles.filter((x) => x.status === "C").length}</strong><span>等待补证</span></div>
        <div><strong>{circles.filter((x) => x.riverside).length}</strong><span>沿江 / 近水样本</span></div>
        <div className="metric-wide"><strong>{shortlistIds.length}</strong><span>Shortlist</span><em>仅代表进入复核，不代表决定购买</em></div>
      </section>

      <section className="workspace">
        <aside className={`research-panel ${showList ? "" : "is-collapsed"}`}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MARKET SCAN</p>
              <h2>生活圈长名单</h2>
            </div>
            <button className="collapse-button" onClick={() => setShowList(!showList)} aria-label={showList ? "收起列表" : "展开列表"}>
              {showList ? "‹" : "›"}
            </button>
          </div>
          {showList && <>
            <label className="search-box">
              <span>⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索板块、地铁或行政区" />
            </label>
            <div className="filter-row">
              <select value={district} onChange={(event) => setDistrict(event.target.value)} aria-label="行政区筛选">
                {districts.map((item) => <option key={item}>{item}</option>)}
              </select>
              <button className={riversideOnly ? "filter-button active" : "filter-button"} onClick={() => setRiversideOnly(!riversideOnly)}>
                ≋ 黄浦江沿线
              </button>
              <button className={shortlistOnly ? "filter-button shortlist-filter active" : "filter-button shortlist-filter"} onClick={() => setShortlistOnly(!shortlistOnly)}>
                ★ Shortlist {shortlistIds.length || ""}
              </button>
              <button
                className={showArchived ? "filter-button archive-filter active" : "filter-button archive-filter"}
                onClick={() => { setShowArchived(!showArchived); setShortlistOnly(false); }}
              >
                {showArchived ? "↩ 返回候选清单" : `归档 ${archivedIds.length || ""}`}
              </button>
            </div>
            <div className="result-count">显示 {filtered.length} / {circles.length} 个生活圈</div>
            <div className="circle-list">
              {filtered.map((item) => (
                <div key={item.id} className={`circle-row-wrap ${item.id === selected.id ? "selected" : ""}`}>
                  <button className="circle-row" onClick={() => setSelectedId(item.id)}>
                    <span className={`status-disc status-${item.status.toLowerCase()}`}>{item.status}</span>
                    <span className="row-copy">
                      <strong>{item.name}</strong>
                      <small>{item.district} · {item.station}</small>
                    </span>
                    {item.riverside && <span className="river-glyph">≈</span>}
                  </button>
                  <button
                    className={shortlistIds.includes(item.id) ? "shortlist-toggle active" : "shortlist-toggle"}
                    onClick={() => toggleShortlist(item.id)}
                    aria-label={shortlistIds.includes(item.id) ? `从Shortlist移除${item.name}` : `将${item.name}加入Shortlist`}
                    title={shortlistIds.includes(item.id) ? "从 Shortlist 移除" : "加入 Shortlist"}
                  >
                    {shortlistIds.includes(item.id) ? "★" : "☆"}
                  </button>
                  <button
                    className={archivedIds.includes(item.id) ? "archive-toggle restore" : "archive-toggle"}
                    onClick={() => toggleArchive(item.id)}
                    aria-label={archivedIds.includes(item.id) ? `恢复${item.name}` : `归档${item.name}`}
                    title={archivedIds.includes(item.id) ? "恢复到候选清单" : "归档并隐藏"}
                  >
                    {archivedIds.includes(item.id) ? "↩" : "×"}
                  </button>
                </div>
              ))}
              {filtered.length === 0 && <div className="empty-state">没有符合当前筛选的生活圈</div>}
            </div>
          </>}
        </aside>

        <div className="map-stage">
          <div ref={mapElement} className="map-canvas" aria-label="上海候选生活圈地图" />
          <div className="map-legend">
            <span><i className="legend-c" /> C 证据不足</span>
            <span><i className="legend-d" /> D 当前未证实</span>
            <span><i className="legend-river" /> 沿江 / 近水</span>
            <span><i className="legend-poi" /> 1.5km 配套</span>
          </div>
          <div className="map-label">上海 · 全市场广度扫描</div>
          <div className="map-insight">
            <span>1.5KM 生活圈画像</span>
            <div>
              <strong>{poiStatus === "ready" ? pois.length : "—"}</strong>
              <small>当前可读取配套</small>
            </div>
            <div>
              <strong>—</strong>
              <small>符合条件在售房源</small>
            </div>
            <p>
              {poiStatus === "loading" && "正在读取公开点位…"}
              {poiStatus === "error" && "公开点位服务异常"}
              {poiStatus === "ready" && pois.length === 0 && "当前数据源覆盖不足，等待接入高德"}
              {poiStatus === "ready" && pois.length > 0 && "公开点位仅用于初筛；房源数据尚未接入"}
            </p>
          </div>
        </div>

        <aside className="detail-panel">
          <div className="detail-topline">
            <span className={`status-pill status-${selected.status.toLowerCase()}`}>{statusText(selected.status)}</span>
            {selected.riverside && <span className="river-pill">≈ 沿江关注</span>}
          </div>
          <p className="eyebrow">{selected.district} · {selected.lines}</p>
          <h2>{selected.name}</h2>
          <p className="station-line">⌖ {selected.station}</p>

          <div className="fact-grid">
            <div><span>主流产品</span><strong>{selected.product}</strong></div>
            <div><span>面积样本</span><strong>{selected.size}</strong></div>
            <div><span>总价样本</span><strong>{selected.price}</strong></div>
            <div><span>通勤</span><strong>{selected.commute}</strong></div>
          </div>

          <section className="detail-section">
            <div className="section-title"><span>01</span><h3>当前事实</h3></div>
            <ul className="fact-list">
              {selected.facts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
          </section>

          <section className="detail-section">
            <div className="section-title"><span>02</span><h3>待补证</h3></div>
            <div className="tag-cloud">
              {selected.verify.map((item) => <span key={item}>{item}</span>)}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-title"><span>03</span><h3>1.5km 配套点位</h3></div>
            <div className="nearby-list">
              {poiStatus === "loading" && <span>正在读取公开地图点位…</span>}
              {poiStatus === "error" && <span>点位服务暂时不可用</span>}
              {poiStatus === "ready" && pois.length === 0 && <span>暂无公开点位，需人工补证</span>}
              {pois.slice(0, 18).map((item) => <span key={item.id}>＋ {item.category} · {item.name}</span>)}
            </div>
            <p className="poi-note">地图显示1.5公里研究半径内最多100个公开点位；点位来自 OpenStreetMap，适合初筛，不替代实地和高德地图核验。</p>
          </section>

          <div className="judgement-box">
            <span>JOSHUA 阶段判断</span>
            <strong>尚未判断</strong>
            <p>Horus 提供事实与反向验证，不替你淘汰。</p>
          </div>
        </aside>
      </section>

      <section className="comparison-section">
        <div className="comparison-heading">
          <div>
            <p className="eyebrow">LIFE CIRCLE · 9-DIMENSION REVIEW</p>
            <h2>生活圈九维对比</h2>
          </div>
          <p>
            当前点选始终显示；Shortlist 中的生活圈自动加入横向比较。
            <br />表内“待核验”不是负面判断，而是下一轮需要补充的证据。
          </p>
        </div>
        <div className="comparison-scroll">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>判断维度</th>
                {comparedCircles.map((item) => (
                  <th key={item.id} className={item.id === selected.id ? "is-selected" : ""}>
                    <span>{item.id === selected.id ? "当前点选" : "Shortlist"}</span>
                    <strong>{item.name}</strong>
                    <small>{item.district} · {item.station}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th>{row.label}</th>
                  {comparedCircles.map((item) => <td key={item.id}>{row.value(item)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        <span>COUNCIL OF WISDOM · INVESTOR-HORUS</span>
        <p>挂牌存在 ≠ 可以成交 ≠ 价格合理　·　判断权始终属于 Joshua</p>
      </footer>
    </main>
  );
}
