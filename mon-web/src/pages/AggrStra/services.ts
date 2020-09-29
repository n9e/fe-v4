import _ from 'lodash';
import request from '@pkgs/request';
import api from '@common/api';

export const getTreeData = () => {
  return request(api.tree);
}

export const getAggrStraList = (nid: number) => {
  return request(`${api.aggr}?nid=${nid}`);
}

export const deleteAggrStra = (ids: number | number[]) => {
  if (_.isNumber(ids)) {
    ids = [ids];
  }
  return request(api.aggr, {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

export const addAggrStra = (body: any) => {
  return request(api.aggr, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export const modifyAggrStra = (body: any) => {
  return request(api.aggr, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

type EndpointsType = string | number | string[] | number[];

function normalizeEndpoints(endpoints: EndpointsType) {
  if (endpoints) {
    const newEndpoints = _.isArray(endpoints) ? endpoints : [endpoints];
    return _.map(newEndpoints, item => _.toString(item));
  }
  return undefined;
}

export function getHabitsId() {
  // return request(`${api.habits}/identity`);
}

export function getEndPoints(nid: number) {
  return request({
    url: `${api.node}/${nid}/resources?limit=10000`,
  }, false).then((data) => {
    return data.list;
  });
}

export function getMetrics(selectedEndpoint: EndpointsType, endpointsKey = 'endpoints') {
  return request(endpointsKey === 'endpoints' ? api.metrics : api.metricsPods, {
    method: 'POST',
    body: JSON.stringify({
      [endpointsKey]: normalizeEndpoints(selectedEndpoint),
    }),
  }).then((data) => {
    return _.chain(data.metrics).flattenDeep().union().sortBy((o) => {
      return _.lowerCase(o);
    }).value();
  });
}

export function getTagkv(selectedEndpoint: EndpointsType, selectedMetric: string | string[], endpointsKey = 'endpoints') {
  return request(endpointsKey === 'endpoints' ? api.tagkv : api.tagkvPods, {
    method: 'POST',
    body: JSON.stringify({
      [endpointsKey]: normalizeEndpoints(selectedEndpoint),
      metrics: _.isArray(selectedMetric) ? selectedMetric : [selectedMetric],
    }),
  }, false).then((data) => {
    let newTagkv: any[] = [];
    _.each(data, (item) => {
      const { tagkv } = item;
      newTagkv = [
        ...tagkv || [],
      ];
    });
    return newTagkv;
  });
}
