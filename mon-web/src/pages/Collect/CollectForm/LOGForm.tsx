import React, { useState, useEffect } from 'react';
import { Link, withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Button, Form, Select, Input, Modal, message, Icon, Tooltip, Row, Col, TreeSelect } from 'antd';
import { useDynamicList } from '@umijs/hooks';
import { renderTreeNodes } from '@pkgs/Layout/utils';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import request from '@pkgs/request';
import api from '@common/api';
import { nameRule, interval } from '../config';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const defaultFormData = {
  collect_type: 'log',
  func: 'cnt',
  func_type: 'FLOW',
  time_format: 'dd/mmm/yyyy:HH:MM:SS',
  step: 10,
};
const getPureName = (name: string) => {
  if (name.indexOf('log.') === 0) {
    return name.substr(4);
  }
  return name;
}

const getInitialValues = (initialValues: any) => {
  const data = _.assignIn({}, defaultFormData, _.cloneDeep(initialValues));
  data.name = data.name || '';
  data.tags = _.map(data.tags, (val, key) => {
    return {
      name: key,
      value: val,
    };
  });
  return data;
};

const getFuncTypeByFunc = (func: string) => {
  return func === 'cnt' ? 'FLOW' : 'COSTTIME';
};

const CollectForm = (props: any) => {
  const params = _.get(props, 'match.params');
  const intlFmtMsg = useFormatMessage();
  const initialValues = getInitialValues(props.initialValues);
  const { getFieldProps, getFieldValue, getFieldsValue, getFieldDecorator, setFieldsValue } = props.form;

  getFieldDecorator('collect_type', {
    initialValue: initialValues.collect_type,
  });
  getFieldDecorator('func_type', {
    initialValue: initialValues.func_type,
  });
  const {
    list,
    remove,
    getKey,
    push,
    resetList,
  } = useDynamicList(initialValues.tags);

  useEffect(() => {
    resetList(initialValues.tags);
  }, [JSON.stringify(initialValues.tags)]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [logVal, setLogVal] = useState('');
  const [logCheckVisible, setLogCheckVisible] = useState(params.action === 'add');
  const [logCheckLoading, setLogCheckLoading] = useState(false);
  const [logChecked, setLogChecked] = useState(false);
  const [logCheckedResultsVisible, setLogCheckedResultsVisible] = useState(false);
  const [logCheckedResultsSuccess, setLogCheckedResultsSuccess] = useState(false);
  const [logCheckedResults, setLogCheckedResults] = useState([]);

  const checkLog = () => {
    const pattern = getFieldValue('pattern');
    const timeFormat = getFieldValue('time_format');
    const tagsReg = {} as any;

    _.each(getFieldsValue().tags, (item) => {
      if (item) {
        tagsReg[item.name] = item.value;
      }
    });

    if (pattern === '') {
      message.error(intlFmtMsg({ id: 'collect.log.msg.pattern.empty' }));
    } else if (logVal === '') {
      message.error(intlFmtMsg({ id: 'collect.log.msg.log.empty' }));
    } else {
      setLogChecked(true);
      setLogCheckLoading(true);
      request(`${api.collect}/check`, {
        method: 'POST',
        body: JSON.stringify({
          ...tagsReg,
          re: pattern,
          log: logVal,
          time: timeFormat,
        }),
      }).then((res) => {
        setLogCheckedResultsVisible(true);
        setLogCheckedResultsSuccess(res.success);
        setLogCheckedResults(res.tags || [])
      }).finally(() => {
        setLogCheckLoading(false);
      });
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.form.validateFields((errors: any, values: any) => {
      if (errors) {
        console.error(errors);
        return;
      }
      const { file_path: filePath, tags = [] } = values;
      // 动态日志 验证是否包含 /
      const dynamicLogReg = /\$\{[^{]+\}/;
      const dynamicLogRegMatch = filePath.match(dynamicLogReg);
      if (dynamicLogRegMatch && dynamicLogRegMatch.length && _.some(dynamicLogRegMatch, n => _.includes(n, '/'))) {
        message.error(intlFmtMsg({ id: 'collect.log.path.dynamic.tip.2' }));
        return;
      }
      // tags 数据转换成接口需要的格式，以及验证是否包含括号
      const bracketsReg = /\([^(]+\)/;
      const reservedKws = ['host', 'trigger', 'include'];
      if (tags.length) {
        const TagValidateStatus = _.every(_.compact(tags), (o) => {
          if (o.name === '' || o.value === '') {
            message.error('tagName、tagValue is required');
            return false;
          } else if (_.includes(reservedKws, o.name)) {
            message.error(`tagName: ${intlFmtMsg({ id: 'collect.log.tagName.help.1' })}`);
            return false;
          } else if (!bracketsReg.test(o.value)) {
            message.error(`tagValue: ${intlFmtMsg({ id: 'collect.log.tagValue.help.1' })}`);
            return false;
          }
          return true;
        });
        if (!TagValidateStatus) {
          return;
        }
        values.tags = {};
        _.each(_.compact(tags), ({ name, value }) => {
          values.tags[name] = value;
        });
      } else {
        delete values.tags;
      }
      // 添加采集配置的时候，需要做配置验证
      if (params.action === 'add') {
        if (!logChecked) {
          message.error(intlFmtMsg({ id: 'collect.log.check.add.tip' }));
          return;
        }
      }
      // 新增、以及修改以 LOG. 开头的 name 做补全 LOG. 处理
      if (params.action === 'add' || initialValues.name.indexOf('log.') === 0) {
        values.name = `log.${values.name}`;
      }

      setSubmitLoading(true);

      props.onSubmit(values).catch(() => {
        setSubmitLoading(false);
      });
    });
  };

  return (
    <div>
      <Form layout="horizontal" onSubmit={handleSubmit}>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.log.ns' })}>
          {
            getFieldDecorator('nid', {
              initialValue: initialValues.nid,
              rules: [{ required: true, message: '请选择节点！' }],
            })(
              <TreeSelect
                style={{ width: 500 }}
                showSearch
                allowClear
                treeDefaultExpandAll
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {renderTreeNodes(props.treeData, 'treeSelect')}
              </TreeSelect>,
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.log.name' })}>
          {
            getFieldDecorator('name', {
              initialValue: getPureName(initialValues.name),
              rules: [
                {
                  required: true, message: '必填项！'
                },
                nameRule,
              ],
            })(
              <Input
                size="default"
                style={{ width: params.action === 'add' || initialValues.name.indexOf('log.') === 0 ? 500 : 500 }}
                addonBefore={params.action === 'add' || initialValues.name.indexOf('log.') === 0 ? 'log.' : null}
              />,
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.log.func' })}>
          {
            getFieldDecorator('func', {
              initialValue: initialValues.func,
              onChange: (val: string) => {
                setFieldsValue({
                  func_type: getFuncTypeByFunc(val),
                });
              },
              rules: [
                {
                  required: true, message: '请选择！'
                },
              ],
            })(
              <Select
                size="default"
                style={{ width: 500 }}
              >
                <Option value="cnt">{intlFmtMsg({ id: 'collect.log.func.cnt' })}</Option>
                <Option value="avg">{intlFmtMsg({ id: 'collect.log.func.avg' })}</Option>
                <Option value="sum">{intlFmtMsg({ id: 'collect.log.func.sum' })}</Option>
                <Option value="max">{intlFmtMsg({ id: 'collect.log.func.max' })}</Option>
                <Option value="min">{intlFmtMsg({ id: 'collect.log.func.min' })}</Option>
              </Select>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.log.path' })}>
          <Input
            {...getFieldProps('file_path', {
              initialValue: initialValues.file_path,
              rules: [
                {
                  required: true, message: '必填项！'
                },
              ],
            })}
            size="default"
            style={{ width: 500 }}
          />
          <span style={{ paddingLeft: 10 }}>
            <Tooltip
              overlayClassName="largeTooltip"
              title={
                <div style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                  {intlFmtMsg({ id: 'collect.log.path.dynamic.tip.1' })} {'/path/access.log.${%Y%m%d%H}'}<br />
                  {intlFmtMsg({ id: 'collect.log.path.dynamic.tip.2' })}
                </div>
              }
            >
              <span>{intlFmtMsg({ id: 'collect.log.path.dynamic' })} <Icon type="info-circle-o" /></span>
            </Tooltip>
          </span>
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.log.timeFmt' })}>
          <div
            style={{
              width: 500, float: 'left', position: 'relative', zIndex: 1,
            }}
          >
            <Select
              {...getFieldProps('time_format', {
                initialValue: initialValues.time_format,
                rules: [
                  {
                    required: true, message: '请选择！'
                  },
                ],
              })}
              size="default"
              style={{ width: 500 }}
            >
              <Option value="dd/mmm/yyyy:HH:MM:SS">01/Jan/2006:15:04:05</Option>
              <Option value="dd/mmm/yyyy HH:MM:SS">01/Jan/2006 15:04:05</Option>
              <Option value="yyyy-mm-ddTHH:MM:SS">2006-01-02T15:04:05</Option>
              <Option value="dd-mmm-yyyy HH:MM:SS">01-Jan-2006 15:04:05</Option>
              <Option value="yyyy-mm-dd HH:MM:SS">2006-01-02 15:04:05</Option>
              <Option value="yyyy/mm/dd HH:MM:SS">2006/01/02 15:04:05</Option>
              <Option value="yyyymmdd HH:MM:SS">20060102 15:04:05</Option>
              <Option value="mmm dd HH:MM:SS">Jan 2 15:04:05</Option>
              <Option value="dd mmm yyyy HH:MM:SS">02 Jan 2006 15:04:05</Option>
              <Option value="mmdd HH:MM:SS">0102 15:04:05</Option>
              <Option value="mm-dd HH:MM:SS">01-02 15:04:05</Option>
            </Select>
          </div>
          <div style={{ marginLeft: 510, lineHeight: '20px' }}>
            {intlFmtMsg({ id: 'collect.log.timeFmt.help.1' })}<br />
            {intlFmtMsg({ id: 'collect.log.timeFmt.help.2' })}
          </div>
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.log.step' })}>
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
          </Select> {intlFmtMsg({ id: 'collect.log.step.unit' })}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={
            <Tooltip
              title={
                <div>
                  {intlFmtMsg({ id: 'collect.log.pattern.tip.1' })}<br />
                  {/* 如计算方式选择了耗时: 必须包含括号( )<br /> */}
                  {intlFmtMsg({ id: 'collect.log.pattern.tip.3' })}
                </div>
              }
            >
              <span>{intlFmtMsg({ id: 'collect.log.pattern' })} <Icon type="info-circle-o" /></span>
            </Tooltip>
          }
        >
          <Input
            {...getFieldProps('pattern', {
              initialValue: initialValues.pattern,
              rules: [
                {
                  required: true,
                  message: '必填项！',
                },
              ],
            })}
            size="default"
            style={{ width: 500 }}
            placeholder="耗时计算：正则( )中的数值会用于计算曲线值；流量计数：每匹配到该正则，曲线值+1"
          />
        </FormItem>
        <FormItem {...formItemLayout} label="Tags">
          <div
            style={{
              width: 500, float: 'left', position: 'relative', zIndex: 1,
            }}
          >
            {
              _.map(list, (listItem: any, index) => {
                return (
                  <Row gutter={16} key={getKey(index)}>
                    <Col span={8}>
                      {
                        getFieldDecorator(`tags[${getKey(index)}].name`, {
                          rules: [{ required: true, message: '必填项！' }],
                          initialValue: listItem.name,
                        })(
                          <Input
                            addonBefore="tagName"
                          />
                        )
                      }
                    </Col>
                    <Col span={13}>
                      {
                        getFieldDecorator(`tags[${getKey(index)}].value`, {
                          rules: [{ required: true, message: '必填项！' }],
                          initialValue: listItem.value,
                        })(
                          <Input
                            addonBefore="tagValue"
                            placeholder={intlFmtMsg({ id: 'collect.log.tagval.placeholder' })}
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
              <Icon type="plus" />{intlFmtMsg({ id: 'collect.log.tags.add' })}
            </Button>
          </div>
          <div style={{ marginLeft: 510, lineHeight: '20px' }}>
            <h4>{intlFmtMsg({ id: 'collect.log.tagName.help.title' })}</h4>
            <div>1. {intlFmtMsg({ id: 'collect.log.tagName.help.1' })}</div>
            <div>2. {intlFmtMsg({ id: 'collect.log.tagName.help.2' })}</div>
            <h4>{intlFmtMsg({ id: 'collect.log.tagValue.help.title' })}</h4>
            <div>1. {intlFmtMsg({ id: 'collect.log.tagValue.help.1' })}</div>
            <div>2. {intlFmtMsg({ id: 'collect.log.tagValue.help.2' })}</div>
          </div>
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.log.check' })} required={logCheckVisible}>
          {
            logCheckVisible ?
              <div>
                <Input
                  type="textarea"
                  style={{ width: 500 }}
                  value={logVal}
                  onChange={(e) => {
                    setLogVal(e.target.value);
                  }}
                />
                <span style={{ paddingLeft: 10 }}>
                  {intlFmtMsg({ id: 'collect.log.check.help' })}
                  <Tooltip title={
                    <div style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                      {intlFmtMsg({ id: 'collect.log.check.help.tip.1' })}<br />
                      {intlFmtMsg({ id: 'collect.log.check.help.tip.2' })}<br />
                      {intlFmtMsg({ id: 'collect.log.check.help.tip.3' })}<br />
                      {intlFmtMsg({ id: 'collect.log.check.help.tip.4' })}
                    </div>
                  }
                  >
                    <span><Icon type="info-circle-o" /></span>
                  </Tooltip>
                </span>
                <div>
                  <Button
                    size="default"
                    onClick={checkLog}
                    loading={logCheckLoading}
                  >
                    {intlFmtMsg({ id: 'collect.log.check.btn' })}
                  </Button>
                </div>
              </div> :
              <Button
                size="default"
                onClick={() => {
                  setLogCheckVisible(!logCheckVisible);
                }}
              >
                {intlFmtMsg({ id: 'collect.log.check.btn2' })}
              </Button>
          }
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.log.note' })}>
          <Input
            type="textarea"
            placeholder=""
            {...getFieldProps('comment', {
              initialValue: initialValues.comment,
            })}
            style={{ width: 500 }}
          />
        </FormItem>
        <FormItem wrapperCol={{ offset: 6 }} style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={submitLoading}>{intlFmtMsg({ id: 'form.submit' })}</Button>
          <Button
            style={{ marginLeft: 8 }}
          >
            <Link to={{ pathname: '/collect/log' }}>{intlFmtMsg({ id: 'form.goback' })}</Link>
          </Button>
        </FormItem>
      </Form>
      <Modal
        title={
          <span>
            Result：
            {
              logCheckedResultsSuccess ?
                <span style={{ color: '#87d068' }}>succeed</span> :
                <span style={{ color: '#f50' }}>failed</span>
            }
          </span>
        }
        visible={logCheckedResultsVisible}
        onOk={() => setLogCheckedResultsVisible(false)}
        onCancel={() => setLogCheckedResultsVisible(false)}
        footer={[
          <Button
            key="back"
            type="primary"
            size="large"
            onClick={() => setLogCheckedResultsVisible(false)}
          >
            Close
          </Button>,
        ]}
      >
        <div>
          <Form layout="horizontal">
            {
              _.map(logCheckedResults, (result, i) => {
                for (const keyName in result) {
                  return (
                    <FormItem
                      key={i}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 19 }}
                      label={keyName}
                    >
                      <Input disabled type="textarea" value={result[keyName]} />
                    </FormItem>
                  );
                }
              })
            }
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Form.create()(withRouter(CollectForm));
