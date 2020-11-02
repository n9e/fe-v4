function getApi(path: string) {
  const prefix = '/api/rdb';
  return `${prefix}${path}`;
}

function gethspApi(path: string) {
  const prefix = '/api/rdb';
  return `${prefix}${path}`;
}

const api = {
  sso: gethspApi('/sso'),
  login: getApi('/auth/login'),
  logout: getApi('/auth/logout'),
  selftProfile: getApi('/self/profile'),
  selftPassword: getApi('/self/password'),
  selftToken: getApi('/self/token'),
  user: getApi('/user'),
  users: getApi('/users'),
  tenant: getApi('/tenant'),
  team: getApi('/team'),
  teams: getApi('/teams'),
  configs: getApi('/configs'),
  role: getApi('/role'),
  roles: getApi('/roles'),
  ops: getApi('/ops'),
  log: getApi('/log'),
  homeStatistics: getApi('/home/statistics'),
  project: getApi('/project'),
  projects: getApi('/projects'),
  tree: gethspApi('/tree'),
  node: gethspApi('/node'),
  nodeCate: gethspApi('/node-cate'),
  nodeCates: gethspApi('/node-cates'),
  mgr: gethspApi('/mgr'),
  host: gethspApi('/host'),
  nethw: gethspApi('/nethw'),
  nethws: gethspApi('/nethws'),
  mibs: gethspApi('/mibs'),
  resources: gethspApi('/resources'),
};

export default api;
