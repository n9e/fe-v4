import React, { useRef, useState } from 'react';
import { Button, Form, Radio, Input, Card } from 'antd';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import exportHosts from '@common/exportHosts';
import Hosts from '@cpts/Hosts';
import api from '@pkgs/api';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

function index(props: any) {
  const hosts = useRef<any>();
  const { getFieldDecorator, getFieldValue } = props.form!;
  const [url, setUrl] = useState('');
  const [field, setField] = useState('');
  const [batch, setBatch] = useState('');
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setUrl(`${api.hosts}/search`);
    setField(getFieldValue('field'));
    setBatch(getFieldValue('batch'));
  }

  return (
    <Card>
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItem label={<FormattedMessage id="hosts.filter.field" />}>
          {getFieldDecorator('field', {
            initialValue: 'ident',
          })(
            <RadioGroup>
              <Radio value="sn">SN</Radio>
              <Radio value="ip">IP</Radio>
              <Radio value="ident"><FormattedMessage id="hosts.ident" /></Radio>
              <Radio value="name"><FormattedMessage id="hosts.name" /></Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="hosts.filter.value" />}>
          {getFieldDecorator('batch', {
            initialValue: '',
          })(
            <Input.TextArea
              autosize={{ minRows: 2, maxRows: 10 }}
            />,
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="hosts.search" />
          </Button>
        </FormItem>
      </Form>
      <Hosts
        ref={hosts}
        mode="search"
        fetchUrl={url}
        field={field}
        batch={batch}
        export={async (fetchData: any) => {
          const result = await fetchData({ limit: 10000 });
          if (result) {
            const { data } = result;
            const newData = _.map(data, (item) => ({
              ...item,
              nodes: _.join(_.map(item.nodes, (item) => item.path), '\n\r'),
            }));
            exportHosts(newData, []);
          }
        }}
      />
    </Card>
  )
}

export default Form.create()(index);
