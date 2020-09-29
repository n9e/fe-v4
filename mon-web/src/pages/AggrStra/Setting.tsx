import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Modal, Form, Input, Button, AutoComplete, Select, Radio, TreeSelect } from 'antd';
import { useDynamicList } from '@umijs/hooks';
import ModalControl from '@pkgs/ModalControl';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import { normalizeTreeData, renderTreeNodes, filterTreeNodes } from '@pkgs/Layout/utils';
import TagkvsFilter from './TagkvsFilter';
import { getTreeData, getEndPoints, getMetrics } from './services';

const FormItem = Form.Item;
const { Option } = Select;
const alphabet: any = 'abcdefghijklmnopqrstuvwxyz'.split('');
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

function Setting(props: any) {
  const { initialValues } = props;
  const { nid, id } = initialValues;
  const intlFmtMsg = useFormatMessage();
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;
  const { list, push, remove } = useDynamicList(initialValues.raw_metrics);

  const handleOk = () => {
    props.form.validateFields((errors: any, data: any) => {
      if (!errors) {
        props.onOk(data);
        props.destroy();
      }
    });
  };
  const handleCancel = () => {
    props.destroy();
  };

  const [endpoints, setEndpoints] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [metricSearch, setMetricSearch] = useState('');
  const [treeData, setTreeData] = useState([]);
  const [tagks, setTagks] = useState<string[]>([]);

  const fetchTreeData = () => {
    getTreeData().then((res) => {
      const treeData = normalizeTreeData(res) as any;
      setTreeData(treeData);
    });
  }
  const fetchData = async (category = getFieldValue('category')) => {
    try {
      const newEndpointsObj = await getEndPoints(nid);
      const newEndpoints = _.map(newEndpointsObj, 'ident') as any;
      const endpointsKey = category === 1 ? 'endpoints' : 'nids';
      const endpointsVal = category === 1 ? newEndpoints : [nid];

      setEndpoints(newEndpoints);
      const newMetrics: any = await getMetrics(endpointsVal, endpointsKey);
      setMetrics(newMetrics);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (nid) {
      fetchTreeData();
      fetchData();
    }
  }, [nid]);

  const treeNodes = React.useMemo(() => {
    return renderTreeNodes(treeData, 'treeSelect');
  }, [treeData])

  const renderMetricSettings = (item: any, idx: number) => {
    getFieldDecorator(`raw_metrics[${idx}].var_id`, {
      initialValue: _.get(item, 'var_id', `$${alphabet[idx]}`),
    });

    return (
      <div
        key={_.get(item, 'var_id', alphabet[idx])}
        style={{
          borderBottom: '1px dashed #efefef',
          marginBottom: 20,
        }}
      >
        <FormItem
          {...formItemLayout}
          label={intlFmtMsg({ id: 'aggrStra.settings.node' })}
        >
          {
            getFieldDecorator(`raw_metrics[${idx}].nid`, {
              initialValue: _.get(item, 'nid'),
              onChange: () => {
                setFieldsValue({
                  [`raw_metrics[${idx}].excl_nid`]: [],
                });
              },
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
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intlFmtMsg({ id: 'aggrStra.settings.excl_nodes' })}
        >
          {
            getFieldDecorator(`raw_metrics[${idx}].excl_nid`, {
              initialValue: _.get(item, 'excl_nid'),
            })(
              <TreeSelect
                multiple
                showSearch
                allowClear
                treeDefaultExpandAll
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {renderTreeNodes(filterTreeNodes(treeData, getFieldValue(`raw_metrics[${idx}].nid`)), 'treeSelect')}
              </TreeSelect>,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={`${intlFmtMsg({ id: 'aggrStra.settings.originMetric.name'})} ${_.get(item, 'var_id', alphabet[idx])}`}
        >
          {getFieldDecorator(`raw_metrics[${idx}].name`, {
            initialValue: _.get(item, 'name'),
            rules: [{ required: true, message: 'required' }],
          })(
            <AutoComplete
              dataSource={_.filter(metrics, (o: string) => o.indexOf(metricSearch) > -1
              )}
              onSearch={val => {
                setMetricSearch(val);
              }}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'aggrStra.settings.originMetric.opt' })}>
          {getFieldDecorator(`raw_metrics[${idx}].opt`, {
            initialValue: _.get(item, 'opt', 'sum'),
            rules: [{ required: true, message: 'required' }],
          })(
            <Radio.Group>
              <Radio value="sum">sum</Radio>
              <Radio value="avg">avg</Radio>
              <Radio value="max">max</Radio>
              <Radio value="min">min</Radio>
              <Radio value="count">count</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intlFmtMsg({ id: 'aggrStra.settings.originMetric.tags' })}
          style={{ marginBottom: 10 }}
        >
          <TagkvsFilter
            form={props.form}
            initialValues={_.get(item, 'filters', [])}
            idx={idx}
            metric={getFieldValue(`raw_metrics[${idx}].name`)}
            endpointsKey={getFieldValue('category') === 1 ? 'endpoints' : 'nids'}
            endpointsVal={getFieldValue('category') === 1 ? endpoints : [nid]}
            onTagksOnChange={(newTagks: string[]) => {
              setTagks(_.union(tagks, newTagks));
            }}
          />
        </FormItem>
        {list.length > 1 ? (
          <FormItem wrapperCol={{ span: 18, offset: 4 }}>
            <Button
              size="small"
              onClick={() => { remove(idx); }}
            >
              {intlFmtMsg({ id: 'aggrStra.settings.originMetric.delete' })}
            </Button>
          </FormItem>
        ) : null}
      </div>
    );
  };

  getFieldDecorator('nid', { initialValue: nid });

  if (id) {
    getFieldDecorator('id', { initialValue: id });
  }

  return (
    <Modal
      width={1000}
      title={props.title}
      visible={props.visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form
        onSubmit={e => {
          e.preventDefault();
          handleOk();
        }}
      >
        <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'aggrStra.settings.category' })}>
          {getFieldDecorator('category', {
            initialValue: _.get(initialValues, 'category', 1),
            onChange: (e: any) => {
              fetchData(e.target.value);
            },
          })(
            <Radio.Group>
              <Radio value={1}>{intlFmtMsg({ id: 'aggrStra.settings.category.1' })}</Radio>
              <Radio value={2}>{intlFmtMsg({ id: 'aggrStra.settings.category.2' })}</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <fieldset>
          <legend>
            {intlFmtMsg({ id: 'aggrStra.settings.originMetric' })}

            <Button
              size="small"
              type="primary"
              style={{ marginLeft: 10 }}
              onClick={() => {
                push({
                  nid: initialValues.nid,
                  raw_metrics: [{
                    nid: initialValues.nid,
                    var_id: list.length,
                  }],
                });
              }}
            >
              {intlFmtMsg({ id: 'aggrStra.settings.originMetric.add' })}
            </Button>
          </legend>
          {
            _.map(list, (item: any, idx: number) => {
              return renderMetricSettings(item, idx);
            })
          }
        </fieldset>
        <fieldset>
          <legend>{intlFmtMsg({ id: 'aggrStra.settings.aggr' })}</legend>
          <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'aggrStra.settings.aggr.groupby' })}>
            {getFieldDecorator('groupby', {
              initialValue: _.get(initialValues, 'groupby') || undefined,
            })(
              <Select mode="tags">
                {_.map(tagks, option => {
                  return <Option key={option}>{option}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'aggrStra.settings.newMetric' })}>
            {getFieldDecorator('new_metric', {
              initialValue: _.isString(initialValues.new_metric)
                ? initialValues.new_metric.substr(5)
                : initialValues.new_metric,
              rules: [
                { required: true, message: 'required' },
              ],
            })(<Input addonBefore="aggr." />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={intlFmtMsg({ id: 'aggrStra.settings.expression' })}
            help={
              <div>
                <div>{intlFmtMsg({ id: 'aggrStra.settings.expression.help.1' })}</div>
                <div>{intlFmtMsg({ id: 'aggrStra.settings.expression.help.2' })}</div>
                <div>{intlFmtMsg({ id: 'aggrStra.settings.expression.help.3' })}</div>
              </div>
            }
          >
            {getFieldDecorator('expression', {
              initialValue: _.get(initialValues, 'expression'),
              rules: [
                { required: true, message: 'required' },
              ],
            })(<Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />)}
          </FormItem>
        </fieldset>
      </Form>
    </Modal>
  );
}

export default ModalControl(Form.create()(Setting));
