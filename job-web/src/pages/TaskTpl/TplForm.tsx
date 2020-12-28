import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { Form, Input, InputNumber, Select, TreeSelect } from 'antd';
import { FormattedMessage } from 'react-intl';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { prefixCls } from '@common/config';
import Editor from './Editor';
import './style.less';

const FormItem = Form.Item;
const { TextArea } = Input;

class TplForm extends Component<any> {
  static propTypes = {
    type: PropTypes.string,
    initialValues: PropTypes.shape({
    }),
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    type: 'tpl', // tpl || task
    initialValues: {
      title: '',
      batch: 0,
      tolerance: 0,
      timeout: 30,
      pause: '',
      script: '#!/bin/bash\n# e.g.\nexport PATH=/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin:~/bin\nss -tln',
      args: '',
      tags: '',
      account: 'root',
      hosts: [],
      treeData: [],
    },
    onSubmit: () => {},
  };

  state = {
    habitsId: 'ident',
  };

  componentDidMount() {
    this.fetchTreeData();
  }

  fetchTreeData() {
    request(api.tree).then((res) => {
      const treeData = normalizeTreeData(res);
      this.setState({ treeData });
    });
  }

  handleSubmit = (e: any) => {
    e.preventDefault();
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        this.props.onSubmit({
          ...values,
          tags: _.join(values.tags, ','),
          hosts: _.split(values.hosts, '\n'),
        });
      }
    });
  }

  render() {
    const { habitsId } = this.state;
    const { initialValues, type } = this.props;
    const { getFieldDecorator, setFieldsValue } = this.props.form;
    const search = _.get(this.props, 'location.search');
    const query = queryString.parse(search);

    if (type === 'tpl') {
      getFieldDecorator('nid', {
        initialValue: initialValues.nid || query.nid,
      });
    }

    return (
      <div className={`${prefixCls}-zeus-tpl-form`}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            label={
              <>
                <strong>Title:</strong>
                { type === 'tpl' ? <FormattedMessage id="tpl.title.tpl.help" /> : <FormattedMessage id="tpl.title.task.help" /> }
              </>
            }
          >
            {getFieldDecorator('title', {
              initialValue: initialValues.title,
              rules: [{ required: true, message: '必填项！' }],
            })(
              <Input />,
            )}
          </FormItem>
          {
            type === 'tpl' ?
              <FormItem
                label={
                  <>
                    <strong>Tags:</strong>
                    <FormattedMessage id="tpl.tags.help" />
                  </>
                }
              >
                {getFieldDecorator('tags', {
                  initialValue: initialValues.tags ? _.split(initialValues.tags, ',') : [],
                })(
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                  />,
                )}
              </FormItem> : null
          }
          <FormItem
            label={
              <>
                <strong>Account:</strong>
                <FormattedMessage id="tpl.account.help" />
              </>
            }
          >
            {getFieldDecorator('account', {
              initialValue: initialValues.account,
              rules: [{ required: true, message: '必填项！' }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem
            label={
              <>
                <strong>Batch:</strong>
                <FormattedMessage id="tpl.batch.help" />
              </>
            }
          >
            {getFieldDecorator('batch', {
              initialValue: initialValues.batch,
              rules: [{ required: true, message: '必填项！' }],
            })(
              <InputNumber min={0} />,
            )}
          </FormItem>
          <FormItem
            label={
              <>
                <strong>Tolerance:</strong>
                <FormattedMessage id="tpl.tolerance.help" />
              </>
            }
          >
            {getFieldDecorator('tolerance', {
              initialValue: initialValues.tolerance,
              rules: [{ required: true, message: '必填项！' }],
            })(
              <InputNumber min={0} />,
            )}
          </FormItem>
          <FormItem
            label={
              <>
                <strong>Timeout:</strong>
                <FormattedMessage id="tpl.timeout.help" />
              </>
            }
          >
            {getFieldDecorator('timeout', {
              initialValue: initialValues.timeout,
            })(
              <InputNumber min={0} />,
            )}
          </FormItem>
          <FormItem
            label={
              <span>
                <strong>Pause:</strong>
                <FormattedMessage id="tpl.pause.help" values={{ habitsId }} />
              </span>
            }
          >
            {getFieldDecorator('pause', {
              initialValue: initialValues.pause,
            })(
              <Input />,
            )}
          </FormItem>
          {
            type !== 'tpl' ?
              <>
                <FormItem
                  label={
                    <span>
                      <strong>节点:</strong>
                    </span>
                  }
                >
                  <TreeSelect
                    showSearch
                    allowClear
                    treeNodeFilterProp="path"
                    treeNodeLabelProp="path"
                    dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
                    onChange={(value: number) => {
                      request(`${api.node}/${value}/resources?limit=1000`).then((res) => {
                        setFieldsValue({
                          hosts: _.join(_.map(res.list, 'ident'), '\n'),
                        });
                      });
                    }}
                  >
                    {renderTreeNodes(this.state.treeData, 'treeSelect')}
                  </TreeSelect>
                </FormItem>
              </> : null
          }
          <FormItem
            label={
              <>
                <strong>Host {habitsId}:</strong>
                <FormattedMessage id="tpl.host.help" />
              </>
            }
          >
            {getFieldDecorator('hosts', {
              initialValue: _.join(initialValues.hosts, '\n'),
              rules: [{ required: type !== 'tpl' , message: '必填项！'}],
            })(
              <TextArea autosize={{ minRows: 3, maxRows: 8 }} />,
            )}
          </FormItem>
          <FormItem
            label={
              <>
                <strong>Script:</strong>
                <FormattedMessage id="tpl.script.help" />
              </>
            }
          >
            {getFieldDecorator('script', {
              initialValue: initialValues.script,
              rules: [{ required: true, message: '必填项！' }],
            })(
              <Editor />,
            )}
          </FormItem>
          <FormItem
            label={
              <span>
                <strong>Args:</strong>
                <FormattedMessage id="tpl.args.help" />
              </span>
            }
          >
            {getFieldDecorator('args', {
              initialValue: initialValues.args,
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem>
            {this.props.footer}
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default withRouter(Form.create()(TplForm) as any);
