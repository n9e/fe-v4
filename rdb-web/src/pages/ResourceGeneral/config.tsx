export const Tenant = [
  { name: '弹性云服务器', value: 'virtual', unit:'台' },
  { name: '裸金属服务器', value: 'physical', unit:'台'  },
  { name: '云硬盘', value: 'volume' , unit:'个'},
  // { name: '对象存储',value: 'dstor' },
  { name: '数据库MySQL版', value: 'masql', unit:'台' },
  { name: '数据库Redis版', value: 'redis' , unit:'台'},
  { name: '数据库MongoDB版', value: 'mongo' , unit:'台'},
  // { name: 'Kafka', value:'kafka-topic' },
  { name: 'ElasticSearch', value: 'es', unit:'个' },
  // { name: '容器', value:'container' }
];

export const ResuorceTrend = [
  {
    ident: 'instances', // 3406
    name: '弹性云服务器',
    api: '/zstack/v1/cmp/dashboard/manager/resource/used',
  }, {
    ident: 'baremetals', // 3406
    name: '裸金属服务器',
    api: '/zstack/v1/cmp/dashboard/manager/resource/used',
  }, {
    ident: 'volumes', // 3406
    name: '云硬盘',
    api: '/zstack/v1/cmp/dashboard/manager/resource/used',
  }, {
    ident: 'dstore', // 3424
    name: '对象存储',
    api: '/dicloud/cluster/statis/bucketIncrement',
  }, {
    ident: 'kafka', // 3428
    name: 'Kafka',
    api: '/kafka/api/v1/third-part/topic/created/trend',
  }, {
    ident: 'es', // 3430
    name: 'ElasticSearch',
    api: '/api/es/admin/v3/thirdpart/overview/indexTempLateTrendStatis',
  }, {
    ident: 'ccp', // 3432
    name: '容器',
    api: '/api/ccpapi/data/trend/apply?type=ccp',
  },
];


export function parseJSON(json: string) {
  if (typeof json === 'string') {
    let paresed;
    try {
      paresed = JSON.parse(json);
    } catch (e) {
      console.log(e);
    }
    return paresed;
  }
  return undefined;
}

// 用量统计
export const UsageStat = [
  {
    ident: 'zstack', // 3408 多云
    name: '计算',
    index: 1,
    title: ['弹性云服务器', '裸金属服务器'],
    api: '/zstack/v1/cmp/dashboard/manager/capacity/used',
  }, {
    ident: 'dstore', // 3398 对象存储
    name: '存储',
    index: 2,
    title: ['云硬盘', '对象存储'],
    api: '/api/screen/view/dstore/res'
  }, {
    ident: 'db', // 3400
    name: '数据库',
    index: 3,
    title: ['数据库MySQL版', '数据库MongoDB版', '数据库Redis版'],
    api: '/api/screen/view/db/res',
  }, {
    ident: 'ccp', // 3402
    name: '容器',
    index: 4,
    title: ['容器'],
    api: '/api/screen/view/ccp/res',
  },
];
