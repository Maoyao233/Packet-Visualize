/* 16进制按位输出字符串内存，测试用 */
function stringToHex(str) {
	var arr = [];
	for (var i = 0; i < str.length; i++)
		arr[i] = (str.charCodeAt(i).toString(16)).slice(-4);
	return "\\0x" + arr.join("\\0x");
};

/***************************** 以下是IP包处理 ***************************************/


/* 添加IPv4/6版本头4位以及首部长度4位[20/4-60/4] */
/* 40字节可选项不考虑了 */
function AddVersionLength(IPv) {
	/* IP版本枚举类型（IPv4/6）*/
	var IPVersion =
	{
		IPv4: 4,
		IPv6: 6
	};
	/* 首部长度默认20，后4位填4 */
	var iphead = 0x05;
	if (IPv == IPVersion.IPv4)
		iphead |= 0x40;
	else if (IPv == IPVersion.IPv6)
		iphead |= 0x60;
	/* 返回添加一字节的新字符串 */
	return String.fromCodePoint(iphead);
}

/*	
	添加服务类型，长度为8位（bit），其组成：
	前3位为优先级（Precedence），
	后4位标志位，最后1位保留未用。
	参数：Number[0,7]，4个bool，原串
*/
function AddTOS(precedence, d, t, r, c) {
	var tos = 0x00;
	var pre = 0x00;
	if (precedence == 0)
		pre |= 0x00;	//0b0000
	else if (precedence == 1)
		pre |= 0x20;	//0b0010
	else if (precedence == 2)
		pre |= 0x40;	//0b0100
	else if (precedence == 3)
		pre |= 0x60;	//0b0110
	else if (precedence == 4)
		pre |= 0x80;	//0b1000
	else if (precedence == 5)
		pre |= 0xa0;	//0b1010
	else if (precedence == 6)
		pre |= 0xc0;	//0b1100
	else if (precedence == 7)
		pre |= 0xe0;	//0b1110

	tos |= pre;

	if (d == true)
		tos |= 0x10;
	if (t == true)
		tos |= 0x08;
	if (r == true)
		tos |= 0x04;
	if (c == true)
		tos |= 0x02;

	return String.fromCodePoint(tos);
}

/* 
	添加IP包总长度 
	人为保证传入字符串是已经添加了后面所有信息的串
*/
function AddTotalLength(str) {
	var length = str.length + 4;				//加上4字节
	var length_high = (length & 0xff00) >> 8;	//2字节长度高字节
	var length_low = length & 0x00ff;			//2字节长度低字节
	return String.fromCodePoint(length_high) + String.fromCodePoint(length_low);
}

/* 添加分片的标识符2字节 */
function AddIdentifier(ident) {
	var ident_high = (ident & 0xff00) >> 8;	//2字节长度高字节
	var ident_low = ident & 0x00ff;			//2字节长度低字节
	return String.fromCodePoint(ident_high) + String.fromCodePoint(ident_low);
}

/* 
	6、标志（Flags）
	长度为3位，三位从左到右分别是MF、DF、未用。
	MF=1表示后面还有分段的数据包，MF=0表示没有更多分片（即最后一个分片）。
	DF=1表示路由器不能对该数据包分段，DF=0表示数据包可以被分段。
	7、偏移量（Fragment Offset）
	也称段偏移，用于标识该数据段在上层初始数据报文中的偏移量。
	如果某个包含分段的上层报文的IP数据包在传送时丢失，
	则整个一系列包含分段的上层数据包的IP包都会要求重传。
	参数：bool,bool,number,str
*/
function AddFlagandFragmentOffset(mf, df, fo) {
	var high = (fo & 0xff00) >> 8;
	var low = fo & 0x00ff;
	high &= 0x1f;
	if (mf == true)
		high |= 0x80;
	if (df == true)
		high |= 0x40;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

function AddTTL(ttl) {
	return String.fromCodePoint((ttl >>> 0) & 0xff);
}

/* 点分十进制IPv4地址转32位整数 */
function IPToNumber(ip) {
	var num = 0;
	if (ip == "")
		return num;
	var aNum = ip.split(".");
	if (aNum.length != 4)
		return num;
	num += parseInt(aNum[0]) << 24;
	num += parseInt(aNum[1]) << 16;
	num += parseInt(aNum[2]) << 8;
	num += parseInt(aNum[3]) << 0;
	num = num >>> 0;
	//这个很关键，不然可能会出现负数的情况
	return num;
}

/*	添加8位IP协议号
	号码含义参见：https://www.cnblogs.com/classics/p/10417402.html 
*/
function AddIPProctol(pro) {
	return String.fromCodePoint((pro >>> 0) & 0xff);
}

/* 添加16位校验和，清零 */
function AddIPCheckSum() {
	return String.fromCodePoint(0x00) + String.fromCodePoint(0x00);
}

/* 更新16位校验和,人为保证此时str[0:20]中IP包20字节都已经填充完成，前面还没有填以太网头 */
function UpdateIPCheckSum(str) {
	var cksum = 0 >>> 0;
	var newstr = new String(str);
	for (var i = 0; i < 20; i++) {
		if (i == 10 || i == 11)
			continue;
		var t = newstr.charCodeAt(i);
		cksum += t;
	}
	cksum = (cksum >> 16) + (cksum & 0xffff);
	cksum += (cksum >> 16);
	cksum = ~cksum;
	var high = (cksum & 0xff00) >> 8;
	var low = cksum & 0x00ff;
	var strarray = newstr.split('');
	console.log(strarray);
	strarray[10] = String.fromCharCode(high);
	strarray[11] = String.fromCharCode(low);
	var mystr = strarray.join('');
	return mystr;
}

/* 添加源ip地址,参数格式点分十进制ip地址 */
function AddSourceIP(ip) {
	var ipnum = IPToNumber(ip);
	var ip0 = String.fromCharCode((ipnum & 0xff000000) >> 24);
	var ip1 = String.fromCharCode((ipnum & 0x00ff0000) >> 16);
	var ip2 = String.fromCharCode((ipnum & 0x0000ff00) >> 8);
	var ip3 = String.fromCharCode((ipnum & 0x000000ff));
	var newstr = ip0 + ip1 + ip2 + ip3;
	return newstr;
}

/* 添加目的ip地址,参数格式点分十进制ip地址 */
function AddDestinationIP(ip) {
	var ipnum = IPToNumber(ip);
	var ip0 = String.fromCharCode((ipnum & 0xff000000) >> 24);
	var ip1 = String.fromCharCode((ipnum & 0x00ff0000) >> 16);
	var ip2 = String.fromCharCode((ipnum & 0x0000ff00) >> 8);
	var ip3 = String.fromCharCode((ipnum & 0x000000ff));
	var newstr = ip0 + ip1 + ip2 + ip3;
	return newstr;
}

/******************************* 以下是添加以太网帧 *************************************/
/* 在已构造数据包前面添加源mac地址 参数格式"xx:xx:xx"字符串 */
function AddSourceMac(mac) {
	var newmac = new String(mac);
	var macarray = newmac.split(':');
	console.log(macarray);
	let mac0 = "0x" + macarray[0];
	let mac1 = "0x" + macarray[1];
	let mac2 = "0x" + macarray[2];
	let macnum0 = parseInt(mac0);
	let macnum1 = parseInt(mac1);
	let macnum2 = parseInt(mac2);
	return String.fromCharCode(macnum0) + String.fromCharCode(macnum1) + String.fromCharCode(macnum2);
}

/* 在已构造数据包前面添加目的mac地址 参数格式"xx:xx:xx"字符串 */
function AddDestMac(mac)
{
	var newmac = new String(mac);
	var macarray = newmac.split(':');
	console.log(macarray);
	let mac0 = "0x" + macarray[0];
	let mac1 = "0x" + macarray[1];
	let mac2 = "0x" + macarray[2];
	let macnum0 = parseInt(mac0);
	let macnum1 = parseInt(mac1);
	let macnum2 = parseInt(mac2);
	return String.fromCharCode(macnum0) + String.fromCharCode(macnum1) + String.fromCharCode(macnum2);
}

/* 在已构造数据包前面添加以太网类型2字节 
	以太网类型参数格式为以下字符串 
		IPv4 : "IPv4",
		ARP : "ARP",
		PPPoE : "PPPoE",
		802.1Q tag : "802.1Q tag",
		IPV6 : "IPv6",
		MPLS Label : "MPLS Label"
*/
function AddEthernetType(type) {
	var EthernetTypeName = {
		IPv4: "IPv4",
		ARP: "ARP",
		PPPoE: "PPPoE",
		_802_1Q_tag: "802.1Q tag",
		IPV6: "IPv6",
		MPLS_Label: "MPLS Label"
	};
	var EthernetTypeValue = {
		IPv4: 0x0800,
		ARP: 0x0806,
		PPPoE: 0x8864,
		_802_1Q_tag: 0x8100,
		IPV6: 0x86DD,
		MPLS_Label: 0x8847,
	};

	var value;
	if (type == EthernetTypeName.IPv4)
		value = EthernetTypeValue.IPv4;
	else if (type == EthernetTypeName.ARP)
		value = EthernetTypeValue.ARP;
	else if (type == EthernetTypeName.PPPoE)
		value = EthernetTypeValue.PPPoE;
	else if (type == EthernetTypeName._802_1Q_tag)
		value = EthernetTypeValue._802_1Q_tag;
	else if (type == EthernetTypeName.IPV6)
		value = EthernetTypeValue.IPV6;
	else if (type == EthernetTypeName.MPLS_Label)
		value = EthernetTypeValue.MPLS_Label;

	return String.fromCodePoint((value & 0xff00) >> 8) + String.fromCodePoint(value & 0xff);
}

/* 在已构造数据包前面添加以太网帧前导码（7字节）和帧开始符（1字节） */
function AddPreamble() {
	return String.fromCodePoint(0x55) + String.fromCodePoint(0x55) + String.fromCodePoint(0x55) +
		String.fromCodePoint(0x55) + String.fromCodePoint(0x55) + String.fromCodePoint(0x55) +
		String.fromCodePoint(0x55) + String.fromCodePoint(0xD5);
}

/******************************* 以下是添加TCP包 *************************************/

/* 在已构造数据包前面添加2字节 源端口 */
function AddTCPSourcePort(port) {
	var high = (port & 0xff00) >> 8;
	var low = port & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* 在已构造数据包前面添加2字节 目的端口 */
function AddTCPDestinationPort(port) {
	var high = (port & 0xff00) >> 8;
	var low = port & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* 在已构造数据包前面添加4字节TCP序列号 */
function AddTCPSequence(seq) {
	var seq0 = String.fromCharCode((seq & 0xff000000) >> 24);
	var seq1 = String.fromCharCode((seq & 0x00ff0000) >> 16);
	var seq2 = String.fromCharCode((seq & 0x0000ff00) >> 8);
	var seq3 = String.fromCharCode((seq & 0x000000ff));
	var newstr = seq0 + seq1 + seq2 + seq3;
	return newstr;
}

/* 在已构造数据包前面添加4字节TCP ACK */
function AddTCPACK(ack) {
	var ack0 = String.fromCharCode((ack & 0xff000000) >> 24);
	var ack1 = String.fromCharCode((ack & 0x00ff0000) >> 16);
	var ack2 = String.fromCharCode((ack & 0x0000ff00) >> 8);
	var ack3 = String.fromCharCode((ack & 0x000000ff));
	var newstr = ack0 + ack1 + ack2 + ack3;
	return newstr;
}


/* 在已构造数据包前面添加4bit TCP包长度（单位32bit）和4bit保留置零 */
function AddTCPHeadLengthandRecv() {
	/* 无可选项的TCP包就20字节，因此头长填写5 */
	return String.fromCodePoint(0x50);
}

/*	在已构造数据包前面添加8bit标志位
	CWR(Congestion Window Reduce)：拥塞窗口减少标志被发送主机设置
	ECE(ECN Echo)：ECN响应标志
	URG(Urgent)：紧急(The urgent pointer) 标志
	ACK(Acknowledgment)：取值1代表Acknowledgment Number字段有效，这是一个确认的TCP包，取值0则不是确认包。
	PSH(Push)：该标志置位时，一般是表示发送端缓存中已经没有待发送的数据，接收端不将该数据进行队列处理，而是尽可能快将数据转由应用处理。
	RST(Reset)：用于复位相应的TCP连接。通常在发生异常或者错误的时候会触发复位TCP连接。
	SYN(Synchronize)：同步序列编号(Synchronize Sequence Numbers)有效。
	FIN(Finish)：带有该标志置位的数据包用来结束一个TCP会话
	参数：8个bool+str
*/
function AddTCPFlag(cwr, ece, urg, ack, psh, rst, syn, fin) {
	var flag = 0x00;
	if (cwr == true)
		flag |= 0x80;
	if (ece == true)
		flag |= 0x40;
	if (urg == true)
		flag |= 0x20;
	if (ack == true)
		flag |= 0x10;
	if (psh == true)
		flag |= 0x08;
	if (rst == true)
		flag |= 0x04;
	if (syn == true)
		flag |= 0x02;
	if (fin == true)
		flag |= 0x01;

	return String.fromCodePoint(flag);
}

/* 在已构造数据包前面添加2字节窗体大小 */
function AddTCPWindowSize(winsize) {
	var high = (winsize & 0xff00) >> 8;
	var low = winsize & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* 在已构造数据包的前面添加16位TCP校验和，清零 */
function AddTCPCheckSum() {
	return String.fromCodePoint(0x00) + String.fromCodePoint(0x00);
}

/* 更新16位TCP校验和,人为保证此时str[0:20]中TCP包20字节都已经填充完成，前面还没有填以太网头和IP头 */
function UpdateTCPCheckSum(str) {
	var cksum = 0 >>> 0;
	var newstr = new String(str);
	for (var i = 0; i < 20; i++) {
		if (i == 16 || i == 17)
			continue;
		var t = newstr.charCodeAt(i);
		cksum += t;
	}
	cksum = (cksum >> 16) + (cksum & 0xffff);
	cksum += (cksum >> 16);
	cksum = ~cksum;
	var high = (cksum & 0xff00) >> 8;
	var low = cksum & 0x00ff;
	return String.fromCharCode(high) + String.fromCharCode(low);
}

/* 在已构造数据包前面添加2字节紧急指针 */
function getTCPUrgentPointer(up) {
	var high = (up & 0xff00) >> 8;
	var low = up & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/******************************* 以下是添加UDP包 *************************************/

/* 在已构造数据包前面添加2字节 源端口 */
function AddUDPSurcePort(port) {
	var high = (port & 0xff00) >> 8;
	var low = port & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* 在已构造数据包前面添加2字节 目的端口 */
function AddUDPDestinationPort(port) {
	var high = (port & 0xff00) >> 8;
	var low = port & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* 在已构造数据包的前面添加16位TCP校验和，清零 */
function AddUDPCheckSum()
{
	return String.fromCodePoint(0x00) + String.fromCodePoint(0x00);
}

/* 更新16位UDP校验和，注意UDP校验和要带着数据一起计算。人为保证此时str中前8字节为UDP首部，后面为数据 */
function UpdateUDPCheckSum(str)
{
	/* 处理数据包奇数字节方法，计算时结尾填0凑16bit */
	var strt = str;
	if (str.length % 2 == 1)
		strt += String.fromCodePoint(0x00);

	var cksum = 0 >>> 0;
	var newstr = new String(strt);
	for (var i = 0; i < newstr.length; i++) {
		if (i == 6 || i == 7)
			continue;
		var t = newstr.charCodeAt(i);
		cksum += t;
	}
	cksum = (cksum >> 16) + (cksum & 0xffff);
	cksum += (cksum >> 16);
	cksum = ~cksum;
	var high = (cksum & 0xff00) >> 8;
	var low = cksum & 0x00ff;
	//var strarray = newstr.split('');
	//console.log(strarray);
	//strarray[6] = String.fromCharCode(high);
	//strarray[7] = String.fromCharCode(low);
	/* 删掉当初计算添加的一字节 */
	//if (str.length % 2 == 1)
	//	strarray.pop();
	//var mystr = strarray.join('');
	return String.fromCharCode(high) + String.fromCharCode(low);
}

/* 在已构造数据包前面添加2字节长度（UDP头长+数据长度） */
function AddUDPlength(str)
{
	/* 不含伪首部的长度，即首部8字节+数据长度 */
	var length = str.length + 8;
	var high = (length & 0xff00) >> 8;
	var low = length & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

function getTCPHeaderInfo(srcPort,destPort) 
{
	let SourcePort = AddTCPSourcePort(srcPort);
	let DestPort = AddTCPDestinationPort(destPort);
	let seq = AddTCPSequence(0x12345678);
	let acknumber = AddTCPACK(0xabcdef12);
	let headerlengthandrecv = AddTCPHeadLengthandRecv();
	let headerlength = 0x05;
	let recv = 0x00;
	let cwr = true;
	let ece = false;
	let urg = false;
	let ack = false;
	let psh = true;
	let rst = true;
	let syn = false;
	let fin = false;
	let flag = AddTCPFlag(cwr, ece, urg, ack, psh, rst, syn, fin);
	let windowsize = AddTCPWindowSize(0x1234);
	let checksum = AddTCPCheckSum();
	let urgentPointer = AddTCPUrgentPointer(0x0000, str);
	let TCPHeader = SourcePort + DestPort + seq + acknumber + headerlengthandrecv + flag + windowsize + checksum + urgentPointer;
	checksum = UpdateTCPCheckSum(TCPHeader);
	TCPHeader = SourcePort + DestPort + seq + acknumber + headerlengthandrecv + flag + windowsize + checksum + urgentPointer;
	return {
		TCPHeader: TCPHeader,
		explanation: [
			{
				key: "源端口",
				value: SourcePort,
				desc: ""
			},{
				key: "目的端口",
				value: DestPort,
				desc: ""
			},{
				key:"序列号",
				value:seq,
				desc:""
			},{
				key:"应答号",
				value:acknumber,
				desc:""
			},{
				key:"TCP包头长度",
				value:headerlength,
				desc:""
			}, {
				key: "4bit保留位",
				value: recv,
				desc: ""
			},{
				key:"CWR标志",
				value:cwr,
				desc:""
			},{
				key:"ECE标志",
				value:ece,
				desc:""
			},{
				key:"URG标志",
				value:urg,
				desc:""
			}, {
				key: "ACK标志",
				value: ack,
				desc: ""
			},{
				key:"PSH标志",
				value:psh,
				desc:""
			},{
				key:"RST标志",
				value:rst,
				desc:""
			},{
				key:"SYN标志",
				value:syn,
				desc:""
			},{
				key:"FIN标志",
				value:fin,
				desc:""
			},{
				key:"TCP窗体大小",
				value:rst,
				desc:""
			},{
				key:"TCP校验和",
				value:checksum,
				desc:""
			},{
				key:"紧急指针",
				value:urgentPointer,
				desc:""
			}
		]
	}
}

function getUDPHeaderInfo(data,srcPort,destPort)
{
	let SourcePort = AddUDPSourcePort(srcPort);
	let DestPort = AddUDPDestinationPort(destPort);
	let headerlength = AddUDPlength(data);
	let checksum = AddUDPCheckSum();
	let UDPHeader = SourcePort + DestPort + headerlength + checksum;
	let HeaderData = UDPHeader + data;
	checksum = UpdateUDPCheckSum(HeaderData);
	UDPHeader = SourcePort + DestPort + headerlength + checksum;
	return {
		UDPHeader: UDPHeader,
		explanation: [
			{
				key: "源端口",
				value: SourcePort,
				desc: ""
			}, {
				key: "目的端口",
				value: DestPort,
				desc: ""
			},{
				key: "UDP数据包长",
				value: headerlength,
				desc: ""
			},{
				key: "UDP校验和",
				value: checksum,
				desc: ""
			},
		]
	}
}

function getIPHeaderInfo(SrcIP,DesIP)
{
	let IPv = AddVersionLength(4);
	let precedence = 5;
	let d = true;
	let t = false;
	let r = true;
	let c = false;
	let tos = AddTOS(precedence, d, t, r, c);
	let ident = 0x1234;
	let Identifier = AddIdentifier(ident);
	let mf = true;
	let df = false;
	let fo = 0x0123;
	let FlagandFragmentOffset = AddFlagandFragmentOffset(mf,df,fo);
	let ttl = AddTTL(0x40);
	let proctol = AddIPProctol(0);
	let checksum = AddIPCheckSum();
	let sIP = AddSourceIP(SrcIP);
	let dIP = AddDestinationIP(DesIP);
	let str = Identifier + FlagandFragmentOffset + ttl + proctol + checksum + sIP + dIP;;//后面所有部分
	let headlength = AddTotalLength(str);
	let IPHeader = IPv + tos + headlength + str;
	return {
		IPHeader: IPHeader,
		explanation: [
			{
				key: "IP版本",
				value: IPv,
				desc: ""
			}, 
			{
				key: "服务类型",
				value: tos,
				desc: ""
			},{
				key: "服务类型-优先级",
				value: precedence,
				desc: ""
			},{
				key:"服务类型-d标志",
				value:d,
				desc:""
			},{
				key:"服务类型-t标志",
				value:t,
				desc:""
			},{
				key:"服务类型-r标志",
				value:r,
				desc:""
			},{
				key:"服务类型-c标志",
				value:c,
				desc:""
			},{
				key:"IP标识串",
				value:Identifier,
				desc:""
			},{
				key:"mf标志",
				value:mf,
				desc:""
			}, {
				key:"df标志",
				value:df,
				desc:""
			},{
				key: "片偏移",
				value: fo,
				desc: ""
			},{
				key:"ttl",
				value:ttl,
				desc:""
			},{
				key:"IP协议",
				value:proctol,
				desc:""
			},{
				key:"IP包校验和",
				value:checksum,
				desc:""
			}, {
				key: "源IP地址",
				value: sIP,
				desc: ""
			},{
				key:"目的IP地址",
				value:dIP,
				desc:""
			},{
				key:"IP包总长度",
				value:headlength,
				desc:""
			}
		]
	}
}

function getEthernetHeaderInfo(SrcMac,DesMac)
{
	let sMac = AddSourceMac(SrcMac);
	let dMac = AddDestMac(DesMac);
	let type = AddEthernetType("IPv4");
	/* 先不做以太网前导码、开始符、结尾4字节校验、帧间距 */
	//let Preamble = AddPreamble();
	let EthernetHeader = sMac + dMac + type;
	return {
		EthernetHeader: EthernetHeader,
		explanation: [
			{
				key: "源Mac",
				value: sMac,
				desc: ""
			},{
				key: "目的Mac",
				value: dMac,
				desc: ""
			},{
				key: "以太网类型",
				value: type,
				desc: ""
			}]
	};
}

export {getEthernetHeaderInfo,getTCPHeaderInfo,getUDPHeaderInfo,getIPHeaderInfo};

//newstr = AddVersionLength(4,"hello");
//str = AddTOS(4,true,false,true,false,"hello");
//str = AddTotalLength("hello");
//str = AddIdentifier(12009,"hello");
//str = AddFlagandFragmentOffset(true,false,12782,"hello");
//str = AddTTL(127,"hello");
//var testipacket = new String("01234567890123456789");
//console.log(testipacket.length);
//newstr = AddSourceIP("192.168.142.8",testipacket);
//console.log(newstr.length);
//console.log(stringToHex(newstr));
//newstr = AddSourceMac("12:A4:35","hello");
//newstr = AddEthernetType("802.1Q tag",testipacket);
//var newstr = AddPreamble(testipacket);
//console.log(stringToHex(newstr));