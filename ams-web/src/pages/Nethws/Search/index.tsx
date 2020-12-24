import React, { useRef, useState } from 'react';
import { Button, Form, Radio, Input, Card } from 'antd';
import _ from 'lodash';
import exportHosts from '@common/exportHosts';
import { FormattedMessage } from 'react-intl';
import FetchTable from '@pkgs/FetchTable';
import useFormatMessage, { getIntl } from '@pkgs/hooks/useFormatMessage';
import api from '@pkgs/api';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

function index(props: any) {
  const fetchTable = useRef<any>();
  const intlFmtMsg = useFormatMessage();
  const { getFieldDecorator, getFieldValue } = props.form!;
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState({}) as any;
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setUrl(`${api.nethws}/search`);
    setQuery({...query, field: getFieldValue('field'), batch: getFieldValue('batch') })
  }

  let columns = [
    {
      title: 'ip',
      dataIndex: 'ip',
    }, {
      title: 'name',
      dataIndex: 'name',
    }, {
      title: 'sn',
      dataIndex: 'sn',
    }, {
      title: intlFmtMsg({ id: 'nethws.cate' }),
      dataIndex: 'cate',
    }, {
      title: 'region',
      dataIndex: 'region',
    }, {
      title: intlFmtMsg({ id: 'nethws.info' }),
      dataIndex: 'info',
    }, {
      title: intlFmtMsg({ id: 'nethws.uptime' }),
      dataIndex: 'uptime',
      render: (text: number) => {
        const msOfDay = 1000 * 60 * 60 * 24;
        const msOfHour = 1000 * 60 * 60;
        const msOfMin = 1000 * 60;

        if (text > -1) {
          const days = Math.floor(text / msOfDay);
          const hours = Math.floor(text / msOfHour) % 24;
          const mins = Math.floor(text / msOfMin) % 60;
          const seconds = Math.floor(text / msOfMin) % 60;
          if (days > 1) {
            return `${days} 天 ${hours} 小时 ${mins} 分钟 ${seconds} 秒`;
          } if (hours > 1) {
            return `${hours} 小时 ${mins} 分钟 ${seconds} 秒`;
          } if (mins > 1) {
            return `${mins} 分钟 ${seconds} 秒`;
          } if (seconds > 1) {
            return `${seconds} 秒`;
          }
          return null;
        }
        return text;
      },
    }, {
      title: intlFmtMsg({ id: 'nethws.note' }),
      dataIndex: 'note',
    }, {
      title: intlFmtMsg({ id: 'hosts.tenant' }),
      dataIndex: 'tenant',
    }
  ];

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

      <FetchTable
        ref={fetchTable}
        url={url}
        tableProps={{columns}}
      />
    </Card>
  )
}

export default Form.create()(index);
