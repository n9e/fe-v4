import api from '@common/api';
import request from '@pkgs/request';

export function getStrategies() {
  return request(api.stra);
}

export function addStrategy(reqData) {
  return request(api.stra, {
    method: 'POST',
    body: JSON.stringify(reqData),
  });
}

export function delStrategy(ids) {
  return request(api.stra, {
    method: 'DELETE',
    body: JSON.stringify({
      ids,
    }),
  });
}

export function getStrategy(id) {
  return request(`${api.stra}/${id}`);
}

export function modifyStrategy(reqData) {
  return request(api.stra, {
    method: 'PUT',
    body: JSON.stringify(reqData),
  });
}
