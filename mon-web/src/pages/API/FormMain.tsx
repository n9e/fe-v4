import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Row, Col, Icon, Button, Form, Select, Input, InputNumber, TreeSelect, Radio, message } from 'antd';
import _ from 'lodash';
import { useDynamicList } from '@umijs/hooks';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { normalizeTreeData } from '@pkgs/Layout/utils';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import { TreeNode } from '@pkgs/interface';
import request from '@pkgs/request';
import { renderTreeNodes } from '@pkgs/Layout/utils';
import api from '@common/api';
import { nameRule, interval } from './config';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const defaultFormData = {
  step: 10,
  timeout: 2,
  protocol: 'http',
  port: 80,
  // method: 'POST',
  path: '/',
};

const getInitialValues = (initialValues: any) => {
  return _.assignIn({}, defaultFormData, _.cloneDeep(initialValues));
}

const fetchTreeData = () => {
  return request(api.tree).then((res) => {
    const treeData = normalizeTreeData(res);
    return treeData;
  });
};

const fetchData = (params: any) => {
  return request(`${api.networkCollect}?id=${params.id}&type=api`);
};

const fetchRegionData = () => {
  return request(`${api.networkCollect}/region`);
};

const FormMain = (props: any) => {
  const { getFieldProps, getFieldDecorator, getFieldValue } = props.form;
  const params = _.get(props, 'match.params');
  const intlFmtMsg = useFormatMessage();
  const nstreeContext = useContext(NsTreeContext);
  const [treeData, setTreeData] = useState([] as TreeNode[]);
  const [data, setData] = useState({});
  const [regionData, setRegionData] = useState([] as string[]);
  const initialValues = getInitialValues(data);
  const headers = _.map(initialValues.header, (v, k) => ({ name: k, value: v }));
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    list,
    remove,
    getKey,
    push,
    resetList,
  } = useDynamicList(headers);

  useEffect(() => {
    resetList(headers);
  }, [JSON.stringify(headers)]);

  useEffect(() => {
    fetchTreeData().then((res) => {
      setTreeData(res);
    });
  }, []);

  useEffect(() => {
    fetchRegionData().then((res) => {
      setRegionData(res);
    });
  }, []);

  useEffect(() => {
    if (params.action === 'add') {
      setData({
        nid: _.get(nstreeContext, 'data.selectedNode.id'),
      });
      setLoading(false);
    } else {
      fetchData(params).then((res) => {
        setData(res);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [params.id]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.form.validateFields((errors: any, values: any) => {
      if (errors) {
        console.error(errors);
        return;
      }
      setSubmitLoading(true);
      const header = {} as any;
      _.forEach(values.header, (headerItem) => {
        header[headerItem.name] = headerItem.value;
      });
      values.header = header;

      let reqBody = {
        type: 'api',
        data: values,
      } as any;
      if (params.action === 'add' || params.action === 'clone') reqBody = [reqBody];
      if (params.action === 'modify') reqBody.data.id = initialValues.id;

      request(api.networkCollect, {
        method: params.action === 'modify' ? 'PUT' : 'POST',
        body: JSON.stringify(reqBody),
      }).then(() => {
        message.success(intlFmtMsg({ id: `msg.${params.action}.success` }));
        props.history.push({
          pathname: '/api',
        });
      }).finally(() => {
        setSubmitLoading(false);
      });
    });
  }

  return (
    <Spin spinning={loading}>
      <Form layout="horizontal" onSubmit={handleSubmit}>
        <FormItem
          {...formItemLayout}
          label={intlFmtMsg({ id: 'api.title' })}
        >
          <span className="ant-form-text">api.status</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intlFmtMsg({ id: 'collect.common.node' })}
        >
          {
            getFieldDecorator('nid', {
              initialValue: initialValues.nid,
              rules: [{ required: true, message:"请选择节点！" }],
            })(
              <TreeSelect
                showSearch
                allowClear
                treeDefaultExpandAll
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {renderTreeNodes(treeData, 'treeSelect')}
              </TreeSelect>,
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.common.name' })}>
          <Input
            {...getFieldProps('name', {
              initialValue: initialValues.name,
              rules: [
                { required: true, message: '必填项！' },
                nameRule,
              ],
            })}
            size="default"
          />
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.protocol' })}>
          {
            getFieldDecorator('protocol', {
              initialValue: initialValues.protocol,
              rules: [{ required: true, message: '必填项！' }],
            })(
              <Radio.Group>
                <Radio value="http">HTTP</Radio>
                <Radio value="https">HTTPS</Radio>
              </Radio.Group>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.domain' })}>
          <Input
            {...getFieldProps('domain', {
              initialValue: initialValues.domain,
              rules: [
                { required: true, message: '必填项！' },
                { pattern: /^[a-zA-Z0-9\_\-\.]+$/, message: '域名只允许英文数字 _-.'}
              ],
            })}
            size="default"
          />
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.port' })} required>
          <InputNumber
            {...getFieldProps('port', {
              initialValue: initialValues.port,
              rules: [
                { required: true, message: '必填项！' },
              ],
            })}
            size="default"
          />
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.path' })} required>
          <Input
            {...getFieldProps('path', {
              initialValue: initialValues.path,
              rules: [
                { required: true, message: '必填项！' },
              ],
            })}
            size="default"
          />
        </FormItem>
        <FormItem {...formItemLayout} label="Method">
          <Select
            size="default"
            style={{ width: 100 }}
            {...getFieldProps('method', {
              initialValue: initialValues.method,
              rules: [
                { required: true },
              ],
            })}
          >
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="OPTIONS">OPTIONS</Option>
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label="Headers">
          {
            _.map(list, (listItem: any, index) => {
              return (
                <Row gutter={16} key={getKey(index)}>
                  <Col span={8}>
                    {
                      getFieldDecorator(`header[${getKey(index)}].name`, {
                        rules: [{ required: true, message: '必填项！' }],
                        initialValue: listItem.name,
                      })(
                        <Input
                          addonBefore="name"
                        />
                      )
                    }
                  </Col>
                  <Col span={13}>
                    {
                      getFieldDecorator(`header[${getKey(index)}].value`, {
                        rules: [{ required: true, message: '必填项！' }],
                        initialValue: listItem.value,
                      })(
                        <Input
                          addonBefore="value"
                        />
                      )
                    }
                  </Col>
                  <Col span={1}>
                    <Button
                      size="default"
                      onClick={() => { remove(index); }}
                    >
                      <Icon type="close" />
                    </Button>
                  </Col>
                </Row>
              );
            })
          }
          <Button
            size="default"
            onClick={push}
          >
            <Icon type="plus" />{intlFmtMsg({ id: 'api.header.add' })}
          </Button>
        </FormItem>
        {
          getFieldValue('method') === 'POST' || getFieldValue('method') === 'PUT' ?
            <FormItem {...formItemLayout} label="Body">
              {
                getFieldDecorator('post_body', {
                  initialValue: initialValues.post_body,
                  // rules: [{ required: true, message: '必填项！' }],
                })(
                  <Input.TextArea />
                )
              }
            </FormItem> : null
        }
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.expected_code' })}>
          {
            getFieldDecorator('expected_code', {
              initialValue: initialValues.expected_code,
              // rules: [{ required: true, message: '请选择！' }],
            })(
              <Select mode="tags" />
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.expected_string' })}>
          {
            getFieldDecorator('expected_string', {
              initialValue: initialValues.expected_string,
              // rules: [{ required: true, message: '必填项！' }],
            })(
              <Input />
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.unexpected_string' })}>
          {
            getFieldDecorator('unexpected_string', {
              initialValue: initialValues.unexpected_string,
              // rules: [{ required: true, message: '必填项！' }],
            })(
              <Input />
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.timeout' })}>
          {
            getFieldDecorator('timeout', {
              initialValue: initialValues.timeout,
              // rules: [{ required: true, message: '必填项！' }],
            })(
              <InputNumber style={{ marginRight: 5 }} />
            )
          }
          {intlFmtMsg({ id: 'collect.common.step.unit' })}
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.interval' })}>
          <Select
            size="default"
            style={{ width: 100 }}
            {...getFieldProps('step', {
              initialValue: initialValues.step,
              rules: [
                { required: true, message: '请选择！' },
              ],
            })}
          >
            {
              _.map(interval, item => <Option key={item} value={item}>{item}</Option>)
            }
          </Select> {intlFmtMsg({ id: 'collect.common.step.unit' })}
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.region' })}>
          <Select
            size="default"
            // style={{ width: 100 }}
            {...getFieldProps('region', {
              initialValue: initialValues.region || regionData[0],
              rules: [
                { required: true, message: '请选择！' },
              ],
            })}
          >
            {
              _.map(regionData, item => <Option key={item} value={item}>{item}</Option>)
            }
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.comment' })}>
          {
            getFieldDecorator('comment', {
              initialValue: initialValues.comment,
              // rules: [{ required: true, message: '必填项！' }],
            })(
              <Input.TextArea />
            )
          }
        </FormItem>
        <FormItem wrapperCol={{ offset: 6 }} style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={submitLoading}>{intlFmtMsg({ id: 'form.submit' })}</Button>
          <Button
            style={{ marginLeft: 8 }}
          >
            <Link to={{ pathname: '/api' }}>{intlFmtMsg({ id: 'form.goback' })}</Link>
          </Button>
        </FormItem>
      </Form>
    </Spin>
  );
}

export default CreateIncludeNsTree(Form.create()(FormMain));
