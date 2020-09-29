function getApi(sys: string, path: string) {
  const prefix = '/api/';
  return `${prefix}${sys}${path}`;
}

const api = {
  // instGroups: getApi('job-ce', '/inst-groups'),
  // instGroup: getApi('job-ce', '/inst-group'),
  tasktpls: getApi('job-ce', '/task-tpls'),
  tasktpl: getApi('job-ce', '/task-tpl'),
  tasks: getApi('job-ce', '/tasks'),
  task: getApi('job-ce', '/task'),
  perms: getApi('job-ce', '/builtin-perms'),
};

export default api;
