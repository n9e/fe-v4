import _ from 'lodash';

export function valToArray(val) {
  if (_.isString(val) && val) {
    return _.split(val, ',');
  }
  return [];
}

export function valToString(val) {
  if (_.isArray(val) && val.length) {
    return _.join(val, ',');
  }
  return '';
}
