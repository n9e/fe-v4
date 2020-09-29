import React, { Component } from 'react';
import { message } from 'antd';
import queryString from 'query-string';
import _ from 'lodash';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import api from '@common/api';
import request from '@pkgs/request';
import SettingFields from './SettingFields';
import { addStrategy } from './services';
import './style.less';

class Add extends Component {
  handleSubmit = (values) => {
    const search = _.get(this.props, 'location.search');
    const query = queryString.parse(search);
    const { history } = this.props;
    addStrategy(values).then((res) => {
      message.success('添加报警策略成功!');
      history.push({
        pathname: '/strategy',
      });
      if (query.cid && res.id) {
        request(`${api.collect}/api/stra`, {
          method: 'POST',
          body: JSON.stringify({
            cid: Number(query.cid),
            sid: res.id,
          }),
        });
      }
    });
  }

  render() {
    const search = _.get(this.props, 'location.search');
    const query = queryString.parse(search);
    const nid = _.toNumber(query.nid);
    const initialValues = { nid };

    if (query.metric && query.endpoints && query.path && query.method && query.port) {
      const endpoints = _.split(query.endpoints, ',');
      const path = _.split(query.path, ',');
      const method = _.split(query.method, ',');
      const port = _.split(query.port, ',');
      initialValues.exprs = [{
        metric: query.metric,
        eopt: '!=',
        func: 'happen',
        params: [1],
        threshold: 0,
      }];
      initialValues.tags = [{
        tkey: 'endpoint',
        tval: endpoints,
        topt: '=',
      }, {
        tkey: 'path',
        tval: path,
        topt: '=',
      }, {
        tkey: 'method',
        tval: method,
        topt: '=',
      }, {
        tkey: 'port',
        tval: port,
        topt: '=',
      }];
    }
    return (
      <div>
        <SettingFields
          onSubmit={this.handleSubmit}
          initialValues={initialValues}
        />
      </div>
    );
  }
}

export default CreateIncludeNsTree(Add);
