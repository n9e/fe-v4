import api from '@common/api';
import request from '@pkgs/request';

export const getList = () => {
  return request(api.binlog);
};

export const getSignalList = (id) => {
  return request(`${api.binlogSearch}/${id}`);
};

export const getTreeData = () => {
  return request(api.tree);
};

export const addList = (body) => {
  return request(api.binlog, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};
export const deletebinlog = (ids) => {
  return request(api.binlog, {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
};

export const updateList = (body) => {
  return request(api.binlog, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};
