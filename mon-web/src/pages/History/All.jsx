/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import _ from 'lodash';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import List from './List';

class index extends Component {
  static contextType = NsTreeContext;

  constructor(props) {
    super(props);
    this.state = {
      nodepathSerach: window.location.search !== '' && this.getQueryVariabe('nodepath'),
    };
  }

  getQueryVariabe = (name) => {
    const h = window.location.href.split('?')[1];
    let pair;
    const vars = h.split('&');
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < vars.length; i++) {
      pair = vars[i].split('=');
      if (pair[0] === name) return pair[1];
    }
    return pair[1];
  }

  render() {
    const { selectedNode } = this.context.data;
    const nodepath = _.get(selectedNode, 'path');
    const nid = _.get(selectedNode, 'id');

    return (
      <List
        nodepath={nodepath || this.state.nodepathSerach}
        nid={nid}
        type="all"
        activeKey="all"
      />
    );
  }
}

export default CreateIncludeNsTree(index, { visible: true });
