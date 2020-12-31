import React, { Component } from 'react';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import List from './List';

class index extends Component {
  static contextType = NsTreeContext;

  render() {
    const { selectedNode } = this.context.data;
    const nodepath = _.get(selectedNode, 'path');
    const nid = _.get(selectedNode, 'id');

    if (!nid) {
      return (
        <div>
          <FormattedMessage id="node.select.help" />
        </div>
      );
    }

    return (
      <List
        nodepath={nodepath}
        nid={nid}
        type="alert"
        activeKey="alert"
      />
    );
  }
}

export default CreateIncludeNsTree(index, { visible: true });
