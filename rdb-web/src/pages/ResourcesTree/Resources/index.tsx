import React, { Component }from 'react';
import _ from 'lodash';
import {
  Dropdown, Menu, Button, Modal, message,
} from 'antd';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import { BatchMod } from '@cpts/ResourceEdit';
import exportResources from '@common/exportResources';
import Resources from '@cpts/Resources';
import BatchBind from '@cpts/Resources/BatchBind';
import request from '@pkgs/request';
import api from '@pkgs/api';

class index extends Component<WrappedComponentProps> {
  static contextType = NsTreeContext;

  table: any;

  exportFunc = async (fetchData: any) => {
    const result = await fetchData({ limit: 10000 });
    if (result) {
      const { data } = result;
      const newData = _.map(data, (item) => ({
        ...item,
        nodes: _.join(_.map(item.nodes, (item) => item.path), '\n\r'),
      }));
      exportResources(newData, ['nodes']);
    }
  }

  handleBatchBindHostsBtnClick = (node: any) => {
    if (node.leaf === 0) {
      message.info('只能在叶子节点挂载机器');
      return;
    }
    BatchBind({
      title: this.props.intl.formatMessage({ id: 'resource.batch.operations.mount' }),
      language: this.props.intl.locale,
      selectedNode: node,
      onOk: () => {
        this.table.reload();
      },
    });
  }

  handleBatchUnBindHostsBtnClick = (selectedHosts: any, node: any) => {
    if (node.leaf === 0) {
      message.info('只能在叶子节点解挂机器');
      return;
    }
    Modal.confirm({
      content: this.props.intl.formatMessage({ id: 'resource.batch.operations.unmount.sure' }),
      onOk: () => {
        request(`${api.node}/${node.id}/resources/unbind`, {
          method: 'POST',
          body: JSON.stringify({
            ids: _.map(selectedHosts, 'id'),
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'resource.unmount.success' }));
          this.table.reload();
        });
      },
    });
  }

  handleModifyBtnClick = (record: any, nid: number) => {
    BatchMod({
      language: this.props.intl.locale,
      title: <FormattedMessage id="resource.batch.operations.modify.note" />,
      field: 'note',
      url: `${api.node}/${nid}/resources/note`,
      selected: [record],
      onOk: () => {
        this.table.reload();
      },
    });
  }

  handleBatchModifyNoteBtnClick = (selected: any, nid: number) => {
    BatchMod({
      language: this.props.intl.locale,
      title: <FormattedMessage id="resource.batch.operations.modify.note" />,
      field: 'note',
      url: `${api.node}/${nid}/resources/note`,
      selected,
      onOk: () => {
        this.table.reload();
      },
    });
  }

  handleLabelModifyNoteBtnClick = (selected: any, nid: number) => {
    BatchMod({
      language: this.props.intl.locale,
      title: '修改标签',
      field: 'labels',
      url: `${api.node}/${nid}/resources/labels`,
      selected,
      onOk: () => {
        this.table.reload();
      },
    });
  }

  render() {
    return (
      <NsTreeContext.Consumer>
        {
          (context) => {
            const { selectedNode } = context.data;
            if (!selectedNode) return <FormattedMessage id="tree.select.node" />;
            return (
              <Resources
                mode="resourcesTree"
                intl={this.props.intl}
                ref={(ref) => { this.table = ref; }}
                fetchUrl={`${api.node}/${selectedNode.id}/resources`}
                export={this.exportFunc}
                renderOper={(record) => (
                  <span>
                    <a onClick={() => { this.handleModifyBtnClick(record, selectedNode.id); }}>
                      <FormattedMessage id="table.modify" />
                    </a>
                  </span>
                )}
                renderBatchOper={(selectedResources) => (
                  <Dropdown
                    overlay={(
                      <Menu>
                        <Menu.Item>
                          <Button type="link" onClick={() => { this.handleBatchBindHostsBtnClick(selectedNode); }}>
                            <FormattedMessage id="resource.batch.operations.mount" />
                          </Button>
                        </Menu.Item>
                        <Menu.Item>
                          <Button type="link" disabled={_.isEmpty(selectedResources)} onClick={() => { this.handleBatchUnBindHostsBtnClick(selectedResources, selectedNode); }}>
                            <FormattedMessage id="resource.batch.operations.unmount" />
                          </Button>
                        </Menu.Item>
                        <Menu.Item>
                          <Button type="link" disabled={_.isEmpty(selectedResources)} onClick={() => { this.handleBatchModifyNoteBtnClick(selectedResources, selectedNode.id); }}>
                            <FormattedMessage id="resource.batch.operations.modify.note" />
                          </Button>
                        </Menu.Item>
                        <Menu.Item>
                          <Button type="link" disabled={_.isEmpty(selectedResources)} onClick={() => { this.handleLabelModifyNoteBtnClick(selectedResources, selectedNode.id); }}>
                            修改标签
                          </Button>
                        </Menu.Item>
                      </Menu>
                    )}
                  >
                    <Button icon="down"><FormattedMessage id="resource.batch.operations" /></Button>
                  </Dropdown>
                )}
              />
            );
          }
        }
      </NsTreeContext.Consumer>
    );
  }
}

export default injectIntl(index);
