function getApi(sys: string, path: string) {
  const prefix = '/api/';
  return `${prefix}${sys}${path}`;
}

const api = {
  tree: getApi('rdb', '/tree'),
  node: getApi('rdb', '/node'),

};

export default api;
