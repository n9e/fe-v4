import api from '@common/api';
import request from '@pkgs/request';

export function addSilence(reqData) {
  return request(api.maskconf, {
    method: 'POST',
    body: JSON.stringify(reqData),
  });
}

export function releaseSilence(id) {
  return request(`${api.maskconf}/${id}`, {
    method: 'DELETE',
  });
}
