import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import request from '@pkgs/request';

export default function index(props: any) {
  const [data, setData] = useState([]);

  useEffect(() => {
    request('/api/ticket/queues?limit=5000').then((res) => {
      setData(res.list);
    });
  }, []);

  return (
    <Select
      mode="multiple"
      value={props.value}
      onChange={props.onChange}
    >
      {
        _.map(data, (item: any) => {
          return (
            <Select.Option key={item.identity} value={item.id}>
              {item.name}
            </Select.Option>
          );
        })
      }
    </Select>
  );
}
