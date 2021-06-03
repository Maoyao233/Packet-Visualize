/* 16���ư�λ����ַ����ڴ棬������ */
function stringToHex(str) {
	var arr = [];
	for (var i = 0; i < str.length; i++)
		arr[i] = (str.charCodeAt(i).toString(16)).slice(-4);
	return "\\0x" + arr.join("\\0x");
};

/***************************** ������IP������ ***************************************/


/* ���IPv4/6�汾ͷ4λ�Լ��ײ�����4λ[20/4-60/4] */
/* 40�ֽڿ�ѡ������� */
function AddVersionLength(IPv) {
	/* IP�汾ö�����ͣ�IPv4/6��*/
	var IPVersion =
	{
		IPv4: 4,
		IPv6: 6
	};
	/* �ײ�����Ĭ��20����4λ��4 */
	var iphead = 0x05;
	if (IPv == IPVersion.IPv4)
		iphead |= 0x40;
	else if (IPv == IPVersion.IPv6)
		iphead |= 0x60;
	/* �������һ�ֽڵ����ַ��� */
	return String.fromCodePoint(iphead);
}

/*	
	��ӷ������ͣ�����Ϊ8λ��bit��������ɣ�
	ǰ3λΪ���ȼ���Precedence����
	��4λ��־λ�����1λ����δ�á�
	������Number[0,7]��4��bool��ԭ��
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
	���IP���ܳ��� 
	��Ϊ��֤�����ַ������Ѿ�����˺���������Ϣ�Ĵ�
*/
function AddTotalLength(str) {
	var length = str.length + 4;				//����4�ֽ�
	var length_high = (length & 0xff00) >> 8;	//2�ֽڳ��ȸ��ֽ�
	var length_low = length & 0x00ff;			//2�ֽڳ��ȵ��ֽ�
	return String.fromCodePoint(length_high) + String.fromCodePoint(length_low);
}

/* ��ӷ�Ƭ�ı�ʶ��2�ֽ� */
function AddIdentifier(ident) {
	var ident_high = (ident & 0xff00) >> 8;	//2�ֽڳ��ȸ��ֽ�
	var ident_low = ident & 0x00ff;			//2�ֽڳ��ȵ��ֽ�
	return String.fromCodePoint(ident_high) + String.fromCodePoint(ident_low);
}

/* 
	6����־��Flags��
	����Ϊ3λ����λ�����ҷֱ���MF��DF��δ�á�
	MF=1��ʾ���滹�зֶε����ݰ���MF=0��ʾû�и����Ƭ�������һ����Ƭ����
	DF=1��ʾ·�������ܶԸ����ݰ��ֶΣ�DF=0��ʾ���ݰ����Ա��ֶΡ�
	7��ƫ������Fragment Offset��
	Ҳ�ƶ�ƫ�ƣ����ڱ�ʶ�����ݶ����ϲ��ʼ���ݱ����е�ƫ������
	���ĳ�������ֶε��ϲ㱨�ĵ�IP���ݰ��ڴ���ʱ��ʧ��
	������һϵ�а����ֶε��ϲ����ݰ���IP������Ҫ���ش���
	������bool,bool,number,str
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

/* ���ʮ����IPv4��ַת32λ���� */
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
	//����ܹؼ�����Ȼ���ܻ���ָ��������
	return num;
}

/*	���8λIPЭ���
	���뺬��μ���https://www.cnblogs.com/classics/p/10417402.html 
*/
function AddIPProctol(pro) {
	return String.fromCodePoint((pro >>> 0) & 0xff);
}

/* ���16λУ��ͣ����� */
function AddIPCheckSum() {
	return String.fromCodePoint(0x00) + String.fromCodePoint(0x00);
}

/* ����16λУ���,��Ϊ��֤��ʱstr[0:20]��IP��20�ֽڶ��Ѿ������ɣ�ǰ�滹û������̫��ͷ */
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

/* ���Դip��ַ,������ʽ���ʮ����ip��ַ */
function AddSourceIP(ip) {
	var ipnum = IPToNumber(ip);
	var ip0 = String.fromCharCode((ipnum & 0xff000000) >> 24);
	var ip1 = String.fromCharCode((ipnum & 0x00ff0000) >> 16);
	var ip2 = String.fromCharCode((ipnum & 0x0000ff00) >> 8);
	var ip3 = String.fromCharCode((ipnum & 0x000000ff));
	var newstr = ip0 + ip1 + ip2 + ip3;
	return newstr;
}

/* ���Ŀ��ip��ַ,������ʽ���ʮ����ip��ַ */
function AddDestinationIP(ip) {
	var ipnum = IPToNumber(ip);
	var ip0 = String.fromCharCode((ipnum & 0xff000000) >> 24);
	var ip1 = String.fromCharCode((ipnum & 0x00ff0000) >> 16);
	var ip2 = String.fromCharCode((ipnum & 0x0000ff00) >> 8);
	var ip3 = String.fromCharCode((ipnum & 0x000000ff));
	var newstr = ip0 + ip1 + ip2 + ip3;
	return newstr;
}

/******************************* �����������̫��֡ *************************************/
/* ���ѹ������ݰ�ǰ�����Դmac��ַ ������ʽ"xx:xx:xx"�ַ��� */
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

/* ���ѹ������ݰ�ǰ�����Ŀ��mac��ַ ������ʽ"xx:xx:xx"�ַ��� */
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

/* ���ѹ������ݰ�ǰ�������̫������2�ֽ� 
	��̫�����Ͳ�����ʽΪ�����ַ��� 
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

/* ���ѹ������ݰ�ǰ�������̫��֡ǰ���루7�ֽڣ���֡��ʼ����1�ֽڣ� */
function AddPreamble() {
	return String.fromCodePoint(0x55) + String.fromCodePoint(0x55) + String.fromCodePoint(0x55) +
		String.fromCodePoint(0x55) + String.fromCodePoint(0x55) + String.fromCodePoint(0x55) +
		String.fromCodePoint(0x55) + String.fromCodePoint(0xD5);
}

/******************************* ���������TCP�� *************************************/

/* ���ѹ������ݰ�ǰ�����2�ֽ� Դ�˿� */
function AddTCPSourcePort(port) {
	var high = (port & 0xff00) >> 8;
	var low = port & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* ���ѹ������ݰ�ǰ�����2�ֽ� Ŀ�Ķ˿� */
function AddTCPDestinationPort(port) {
	var high = (port & 0xff00) >> 8;
	var low = port & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* ���ѹ������ݰ�ǰ�����4�ֽ�TCP���к� */
function AddTCPSequence(seq) {
	var seq0 = String.fromCharCode((seq & 0xff000000) >> 24);
	var seq1 = String.fromCharCode((seq & 0x00ff0000) >> 16);
	var seq2 = String.fromCharCode((seq & 0x0000ff00) >> 8);
	var seq3 = String.fromCharCode((seq & 0x000000ff));
	var newstr = seq0 + seq1 + seq2 + seq3;
	return newstr;
}

/* ���ѹ������ݰ�ǰ�����4�ֽ�TCP ACK */
function AddTCPACK(ack) {
	var ack0 = String.fromCharCode((ack & 0xff000000) >> 24);
	var ack1 = String.fromCharCode((ack & 0x00ff0000) >> 16);
	var ack2 = String.fromCharCode((ack & 0x0000ff00) >> 8);
	var ack3 = String.fromCharCode((ack & 0x000000ff));
	var newstr = ack0 + ack1 + ack2 + ack3;
	return newstr;
}


/* ���ѹ������ݰ�ǰ�����4bit TCP�����ȣ���λ32bit����4bit�������� */
function AddTCPHeadLengthandRecv() {
	/* �޿�ѡ���TCP����20�ֽڣ����ͷ����д5 */
	return String.fromCodePoint(0x50);
}

/*	���ѹ������ݰ�ǰ�����8bit��־λ
	CWR(Congestion Window Reduce)��ӵ�����ڼ��ٱ�־��������������
	ECE(ECN Echo)��ECN��Ӧ��־
	URG(Urgent)������(The urgent pointer) ��־
	ACK(Acknowledgment)��ȡֵ1����Acknowledgment Number�ֶ���Ч������һ��ȷ�ϵ�TCP����ȡֵ0����ȷ�ϰ���
	PSH(Push)���ñ�־��λʱ��һ���Ǳ�ʾ���Ͷ˻������Ѿ�û�д����͵����ݣ����ն˲��������ݽ��ж��д������Ǿ����ܿ콫����ת��Ӧ�ô���
	RST(Reset)�����ڸ�λ��Ӧ��TCP���ӡ�ͨ���ڷ����쳣���ߴ����ʱ��ᴥ����λTCP���ӡ�
	SYN(Synchronize)��ͬ�����б��(Synchronize Sequence Numbers)��Ч��
	FIN(Finish)�����иñ�־��λ�����ݰ���������һ��TCP�Ự
	������8��bool+str
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

/* ���ѹ������ݰ�ǰ�����2�ֽڴ����С */
function AddTCPWindowSize(winsize) {
	var high = (winsize & 0xff00) >> 8;
	var low = winsize & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* ���ѹ������ݰ���ǰ�����16λTCPУ��ͣ����� */
function AddTCPCheckSum() {
	return String.fromCodePoint(0x00) + String.fromCodePoint(0x00);
}

/* ����16λTCPУ���,��Ϊ��֤��ʱstr[0:20]��TCP��20�ֽڶ��Ѿ������ɣ�ǰ�滹û������̫��ͷ��IPͷ */
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

/* ���ѹ������ݰ�ǰ�����2�ֽڽ���ָ�� */
function getTCPUrgentPointer(up) {
	var high = (up & 0xff00) >> 8;
	var low = up & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/******************************* ���������UDP�� *************************************/

/* ���ѹ������ݰ�ǰ�����2�ֽ� Դ�˿� */
function AddUDPSurcePort(port) {
	var high = (port & 0xff00) >> 8;
	var low = port & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* ���ѹ������ݰ�ǰ�����2�ֽ� Ŀ�Ķ˿� */
function AddUDPDestinationPort(port) {
	var high = (port & 0xff00) >> 8;
	var low = port & 0x00ff;
	return String.fromCodePoint(high) + String.fromCodePoint(low);
}

/* ���ѹ������ݰ���ǰ�����16λTCPУ��ͣ����� */
function AddUDPCheckSum()
{
	return String.fromCodePoint(0x00) + String.fromCodePoint(0x00);
}

/* ����16λUDPУ��ͣ�ע��UDPУ���Ҫ��������һ����㡣��Ϊ��֤��ʱstr��ǰ8�ֽ�ΪUDP�ײ�������Ϊ���� */
function UpdateUDPCheckSum(str)
{
	/* �������ݰ������ֽڷ���������ʱ��β��0��16bit */
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
	/* ɾ������������ӵ�һ�ֽ� */
	//if (str.length % 2 == 1)
	//	strarray.pop();
	//var mystr = strarray.join('');
	return String.fromCharCode(high) + String.fromCharCode(low);
}

/* ���ѹ������ݰ�ǰ�����2�ֽڳ��ȣ�UDPͷ��+���ݳ��ȣ� */
function AddUDPlength(str)
{
	/* ����α�ײ��ĳ��ȣ����ײ�8�ֽ�+���ݳ��� */
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
				key: "Դ�˿�",
				value: SourcePort,
				desc: ""
			},{
				key: "Ŀ�Ķ˿�",
				value: DestPort,
				desc: ""
			},{
				key:"���к�",
				value:seq,
				desc:""
			},{
				key:"Ӧ���",
				value:acknumber,
				desc:""
			},{
				key:"TCP��ͷ����",
				value:headerlength,
				desc:""
			}, {
				key: "4bit����λ",
				value: recv,
				desc: ""
			},{
				key:"CWR��־",
				value:cwr,
				desc:""
			},{
				key:"ECE��־",
				value:ece,
				desc:""
			},{
				key:"URG��־",
				value:urg,
				desc:""
			}, {
				key: "ACK��־",
				value: ack,
				desc: ""
			},{
				key:"PSH��־",
				value:psh,
				desc:""
			},{
				key:"RST��־",
				value:rst,
				desc:""
			},{
				key:"SYN��־",
				value:syn,
				desc:""
			},{
				key:"FIN��־",
				value:fin,
				desc:""
			},{
				key:"TCP�����С",
				value:rst,
				desc:""
			},{
				key:"TCPУ���",
				value:checksum,
				desc:""
			},{
				key:"����ָ��",
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
				key: "Դ�˿�",
				value: SourcePort,
				desc: ""
			}, {
				key: "Ŀ�Ķ˿�",
				value: DestPort,
				desc: ""
			},{
				key: "UDP���ݰ���",
				value: headerlength,
				desc: ""
			},{
				key: "UDPУ���",
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
	let str = Identifier + FlagandFragmentOffset + ttl + proctol + checksum + sIP + dIP;;//�������в���
	let headlength = AddTotalLength(str);
	let IPHeader = IPv + tos + headlength + str;
	return {
		IPHeader: IPHeader,
		explanation: [
			{
				key: "IP�汾",
				value: IPv,
				desc: ""
			}, 
			{
				key: "��������",
				value: tos,
				desc: ""
			},{
				key: "��������-���ȼ�",
				value: precedence,
				desc: ""
			},{
				key:"��������-d��־",
				value:d,
				desc:""
			},{
				key:"��������-t��־",
				value:t,
				desc:""
			},{
				key:"��������-r��־",
				value:r,
				desc:""
			},{
				key:"��������-c��־",
				value:c,
				desc:""
			},{
				key:"IP��ʶ��",
				value:Identifier,
				desc:""
			},{
				key:"mf��־",
				value:mf,
				desc:""
			}, {
				key:"df��־",
				value:df,
				desc:""
			},{
				key: "Ƭƫ��",
				value: fo,
				desc: ""
			},{
				key:"ttl",
				value:ttl,
				desc:""
			},{
				key:"IPЭ��",
				value:proctol,
				desc:""
			},{
				key:"IP��У���",
				value:checksum,
				desc:""
			}, {
				key: "ԴIP��ַ",
				value: sIP,
				desc: ""
			},{
				key:"Ŀ��IP��ַ",
				value:dIP,
				desc:""
			},{
				key:"IP���ܳ���",
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
	/* �Ȳ�����̫��ǰ���롢��ʼ������β4�ֽ�У�顢֡��� */
	//let Preamble = AddPreamble();
	let EthernetHeader = sMac + dMac + type;
	return {
		EthernetHeader: EthernetHeader,
		explanation: [
			{
				key: "ԴMac",
				value: sMac,
				desc: ""
			},{
				key: "Ŀ��Mac",
				value: dMac,
				desc: ""
			},{
				key: "��̫������",
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