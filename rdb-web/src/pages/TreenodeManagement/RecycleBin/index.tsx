import React, { useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';
import FetchTable from '@pkgs/FetchTable';
import api from '@pkgs/api';
import request from '@pkgs/request';

export default function index() {
  const table = useRef<any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[] | number[]>([]);
  const onRecycle = () => {
    request(`${api.nodes}/trash/recycle`, {
      method: 'PUT',
      body: JSON.stringify({
        ids: selectedRowKeys,
      }),
    }).then(() => {
      if (table && table.current) {
        table.current.reload();
      }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Button
          disabled={selectedRowKeys.length === 0}
          onClick={onRecycle}
        >
          恢复节点
        </Button>
      </div>
      <FetchTable
        ref={table}
        url={`${api.nodes}/trash`}
        tableProps={{
          columns: [{
            title: 'ID',
            dataIndex: 'id',
          },{
            title: <FormattedMessage id="node.name" />,
            dataIndex: 'name',
          }, {
            title: <FormattedMessage id="node.cate" />,
            dataIndex: 'cate',
          }, {
            title: <FormattedMessage id="node.path" />,
            dataIndex: 'path',
          }, {
            title: <FormattedMessage id="node.note" />,
            dataIndex: 'note',
          }],
          rowSelection: {
            selectedRowKeys,
            onChange: (newSelectedRowKeys) => {
              setSelectedRowKeys(newSelectedRowKeys);
            }
          }
        }}
      />
    </div>
  )
}
