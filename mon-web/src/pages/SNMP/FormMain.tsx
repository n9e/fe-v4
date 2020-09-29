import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Button, Form, Select, Input, InputNumber, TreeSelect, Radio, Tooltip, AutoComplete, message } from 'antd';
import _ from 'lodash';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { normalizeTreeData } from '@pkgs/Layout/utils';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import { TreeNode } from '@pkgs/interface';
import request from '@pkgs/request';
import { renderTreeNodes } from '@pkgs/Layout/utils';
import api from '@common/api';
import { interval } from './config';
import Indexes from './Indexes';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const defaultFormData = {
  oid_type: 1,
  indexes: []
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
  return request(`${api.networkCollect}?id=${params.id}&type=snmp`);
};

const fetchMibModule = (oidType: number) => {
  return request(`${api.snmp}/mib/module?oid_type=${oidType}`);
};

const fetchMibMetric = (oidType: number, module?: string) => {
  return request(`${api.snmp}/mibs?oid_type=${oidType}&module=${module}`);
};

const fetchMibDetail = (module: string, metric: string) => {
  return request(`${api.snmp}/mib?module=${module}&metric=${metric}`);
};

const FormMain = (props: any) => {
  const { getFieldProps, getFieldDecorator, getFieldValue, setFieldsValue } = props.form;
  const params = _.get(props, 'match.params');
  const intlFmtMsg = useFormatMessage();
  const nstreeContext = useContext(NsTreeContext);
  const [treeData, setTreeData] = useState([] as TreeNode[]);
  const [data, setData] = useState({});
  const initialValues = getInitialValues(data);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [realMetrics, setRealMetrics] = useState<any[]>([]);
  const [midDetail, setMidDetail] = useState<any>({});
  const module = getFieldValue('module') || initialValues.module;
  const metric = getFieldValue('metric') || initialValues.metric;

  useEffect(() => {
    fetchTreeData().then((res) => {
      setTreeData(res);
    });
  }, []);

  useEffect(() => {
    if (getFieldValue('oid_type') === 2) {
      fetchMibModule(getFieldValue('oid_type')).then((res) => {
        setModules(res);
      });
    } else if (getFieldValue('oid_type') === 1) {
      fetchMibMetric(getFieldValue('oid_type')).then((res) => {
        setMetrics(res);
        setRealMetrics(_.filter(res, (_item, i: number) => i < 100));
      });
    }
  }, [getFieldValue('oid_type'), initialValues.oid_type]);

  useEffect(() => {
    if (getFieldValue('oid_type') && module) {
      fetchMibMetric(getFieldValue('oid_type'), module).then((res) => {
        setMetrics(res);
        setRealMetrics(_.filter(res, (_item, i: number) => i < 100));
      });
    }
  }, [module]);

  useEffect(() => {
    if (module && metric) {
      fetchMibDetail(module, metric).then((res) => {
        setMidDetail(res);
      });
    }
  }, [metric]);

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

      let reqBody = {
        type: 'snmp',
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
          pathname: '/snmp',
        });
      }).finally(() => {
        setSubmitLoading(false);
      });
    });
  }

  return (
    <Spin spinning={loading}>
      <Form layout="horizontal" onSubmit={handleSubmit}>
        {/* <FormItem
          {...formItemLayout}
          label={intlFmtMsg({ id: 'api.title' })}
        >
          <span className="ant-form-text">api.status</span>
        </FormItem> */}
        <FormItem
          {...formItemLayout}
          label={intlFmtMsg({ id: 'collect.common.node' })}
        >
          {
            getFieldDecorator('nid', {
              initialValue: initialValues.nid,
              rules: [{ required: true }],
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
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'snmp.oid_type' })}>
          {
            getFieldDecorator('oid_type', {
              initialValue: initialValues.oid_type,
              rules: [{ required: true }],
              onChange: () => {
                setTimeout(() => {
                  setFieldsValue({
                    module: undefined,
                    metric: undefined,
                  });
                  setRealMetrics([]);
                }, 1);
              }
            })(
              <Radio.Group>
                <Radio.Button value={1}>{intlFmtMsg({ id: 'snmp.oid_type.1' })}</Radio.Button>
                <Radio.Button value={2}>{intlFmtMsg({ id: 'snmp.oid_type.2' })}</Radio.Button>
              </Radio.Group>
            )
          }
        </FormItem>
        {
          getFieldValue('oid_type') !== 1 ?
            <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'snmp.module' })}>
              {
                getFieldDecorator('module', {
                  initialValue: initialValues.module,
                  rules: [{ required: true }],
                })(
                  <AutoComplete
                    dataSource={modules}
                  />
                )
              }
            </FormItem> : null
        }
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'snmp.metric' })}>
          {
            getFieldDecorator('metric', {
              initialValue: initialValues.metric,
              rules: [{ required: true }],
            })(
              <AutoComplete
                optionLabelProp="value"
                onSearch={(val) => {
                  const filtered = _.filter(metrics, (item) => {
                    return item.metric.indexOf(val) > -1;
                  });
                  setRealMetrics(_.filter(filtered, (_item, i) => i < 100));
                }}
              >
                {
                  _.map(realMetrics, (item: any) => {
                    return (
                      <AutoComplete.Option key={item.metric} value={item.metric}>
                        <Tooltip placement="left" title={item.note}>
                          {item.metric}
                        </Tooltip>
                      </AutoComplete.Option>
                    );
                  })
                }
              </AutoComplete>
            )
          }
        </FormItem>
        {
          getFieldValue('oid_type') !== 1 ?
            <>
              <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'snmp.oid' })}>
                {
                  getFieldDecorator('oid', {
                    initialValue: midDetail.oid || initialValues.oid,
                    rules: [{ required: true }],
                  })(
                    <Input />
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'snmp.metric_type' })}>
                {
                  getFieldDecorator('metric_type', {
                    initialValue: midDetail.mtype || initialValues.metric_type,
                    rules: [{ required: true }],
                  })(
                    <Select>
                      <Option value="counter">counter</Option>
                      <Option value="gauge">gauge</Option>
                      <Option value="Float">Float</Option>
                      <Option value="Double">Double</Option>
                      <Option value="DateAndTime">DateAndTime</Option>
                      <Option value="EnumAsInfo">EnumAsInfo</Option>
                      <Option value="EnumAsStateSet">EnumAsStateSet</Option>
                      <Option value="Bits">Bits</Option>
                    </Select>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label="Indexes">
                <Indexes
                  form={props.form}
                  module={getFieldValue('module')}
                  metrics={realMetrics}
                  midDetail={midDetail as any}
                  indexes={initialValues.indexes}
                />
              </FormItem>
            </> : null
        }
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.timeout' })}>
          {
            getFieldDecorator('timeout', {
              initialValue: initialValues.timeout,
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
                { required: true },
              ],
            })}
          >
            {
              _.map(interval, item => <Option key={item} value={item}>{item}</Option>)
            }
          </Select> {intlFmtMsg({ id: 'collect.common.step.unit' })}
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'api.comment' })}>
          {
            getFieldDecorator('comment', {
              initialValue: initialValues.comment,
              // rules: [{ required: true }],
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
            <Link to={{ pathname: '/snmp' }}>{intlFmtMsg({ id: 'form.goback' })}</Link>
          </Button>
        </FormItem>
      </Form>
    </Spin>
  );
}

export default CreateIncludeNsTree(Form.create()(FormMain));
