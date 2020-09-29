import React, { Component } from 'react';
import { Modal, Form, Input, TreeSelect } from 'antd';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@common/api';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';

const FormItem = Form.Item;

class CloneModal extends Component {
  static defaultProps = {
    title: '',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  state = {
    treeData: [],
  }

  componentDidMount() {
    this.fetchTreeData();
  }

  fetchTreeData() {
    request({
      url: api.tree,
    }).then((res) => {
      const treeData = normalizeTreeData(res);
      this.setState({ treeData });
    });
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.handleClone(values);
        this.props.destroy();
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  // eslint-disable-next-line class-methods-use-this
  async handleClone(record) {
    try {
      const { oldRecord } = this.props;
      const subclasses = await request(`${api.screen}/${oldRecord.id}/subclass`);
      _.forEach(subclasses, async (subclass) => {
        const charts = await request(`${api.subclass}/${subclass.id}/chart`);
        subclass.charts = _.map(charts, (chart, i) => {
          const configs = JSON.parse(chart.configs);
          const metricObj = configs.metrics[0];
          configs.metrics[0].selectedNid = record.nid;
          if (metricObj.endpointsKey === 'endpoints') {
            configs.metrics[0].endpoints = ['=all'];
            configs.metrics[0].selectedEndpoint = ['=all'];
          } else if (metricObj.endpointsKey === 'nid') {
            configs.metrics[0].endpoints = [record.nid];
            configs.metrics[0].selectedEndpoint = [record.nid];
          }
          return {
            configs: JSON.stringify(configs),
            weight: i + 1,
          };
        });
      });

      const addedScreenId = await request(`${api.monNode}/${record.nid}/screen`, {
        method: 'POST',
        body: JSON.stringify({
          name: record.name,
          weight: 1,
        }),
      });

      _.forEach(subclasses, async (subclass) => {
        const addedsubclassId = await request(`${api.screen}/${addedScreenId}/subclass`, {
          method: 'POST',
          body: JSON.stringify({
            name: subclass.name,
            weight: subclass.weight,
          }),
        });
        _.forEach(subclass.charts, async (chart) => {
          await request(`${api.subclass}/${addedsubclassId}/chart`, {
            method: 'POST',
            body: JSON.stringify({
              configs: chart.configs,
              weight: chart.weight,
            }),
          });
        });
      });
      this.props.onSuccess();
    } catch (e) {
      console.log(e);
      this.props.onError();
    }
  }

  render() {
    const { title, visible } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical" onSubmit={(e) => {
          e.preventDefault();
          this.handleOk();
        }}>
          <FormItem label={<FormattedMessage id="screen.clone.name" />}>
            {getFieldDecorator('name', {
              rules: [{ required: true }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem
            label={<FormattedMessage id="screen.clone.node" />}
            help={<FormattedMessage id="screen.clone.node.help" />}
          >
            {getFieldDecorator('nid', {
              rules: [{ required: true }],
              initialValue: this.props.selectedNodeId,
            })(
              <TreeSelect
                showSearch
                allowClear
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
              >
                {renderTreeNodes(this.state.treeData, 'treeSelect')}
              </TreeSelect>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(CloneModal));
