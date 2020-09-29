import api from '@common/api';
import request from '@pkgs/request';

export const getList = () => {
  return request(api.nginx);
};

export const getSignalList = (value) => {
  return request(`${api.nginxSearch}?value=${value}`);
};

export const getTreeData = () => {
  return request(api.tree);
};

export const addList = (body) => {
  return request(api.nginx, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};
export const deletenginx = (ids) => {
  return request(api.nginx, {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
};

export const updateList = (body) => {
  return request(api.nginx, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};
