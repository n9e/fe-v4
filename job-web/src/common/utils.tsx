import _ from 'lodash';

export const getFirstPath = (path: string) => {
  return _.get(_.split(path, '/'), '[1]');
};
