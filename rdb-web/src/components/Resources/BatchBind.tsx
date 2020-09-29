import React, { Component } from 'react';
import {
  Modal, Form, Input, Radio, TreeSelect, message,
} from 'antd';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import { renderTreeNodes, normalizeTreeData } from '@pkgs/Layout/utils';
import request from '@pkgs/request';
import api from '@pkgs/api';

interface Props {
  tenant: string,
  selected: any,
  selectedNode: any,
}

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
function getActiveTenantNode(treeData: any, tenant: string) {
  if (tenant) {
    return _.filter(treeData, (item) => item.path.indexOf(tenant) === 0);
  }
  return treeData;
}

class BatchBind extends Component<Props & FormProps & ModalWrapProps & WrappedComponentProps> {
  static contextType = NsTreeContext;

  state = {
    treeNodes: [],
  }

  componentDidMount() {
    this.fetchTreeData();
  }

  fetchTreeData() {
    request(api.tree).then((res) => {
      const activeTenantNode = getActiveTenantNode(res, this.props.tenant);
      const treeNodes = normalizeTreeData(_.cloneDeep(activeTenantNode));
      this.setState({ treeNodes });
    });
  }

  handleOk = () => {
    this.props.form!.validateFields((err, values) => {
      if (!err) {
        const reqBody = {
          field : values.field,
          items: _.split(values.items, '\n'),
        };
        request(`${api.node}/${values.node}/resources/bind`, {
          method: 'POST',
          body: JSON.stringify(reqBody),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'resource.mount.success' }));
          if (this.props.onOk) this.props.onOk();
          this.props.destroy();
        });
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const {
      title, visible, selected, intl, selectedNode,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form!;

    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem label={intl.formatMessage({ id: 'tree.node' })}>
            {getFieldDecorator('node', {
              rules: [{ required: true }],
              initialValue: _.get(selectedNode, 'id'),
            })(
              <TreeSelect
                showSearch
                allowClear
                treeDefaultExpandAll
                treeNodeFilterProp="title"
                treeNodeLabelProp="path"
                filterTreeNode={(inputValue: string, treeNode: any) => _.includes(treeNode.props.node.path, inputValue)}
                dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
              >
                {renderTreeNodes(this.state.treeNodes, 'treeSelect')}
              </TreeSelect>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="resource.filter.field" />}>
            {getFieldDecorator('field', {
              initialValue: 'ident',
            })(
              <RadioGroup>
                <Radio value="id">id</Radio>
                <Radio value="uuid">uuid</Radio>
                <Radio value="ident">ident</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="resource.filter.value" />}>
            {getFieldDecorator('items', {
              initialValue: _.join(_.map(selected, getFieldValue('field')), '\n'),
            })(
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 10 }}
              />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Form.create()(BatchBind)) as any);
