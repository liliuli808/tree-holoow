export interface City {
    name: string;
}

export interface Province {
    name: string;
    cities: City[];
}

export const REGIONS: Province[] = [
    {
        name: '北京',
        cities: [{ name: '北京市' }]
    },
    {
        name: '上海',
        cities: [{ name: '上海市' }]
    },
    {
        name: '广东',
        cities: [
            { name: '广州' }, { name: '深圳' }, { name: '珠海' }, { name: '汕头' },
            { name: '佛山' }, { name: '韶关' }, { name: '湛江' }, { name: '肇庆' },
            { name: '江门' }, { name: '茂名' }, { name: '惠州' }, { name: '梅州' },
            { name: '汕尾' }, { name: '河源' }, { name: '阳江' }, { name: '清远' },
            { name: '东莞' }, { name: '中山' }, { name: '潮州' }, { name: '揭阳' },
            { name: '云浮' }
        ]
    },
    {
        name: '浙江',
        cities: [
            { name: '杭州' }, { name: '宁波' }, { name: '温州' }, { name: '嘉兴' },
            { name: '湖州' }, { name: '绍兴' }, { name: '金华' }, { name: '衢州' },
            { name: '舟山' }, { name: '台州' }, { name: '丽水' }
        ]
    },
    {
        name: '江苏',
        cities: [
            { name: '南京' }, { name: '无锡' }, { name: '徐州' }, { name: '常州' },
            { name: '苏州' }, { name: '南通' }, { name: '连云港' }, { name: '淮安' },
            { name: '盐城' }, { name: '扬州' }, { name: '镇江' }, { name: '泰州' },
            { name: '宿迁' }
        ]
    },
    {
        name: '四川',
        cities: [
            { name: '成都' }, { name: '绵阳' }, { name: '自贡' }, { name: '攀枝花' },
            { name: '泸州' }, { name: '德阳' }, { name: '广元' }, { name: '遂宁' },
            { name: '内江' }, { name: '乐山' }, { name: '南充' }, { name: '眉山' },
            { name: '宜宾' }, { name: '广安' }, { name: '达州' }, { name: '雅安' },
            { name: '巴中' }, { name: '资阳' }, { name: '阿坝' }, { name: '甘孜' },
            { name: '凉山' }
        ]
    },
    {
        name: '湖北',
        cities: [{ name: '武汉' }, { name: '黄石' }, { name: '十堰' }, { name: '宜昌' }, { name: '襄阳' }, { name: '鄂州' }, { name: '荆门' }, { name: '孝感' }, { name: '荆州' }, { name: '黄冈' }, { name: '咸宁' }, { name: '随州' }, { name: '恩施' }]
    },
    {
        name: '福建',
        cities: [{ name: '福州' }, { name: '厦门' }, { name: '莆田' }, { name: '三明' }, { name: '泉州' }, { name: '漳州' }, { name: '南平' }, { name: '龙岩' }, { name: '宁德' }]
    },
    {
        name: '山东',
        cities: [{ name: '济南' }, { name: '青岛' }, { name: '淄博' }, { name: '枣庄' }, { name: '东营' }, { name: '烟台' }, { name: '潍坊' }, { name: '济宁' }, { name: '泰安' }, { name: '威海' }, { name: '日照' }, { name: '临沂' }, { name: '德州' }, { name: '聊城' }, { name: '滨州' }, { name: '菏泽' }]
    },
    // Add more as needed... for demo purpose this is good enough to show the UI
];
