import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Form, TreeSelect, Select,
} from 'antd';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import ModalControl from '@pkgs/ModalControl';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';
import request from '@pkgs/request';
import api from '@common/api';

const FormItem = Form.Item;
const { Option } = Select;

class BatchMoveSubclass extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    destroy: PropTypes.func,
  };

  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  constructor(props) {
    super(props);
    this.state = {
      screenData: [],
    };
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onOk(values);
        this.props.destroy();
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  handleSelectedTreeNodeIdChange = (nid) => {
    request(`${api.monNode}/${nid}/screen`).then((res) => {
      this.setState({ screenData: res || [] });
    });
  }

  render() {
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={<FormattedMessage id="screen.tag.batch.modify" />}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical" onSubmit={(e) => {
          e.preventDefault();
          this.handleOk();
        }}>
          <FormItem label={<FormattedMessage id="screen.tag.batch.modify.tag" />}>
            {getFieldDecorator('subclasses', {
              rules: [{ required: true, message: '必填项！' }],
            })(
              <Select mode="multiple">
                {
                  _.map(this.props.data, (item) => {
                    return <Option key={item.id} value={item.id}>{item.name}</Option>;
                  })
                }
              </Select>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="screen.tag.batch.modify.target.node" />}>
            {getFieldDecorator('nid', {
              rules: [{ required: true, message: '请选择节点!' }],
              onChange: this.handleSelectedTreeNodeIdChange,
            })(
              <TreeSelect
                showSearch
                allowClear
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
              >
                {renderTreeNodes(normalizeTreeData(this.props.treeData), 'treeSelect')}
              </TreeSelect>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="screen.tag.batch.modify.target.screen" />}>
            {getFieldDecorator('screenId', {
              rules: [{ required: true, message: '请选择！' }],
            })(
              <Select>
                {
                  _.map(this.state.screenData, (item) => {
                    return <Option key={item.id} value={item.id}>{item.name}</Option>;
                  })
                }
              </Select>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(BatchMoveSubclass));
