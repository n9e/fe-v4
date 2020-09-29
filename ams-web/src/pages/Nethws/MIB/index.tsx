import React, { useState, useRef } from 'react';
import {
  Row, Col, Input, Button, Popconfirm, Tooltip, Card, message,
} from 'antd';
import _ from 'lodash';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import FetchTable from '@pkgs/FetchTable';
import useFormatMessage, { getIntl } from '@pkgs/hooks/useFormatMessage';
import api from '@pkgs/api';
import request, { errNotify } from '@pkgs/request';
import MIBForm from './MIBForm';

function index() {
  const intl = getIntl();
  const intlFmtMsg = useFormatMessage();
  const fetchTable = useRef<any>();
  const [query, setQuery] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  return (
    <Card>
      <Row style={{ marginBottom: 10 }}>
        <Col span={12}>
          <Input.Search
            className="mr10"
            style={{ width: 200, verticalAlign: 'top' }}
            onSearch={(val) => {
              setQuery({
                query: val,
              });
            }}
          />
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Popconfirm
            title={intlFmtMsg({ id: 'table.delete.sure' })}
            onConfirm={() => {
              request(`${api.mibs}`, {
                method: 'DELETE',
                body: JSON.stringify({
                  ids: selectedIds,
                }),
              }).then(() => {
                message.success(intl.formatMessage({ id: 'msg.delete.success' }));
                if (fetchTable && fetchTable.current) {
                  fetchTable.current.reload();
                }
              });
            }}
          >
            <Button disabled={_.isEmpty(selectedIds)}>
              { intlFmtMsg({ id: 'nethws.batch.operations.delete' }) }
            </Button>
          </Popconfirm>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              MIBForm({
                language: intl.locale,
                type: 'create',
                onOk: (values: any, destroy: any) => {
                  const fd = new FormData();
                  fd.append('file', values.file);
                  fd.append('module', values.module);
                  fd.append('note', values.note);

                  fetch(api.mibs, {
                    body: fd,
                    method: 'POST',
                  }).then((res) => {
                    if (res.ok) {
                      return res.json();
                    }
                    return undefined;
                  }).then((data) => {
                    if (data.err) {
                      errNotify(data.err);
                    } else {
                      destroy();
                      message.success(intl.formatMessage({ id: 'msg.create.success' }));
                      if (fetchTable && fetchTable.current) {
                        fetchTable.current.reload();
                      }
                    }
                  }).catch((res) => {
                    errNotify(res.statusText);
                  });
                },
              });
            }}
          >
            { intlFmtMsg({ id: 'table.create' }) }
          </Button>
        </Col>
      </Row>
      <FetchTable
        ref={fetchTable}
        url={api.mibs}
        query={query}
        tableProps={{
          columns: [
            {
              title: 'module',
              dataIndex: 'module',
            }, {
              title: 'metric',
              dataIndex: 'metric',
            }, {
              title: 'oid',
              dataIndex: 'oid',
            }, {
              title: 'mtype',
              dataIndex: 'mtype',
            }, {
              title: 'note',
              dataIndex: 'note',
              ellipsis: true,
              width: 200,
              render: (text) => <Tooltip placement="leftTop" title={text}>{text}</Tooltip>,
            }, {
              title: intlFmtMsg({ id: 'table.operations' }),
              width: 100,
              render: (_text, record) => (
                <span>
                  <Popconfirm
                    title={intlFmtMsg({ id: 'table.delete.sure' })}
                    onConfirm={() => {
                      request(`${api.mibs}`, {
                        method: 'DELETE',
                        body: JSON.stringify({
                          ids: [record.id],
                        }),
                      }).then(() => {
                        message.success(intl.formatMessage({ id: 'msg.delete.success' }));
                        if (fetchTable && fetchTable.current) {
                          fetchTable.current.reload();
                        }
                      });
                    }}
                  >
                    <a className="danger-link">{intlFmtMsg({ id: 'table.delete' })}</a>
                  </Popconfirm>
                </span>
              ),
            },
          ],
          rowSelection: {
            selectedRowKeys: selectedIds,
            onChange: (selectedRowKeys) => {
              setSelectedIds(selectedRowKeys as any);
            },
          },
        }}
      />
    </Card>
  );
}

export default CreateIncludeNsTree(index, { visible: false });
