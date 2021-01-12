function getApi(sys: string, path: string) {
  const prefix = '/api/';
  return `${prefix}${sys}${path}`;
}

const api = {
  tree: getApi('rdb', '/tree'),
  node: getApi('rdb', '/node'),
  hosts: getApi('ams-ce', '/hosts'),
  teams: getApi('rdb', '/teams'),
  users: getApi('rdb', '/users'),

  tmpchart: getApi('mon', '/tmpchart'),
  monNode: getApi('mon', '/node'),
  screen: getApi('mon', '/screen'),
  subclass: getApi('mon', '/subclass'),
  stra: getApi('mon', '/stra'),
  event: getApi('mon', '/event'),
  chart: getApi('mon', '/chart'),
  collect: getApi('mon', '/collect'),
  collectRules:getApi('mon', '/collect-rules/types'),
  getRulesList:getApi('mon', '/collect-rules/list'),
  handlerRules:getApi('mon', '/collect-rules'),
  networkCollect: getApi('mon-ee', '/collect'),
  maskconf: getApi('mon', '/maskconf'),
  snmp: getApi('mon-ee', '/snmp'),
  metricsPods: getApi('mon', '/index/metrics'),
  tagkvPods: getApi('mon', '/index/tagkv'),
  aggr: getApi('mon', '/aggr'),
  metrics: getApi('index', '/metrics'),
  tagkv: getApi('index', '/tagkv'),
  fullmatch: getApi('index', '/counter/fullmatch'),
  points: getApi('transfer', '/data/ui'),
  nginx: getApi('mon-ee', '/nginx-log-configs'),
  nginxSearch: getApi('mon-ee', '/nginx-log-config'),
  binlog: getApi('mon-ee', '/binlog-configs'),
  binlogSearch: getApi('mon-ee', '/binlog-config'),


  bigScreen: '/api/v1/dashboard',

};

export default api;
