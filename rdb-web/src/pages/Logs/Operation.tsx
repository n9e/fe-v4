import React, { useState, useRef } from 'react';
import { Row, Col, Input, Select, DatePicker } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import FetchTable from '@pkgs/FetchTable';
import { UserProfile } from '@interface';
import api from '@common/api';

const { Option } = Select;
const { RangePicker } = DatePicker;
const defaultLastDays = 30;
const now = moment();

function LogsOperation() {
  const table = useRef<any>();
  const [btime, setBtime] = useState(now.clone().subtract(defaultLastDays, 'd').unix());
  const [etime, setEtime] = useState(now.clone().unix());
  const [query, setQuery] = useState('');
  const [lastDays, setLastDays] = useState<number | 'custom'>(defaultLastDays);
  const columns: ColumnProps<UserProfile>[] = [
    {
      title: <FormattedMessage id="log.username" />,
      dataIndex: 'username',
    }, {
      title: <FormattedMessage id="log.resCategory" />,
      dataIndex: 'res_cl',
    }, {
      title: <FormattedMessage id="log.detail" />,
      dataIndex: 'detail',
    }, {
      title: <FormattedMessage id="log.clock" />,
      dataIndex: 'clock',
      render: (text) => {
        return moment.unix(text).format();
      },
    },
  ];
  return (
    <div>
      <Row>
        <Col span={24} className="mb10">
          <Input.Search
            style={{ width: 200 }}
            placeholder="请输入用户名"
            onSearch={(val) => {
              const now = moment();
              let newbtime = btime;
              let newetime = etime;
              if (lastDays !== 'custom') {
                newbtime = now.clone().subtract(lastDays, 'd').unix();
                newetime = now.clone().unix();
              }
              setBtime(newbtime);
              setEtime(newetime);
              setQuery(val);
            }}
          />
          <Select
            style={{ width: 120, marginLeft: 10, marginRight: 10 }}
            value={lastDays}
            onChange={(val: number | 'custom') => {
              const now = moment();
              let newBtime = btime;
              if (typeof val === 'number') {
                newBtime = now.clone().subtract(val, 'd').unix()
              }
              setBtime(newBtime);
              setEtime(now.clone().unix());
              setLastDays(val);
            }}
          >
            <Option value={1}><FormattedMessage id="log.1d" /></Option>
            <Option value={7}><FormattedMessage id="log.7d" /></Option>
            <Option value={30}><FormattedMessage id="log.30d" /></Option>
            <Option value={90}><FormattedMessage id="log.90d" /></Option>
            <Option value="custom"><FormattedMessage id="log.custom" /></Option>
          </Select>
          {
            lastDays === 'custom' ?
              <RangePicker
                disabledDate={(current) => {
                  if (current) {
                    return current > moment().endOf('day');
                  }
                  return false;
                }}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                value={[moment.unix(btime), moment.unix(etime)]}
                onChange={(val) => {
                  if (val[0] && val[1]) {
                    setBtime(val[0].unix());
                    setEtime(val[1].unix());
                  }
                }}
              /> : null
          }
        </Col>
      </Row>
      <FetchTable
        ref={table}
        url={`${api.log}/operation`}
        query={{
          btime, etime, query,
        }}
        tableProps={{
          columns,
        }}
      />
    </div>
  );
}

export default LogsOperation;
