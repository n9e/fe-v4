import React, { Component } from 'react';
import { Form, Input, TreeSelect } from 'antd';
import { FormattedMessage } from 'react-intl';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import request from '@pkgs/request';
import api from '@common/api';

interface Props {
  isrootVsible: boolean,
  initialValue: any,
  cate: 'global' | 'local',
}

interface OpsListItem {
  cn: string,
  en: string,
}

interface OpsTreeNode {
  system: string,
  groups: {
    title: string,
    ops: OpsListItem[],
  }[],
}

interface State {
  opsList: OpsListItem[],
  opsTree: OpsTreeNode[],
}

const FormItem = Form.Item;
const { TreeNode } = TreeSelect;

class RoleForm extends Component<Props & FormProps, State> {
  static defaultProps = {
    isrootVsible: false,
    initialValue: {},
  } as Props;

  componentDidMount() {
    const { initialValue } = this.props;
    if (initialValue.cate) {
      this.fetchOps(initialValue.cate);
    }
  }

  fetchOps = (cate: 'global' | 'local') =>{
    request(`${api.ops}/${cate}`).then((res) => {
      if (cate === 'global') {
        this.setState({ opsList: res });
      } else if (cate === 'local') {
        this.setState({ opsTree: res });
      }
    });
  }

  validateFields() {
    return this.props.form!.validateFields;
  }

  getOpsTreeNodes() {
    const { opsTree } = this.state;
    return _.map(opsTree, (systemItem) => {
      return (
        <TreeNode disabled value={systemItem.system} title={systemItem.system} key={systemItem.system}>
          {
            _.map(systemItem.groups, (groupItem) => {
              return (
                <TreeNode disabled value={groupItem.title} title={groupItem.title} key={groupItem.title}>
                  {
                    _.map(groupItem.ops, (opItem) => {
                      return <TreeNode value={opItem.en} title={opItem.cn} key={opItem.en} />;
                    })
                  }
                </TreeNode>
              );
            })
          }
        </TreeNode>
      );
    });
  }

  render() {
    const { initialValue, cate } = this.props;
    const { getFieldDecorator } = this.props.form!;
    getFieldDecorator('cate', { initialValue: cate });

    return (
      <Form layout="vertical">
        <FormItem label={<FormattedMessage id="role.name" />}>
          {getFieldDecorator('name', {
            initialValue: initialValue.name,
            rules: [{ required: true }],
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="table.note" />}>
          {getFieldDecorator('note', {
            initialValue: initialValue.note,
          })(
            <Input />,
          )}
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(RoleForm);
