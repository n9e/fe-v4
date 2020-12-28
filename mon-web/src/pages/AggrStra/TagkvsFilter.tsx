import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { Form, Select, AutoComplete, Icon, Button } from 'antd';
import { FormComponentProps } from "antd/lib/form/Form";
import { useDynamicList } from '@umijs/hooks';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import { getTagkv } from './services';

const FormItem = Form.Item;
const { Option } = Select;

interface Props {
  idx: number;
  initialValues: any;
  endpointsKey: string;
  endpointsVal: string[];
  metric: string;
  onTagksOnChange: (tagks: string[]) => void;
}

export default function TagkvsFilter(props: Props & FormComponentProps) {
  const intlFmtMsg = useFormatMessage();
  const { initialValues, endpointsKey, endpointsVal, metric } = props;
  const { getFieldDecorator, getFieldValue } = props.form;
  const { list, push, remove } = useDynamicList(initialValues);
  const [tagkvs, setTagkvs] = useState<any>([]);
  const [tagks, setTagks] = useState(_.map(tagkvs, tagkv => tagkv.tagk));

  const fetchTagkvs = (endpointsVal: any, metric: any, endpointsKey: any) => {
    getTagkv(endpointsVal, metric, endpointsKey).then((res) => {
      setTagkvs(res);
      const tagks = _.map(res, 'tagk');
      setTagks(tagks);
      props.onTagksOnChange(tagks);
    });
  };
  const debounceLoadData = useCallback(_.debounce(fetchTagkvs, 1000), []);

  useEffect(() => {
    if (!_.isEmpty(endpointsVal) && metric) {
      debounceLoadData(endpointsVal, metric, endpointsKey);
    }
  }, [JSON.stringify(endpointsVal), metric, endpointsKey]);

  return (
    <div>
      {
        _.map(list, (item: any, idx: number) => {
          const currentTagk = getFieldValue(`raw_metrics[${props.idx}].filters[${idx}].tagk`) || _.get(item, 'tagk');
          const currentTagvs = _.sortBy(
            _.get(_.find(tagkvs, { tagk: currentTagk }), 'tagv', [])
          );
          return (
            <div key={`${_.get(item, 'tagk')}-${idx}`}>
              <FormItem style={{ display: 'inline-block' }}>
                {getFieldDecorator(`raw_metrics[${props.idx}].filters[${idx}].tagk`, {
                  initialValue: _.get(item, 'tagk'),
                  rules: [{ required: true, message:"必填项！"}],
                })(
                  <AutoComplete
                    allowClear
                    style={{ width: 100, marginRight: 10 }}
                    placeholder={intlFmtMsg({ id: 'aggrStra.settings.originMetric.tags.key' })}
                    dataSource={tagks}
                  />
                )}
              </FormItem>
              <FormItem style={{ display: 'inline-block' }}>
                {getFieldDecorator(`raw_metrics[${props.idx}].filters[${idx}].opt`, {
                  initialValue: _.get(item, 'opt'),
                  rules: [{ required: true, message:"请选择！" }],
                })(
                  <Select
                    style={{ width: 70, marginRight: 10 }}
                  >
                    <Option key="=">{intlFmtMsg({ id: 'aggrStra.settings.originMetric.tags.opt.include' })}</Option>
                    <Option key="!=">{intlFmtMsg({ id: 'aggrStra.settings.originMetric.tags.opt.exclude' })}</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem style={{ display: 'inline-block' }}>
                {getFieldDecorator(`raw_metrics[${props.idx}].filters[${idx}].tagv`, {
                  initialValue: _.get(item, 'tagv'),
                  rules: [{ required: true, message:"请选择！" }],
                })(
                  <Select
                    allowClear
                    style={{ width: 495 }}
                    placeholder={intlFmtMsg({ id: 'aggrStra.settings.originMetric.tags.value' })}
                    mode="tags"
                  >
                    {_.map(currentTagvs, tagvItem => {
                      return <Option key={tagvItem}>{tagvItem}</Option>;
                    })}
                  </Select>
                )}
              </FormItem>
              <Icon
                style={{
                  marginLeft: 10,
                  color: '#f50',
                  fontSize: 18,
                  cursor: 'pointer',
                  verticalAlign: 'middle',
                }}
                type="minus-circle"
                onClick={() => {
                  remove(idx);
                }}
              />
            </div>
          )
        })
      }
      <Button
        size="small"
        onClick={() => {
          push({
            tagk: '',
            opt: '=',
            tagv: [],
          });
        }}
      >
        {intlFmtMsg({ id: 'aggrStra.settings.originMetric.tags.add' })}
      </Button>
    </div>
  )
}
