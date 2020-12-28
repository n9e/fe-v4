/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Form, TreeSelect, Input, Select, Col, Row, Icon, Button,
} from 'antd';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';
import { useDynamicList } from '@umijs/hooks';
// import PropTypes from 'prop-types';
import {
  addList, getTreeData, getSignalList, updateList,
} from './services';
import { interval, getQueryVariabe, serviceRule } from './config';
import './style.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 10 },
};

const Setting = (props) => {
  const { getFieldDecorator, getFieldProps } = props.form;
  const [treeData, setTreeData] = useState([]);
  const create = getQueryVariabe('id');
  const [value, setValue] = useState({});

  const fetchTreeData = () => {
    getTreeData().then((res) => {
      const data = normalizeTreeData(res);
      setTreeData(data);
    });
  };
  const { list, remove, push } = useDynamicList();

  const handleSubmit = (e) => {
    e.preventDefault();
    props.form.validateFields((errors, values) => {
      if (!errors) {
        const params = values;
        params.domain = params.domain.split('\n');
        params.url_path_prefix = params.url_path_prefix.split('\n');
        if (params.tags) {
          const tags = {};
          for (let i = 0; i < params.tags.length; i++) {
            tags[params.tags[i].tagName] = params.tags[i].tagValue;
          }
          params.append_tags = tags;
          delete params.tags;
        }
        if (create) {
          updateList(params);
        } else {
          addList(params);
        }
      }
    });
  };
  useEffect(() => {
    fetchTreeData();
    if (create) {
      getSignalList(create).then((res) => {
        setValue(res);
        for (const key in res.append_tags) {
          push({ tagName: key, tagValue: res.append_tags[key] });
        }
      });
    }
  }, []);

  const treeNodes = React.useMemo(() => {
    return renderTreeNodes(treeData, 'treeSelect');
  }, [treeData]);

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <FormItem {...formItemLayout} label="节点">
          {getFieldDecorator('sevice', {
            initialValue: _.get(value, 'sevice'),
            rules: [{ required: true, message: '请选择节点！' }],
          })(
            <TreeSelect
              showSearch
              allowClear
              treeDefaultExpandAll
              treeNodeFilterProp="path"
              treeNodeLabelProp="path"
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            >
              {treeNodes}
            </TreeSelect>,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="服务"
        >
          <Input
            {...getFieldProps('nid', {
              initialValue: _.get(value, 'nid'),
              rules: [
                { required: true, message: '必填项！' },
                serviceRule,
              ],
            })}
            placeholder="只能是英文字母、数字、下划线" />
        </FormItem>
        <FormItem {...formItemLayout} label="采集周期">
          {getFieldDecorator('interval', {
            initialValue: _.get(value, 'interval') || 10,
            rules: [{ required: true, message: '请选择！' }],
          })(
            <Select size="default" style={{ width: 100 }}>
              {_.map(interval, item => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="匹配域名">
          {getFieldDecorator('domain', {
            initialValue: value.domain
              ? _.get(value, 'domain').join('\n')
              : undefined,
            rules: [{ required: true, message: '必填项！' }],
          })(
            <TextArea
              autosize={{ minRows: 2, maxRows: 6 }}
              // disabled={readOnly}
            />,
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="APIPATH">
          {getFieldDecorator('url_path_prefix', {
            initialValue: value.domain
              ? _.get(value, 'url_path_prefix').join('\n')
              : undefined,
            rules: [{ required: true, message: '必填项！' }],
          })(
            <TextArea
              autosize={{ minRows: 2, maxRows: 6 }}
              // disabled={readOnly}
            />,
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="Tags">
          {_.map(list, (item, index) => {
            return (
              <Row key={index} gutter={10}>
                <Col span={9}>
                  <FormItem>
                    {getFieldDecorator(`tags[${index}].tagName`, {
                      initialValue: item.tagName,
                      rules: [{ required: true }],
                    })(
                      <Input
                        addonBefore="tagName"
                        placeholder=""
                        style={{ width: '100%' }}
                      />,
                    )}
                  </FormItem>
                </Col>
                <Col span={10}>
                  <FormItem>
                    {getFieldDecorator(`tags[${index}].tagValue`, {
                      initialValue: item.tagValue,
                      rules: [{ required: true, message: '必填项！' }],
                    })(
                      <Input
                        addonBefore="tagValue"
                        placeholder=""
                        style={{ width: '100%' }}
                      />,
                    )}
                  </FormItem>
                </Col>
                <Col span={5}>
                  {list.length > 0 && (
                    <Icon
                      type="minus-circle-o"
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        remove(index);
                      }}
                    />
                  )}
                </Col>
              </Row>
            );
          })}
          <Button
            onClick={() => {
              push({ tagName: '', tagValue: '' });
            }}
          >
            + 新增tag
          </Button>
          <FormItem wrapperCol={{ offset: 6 }} style={{ marginTop: 24 }}>
            {create ? (
              <Button type="primary" htmlType="submit">
                修改
              </Button>
            ) : (
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            )}
            <Button style={{ marginLeft: 8 }}>
              <Link to={{ pathname: '/nginx' }}>取消</Link>
            </Button>
          </FormItem>
        </FormItem>
      </Form>
    </div>
  );
};

export default Form.create()(Setting);
