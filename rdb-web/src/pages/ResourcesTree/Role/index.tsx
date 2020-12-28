import React, { Component }from 'react';
import {
  Row, Col, Button, Popconfirm, message,
} from 'antd';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import _ from 'lodash';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import FetchTable from '@pkgs/FetchTable';
import api from '@pkgs/api';
import request from '@pkgs/request';
import UserSelect from '@pkgs/UserSelect';
import CreateRole from './CreateRole';

interface State {
  username?: string,
  selectedNodeId?: number,
  selectedNode?: any,
}

class index extends Component<WrappedComponentProps, State> {
  table: any;

  state = {} as State;

  componentDidMount() {
    const selectedTreeNode = this.context.getSelectedNode();
    if (selectedTreeNode) {
      this.setState({
        selectedNodeId: selectedTreeNode.id,
        selectedNode: selectedTreeNode,
      });
    }
  }

  componentWillReceiveProps = async (_nextProps: any, nextContext: any) => {
    const selectedTreeNode = this.context.getSelectedNode();
    const nextSelectedTreeNode = nextContext.getSelectedNode();
    if (nextSelectedTreeNode && !_.isEqual(selectedTreeNode, nextSelectedTreeNode)) {
      this.setState({
        selectedNodeId: nextSelectedTreeNode.id,
        selectedNode: nextSelectedTreeNode,
      });
    }
  }


  handleSelectUserChange = (value: string) => {
    this.setState({ username: value }, () => {
      this.table.reload();
    });
  }

  handlePostBtnClick = (selectedNode: any) => {
    CreateRole({
      language: this.props.intl.locale,
      selectedNode,
      onOk: () => {
        this.table.reload();
      },
    });
  }

  handleDelBtnClick = (nodeId: number, username: string, roleId: number) => {
    request(`${api.node}/${nodeId}/roles`, {
      method: 'DELETE',
      body: JSON.stringify({
        username,
        role_id: roleId,
      }),
    }).then(() => {
      this.table.reload();
      message.success(this.props.intl.formatMessage({ id: 'msg.delete.success' }));
    });
  }

  render() {
    const { username, selectedNodeId, selectedNode } = this.state;
    if (!selectedNodeId) return <FormattedMessage id="tree.select.node" />;
    return (
      <>
        <Row>
          <Col span={16} className="mb10">
            <UserSelect
              value={username}
              optionKey="username"
              onChange={this.handleSelectUserChange}
            />
          </Col>
          <Col span={8} className="textAlignRight">
            <Button onClick={() => this.handlePostBtnClick(selectedNode)} icon="plus">
              <FormattedMessage id="resource.role.create" />
            </Button>
          </Col>
        </Row>
        <FetchTable
          ref={(ref: any) => this.table = ref}
          url={`${api.node}/${selectedNodeId}/roles`}
          query={{ username }}
          tableProps={{
            columns: [
              {
                title: <FormattedMessage id="tree.node" />,
                dataIndex: 'node_path',
              }, {
                title: <FormattedMessage id="user.username" />,
                dataIndex: 'username',
              }, {
                title: <FormattedMessage id="user.dispname" />,
                dataIndex: 'dispname',
              }, {
                title: <FormattedMessage id="resourcesTree.role.point" />,
                dataIndex: 'role_txt',
              }, {
                title: <FormattedMessage id="table.operations" />,
                width: 100,
                render: (_text, record) => (
                  <span>
                    <Popconfirm title={<FormattedMessage id="table.delete.there.sure" />} onConfirm={() => { this.handleDelBtnClick(record.node_id, record.username, record.role_id); }}>
                      <a className="danger-link"><FormattedMessage id="table.delete" /></a>
                    </Popconfirm>
                  </span>
                ),
              },
            ],
          }}
        />
      </>
    );
  }
}
index.contextType = NsTreeContext;

export default injectIntl(index);
