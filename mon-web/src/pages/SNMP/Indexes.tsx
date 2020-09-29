import React from 'react';
import { Form, Input, Button, Row, Col, Icon, AutoComplete, Tooltip } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { useDynamicList } from '@umijs/hooks';
import _ from 'lodash';
import request from '@pkgs/request';
import api from '@common/api';

const { Option } = AutoComplete;

interface CardProps extends FormComponentProps {
  module: string;
  index: number;
  tagKey: string;
  type: string;
  lookups: Array<{ labelname: string; oid: string, type: string }>;
  indexRemove: (index: number) => void;
  indexReplace: (index: number, obj: any) => void;
  indexIndex: number;
}

const fetchMibDetail = (module: string, metric: string) => {
  return request(`${api.snmp}/mib?module=${module}&metric=${metric}`);
};

const renderOption = (item: any) => {
  return (
    <Option key={item.metric} text={item.metric}>
      <Tooltip placement="left" title={item.note}>
        {item.metric}
      </Tooltip>
    </Option>
  );
}

const Card = (props: Props & CardProps) => {
  const { module } = props;
  const { list, getKey, push, remove, replace } = useDynamicList(props.lookups || []);

  return (
    <div style={{ border: '1px solid #e8e8e8', padding: 10, marginBottom: 10 }}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item label="tagKey">
            {props.form.getFieldDecorator(`indexes[${props.index}].tagKey`, {
              initialValue: props.tagKey,
              onChange: (value: string) => {
                fetchMibDetail(module, value).then((res) => {
                  props.indexReplace(props.index, {
                    tagKey: props.tagKey,
                    lookups: props.lookups,
                    type: res.mtype,
                  })
                });
              }
            } as any)(
              <AutoComplete
                optionLabelProp="text"
                dataSource={_.map(props.metrics, renderOption)}
                filterOption={(inputValue: string, option: any) => {
                  return _.includes(option.props.text, inputValue);
                }}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="type">
            {props.form.getFieldDecorator(`indexes[${props.index}].type`, {
              initialValue: props.type,
            })(
              <Input />
            )}
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="lookups">
        {list.map((ele: any, index: number) => (
          <Row gutter={5} key={getKey(index)}>
            <Col span={8}>
              {props.form.getFieldDecorator(`indexes[${props.index}].lookups[${getKey(index)}].labelname`, {
                initialValue: ele.labelname,
                onChange: (value: string) => {
                  fetchMibDetail(module, value).then((res) => {
                    replace(props.index, {
                      labelname: ele.labelname,
                      oid: res.oid,
                      type: res.mtype,
                    })
                  });
                }
              } as any)(
                <AutoComplete
                  optionLabelProp="text"
                  dataSource={_.map(props.metrics, renderOption)}
                  filterOption={(inputValue: string, option: any) => {
                    return _.includes(option.props.text, inputValue);
                  }}
                >
                  <Input addonBefore="labelname：" />
                </AutoComplete>
              )}
            </Col>
            <Col span={8}>
              {props.form.getFieldDecorator(`indexes[${props.index}].lookups[${getKey(index)}].oid`, {
                initialValue: ele.oid,
              })(
                <Input addonBefore="oid：" />
              )}
            </Col>
            <Col span={6}>
              {props.form.getFieldDecorator(`indexes[${props.index}].lookups[${getKey(index)}].type`, {
                initialValue: ele.type,
              })(
                <Input addonBefore="type：" />
              )}
            </Col>
            <Col span={2}>
              <Icon
                type="minus-circle-o"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  remove(index);
                }}
              />
            </Col>
          </Row>
        ))}
      </Form.Item>
      <Button block onClick={push}>
        Add lookup
      </Button>
      <Button block type="danger" ghost onClick={() => {
        props.indexRemove(props.indexIndex);
      }}>
        Delete index
      </Button>
    </div>
  );
};

interface ListItem {
  tagKey: string;
  type: string;
  lookups: Array<{ labelname: string; oid: string, type: string }>;
}

interface Props {
  module: string;
  metrics: string[];
  midDetail: {
    oid: string;
    mtype: string;
  };
  indexes: any[];
}

export default (props: Props & FormComponentProps) => {
  const { list, push, getKey, remove, replace } = useDynamicList(props.indexes || []);

  return (
    <div style={{ width: '100%', margin: 'auto', display: 'flex' }}>
      <div style={{ width: '100%' }}>
        {list.map((ele: any, index: number) => (
          <Card
            form={props.form}
            module={props.module}
            key={getKey(index)}
            lookups={ele.lookups}
            tagKey={ele.tagKey}
            type={ele.type}
            index={getKey(index)}
            indexRemove={remove}
            indexReplace={replace}
            indexIndex={index}
            metrics={props.metrics}
            midDetail={props.midDetail}
          />
        ))}
        <Button style={{ marginTop: 16 }} block onClick={() => push({} as ListItem)}>
          Add index
        </Button>
      </div>
    </div>
  );
};
