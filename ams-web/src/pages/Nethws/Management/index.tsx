import React, { useState, useRef } from 'react';
import {
  Row, Col, Input, Button, Divider, Popconfirm, Dropdown, Menu, Card, message,
} from 'antd';
import _ from 'lodash';
import FetchTable from '@pkgs/FetchTable';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import useFormatMessage, { getIntl } from '@pkgs/hooks/useFormatMessage';
import DynamicColumns from '@pkgs/DynamicColumns';
import TenantSelect from '@pkgs/TenantSelect';
import { FormattedMessage } from 'react-intl';
import api from '@pkgs/api';
import request from '@pkgs/request';
import NethwsForm from './NethwsForm';
import Batch from './Batch';

function index() {
  const intl = getIntl();
  const intlFmtMsg = useFormatMessage();
  const fetchTable = useRef<any>();
  const [query, setQuery] = useState({}) as any;
  const [selectedIds, setSelectedIds] = useState([]);
  const [dynamicColumnsValue, setDynamicColumnsValue] = useState(['ip', 'name', 'sn', 'cate', 'region', 'info', 'uptime', 'note']);
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
    }, {
      title: intlFmtMsg({ id: 'table.operations' }),
      width: 150,
      render: (_text: any, record: any) => (
        <span>
          <a
            onClick={() => {
              NethwsForm({
                language: intl.locale,
                type: 'modify',
                initialValues: record,
                onOk: (values: any) => request(`${api.nethw}/obj/${record.id}`, {
                  method: 'PUT',
                  body: JSON.stringify(values),
                }).then(() => {
                  message.success(intl.formatMessage({ id: 'msg.modify.success' }));
                  if (fetchTable && fetchTable.current) {
                    fetchTable.current.reload();
                  }
                }),
              });
            }}
          >
            {intlFmtMsg({ id: 'table.modify' })}
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title={intlFmtMsg({ id: 'table.delete.sure' })}
            onConfirm={() => {
              request(`${api.nethws}`, {
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
  ];
  columns = _.map(columns, (column) => {
    let visible = true;
    if (column.dataIndex) {
      visible = dynamicColumnsValue.indexOf(column.dataIndex) > -1;
    }
    return {
      ...column,
      visible,
    };
  });
  const dynamicColumnsOptions = _.map(_.filter(columns, (column) => column.dataIndex), (column: any) => ({
    label: column.title,
    value: column.dataIndex,
    disabled: column.disabled,
  }));
  return (
    <Card>
      <Row style={{ marginBottom: 10 }}>
        <Col span={16}>
          <Input.Search
            className="mr10"
            style={{ width: 200, verticalAlign: 'top' }}
            onSearch={(val) => {
              setQuery({
                ...query,
                query: val,
              });
            }}
          />
          <TenantSelect
            style={{ minWidth: 100, marginRight: 10 }}
            type="all"
            placeholder={<FormattedMessage id="hosts.select.tenant" />}
            value={query.tenant || '选择租户'}
            onChange={(val: string) => {
              setQuery({...query, tenant: val})
            }}
          />
          <DynamicColumns
            targetType="button"
            uid="hsp-hosts"
            options={dynamicColumnsOptions}
            value={dynamicColumnsValue}
            onChange={(keys: string[]) => {
              setDynamicColumnsValue(keys);
            }}
          />
          <Button
            className="ml10"
            onClick={() => {
              fetchTable.current.reload();
            }}
          >
            {intlFmtMsg({ id: 'nethws.refresh.button' })}
          </Button>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Dropdown
            overlay={(
              <Menu>
                <Menu.Item>
                  <Button
                    type="link"
                    disabled={_.isEmpty(selectedIds)}
                    onClick={() => {
                      Batch({
                        field: 'cate',
                        onOk: (value: any) => {
                          request(`${api.nethw}/cate`, {
                            method: 'PUT',
                            body: JSON.stringify({
                              ids: selectedIds,
                              ...value,
                            }),
                          }).then(() => {
                            message.success(intl.formatMessage({ id: 'msg.modify.success' }));
                            if (fetchTable && fetchTable.current) {
                              fetchTable.current.reload();
                            }
                          });
                        },
                      });
                    }}
                  >
                    {intlFmtMsg({ id: 'nethws.batch.operations.modify.cate' })}
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    type="link"
                    disabled={_.isEmpty(selectedIds)}
                    onClick={() => {
                      Batch({
                        field: 'note',
                        onOk: (value: any) => {
                          request(`${api.nethw}/note`, {
                            method: 'PUT',
                            body: JSON.stringify({
                              ids: selectedIds,
                              ...value,
                            }),
                          }).then(() => {
                            message.success(intl.formatMessage({ id: 'msg.modify.success' }));
                            if (fetchTable && fetchTable.current) {
                              fetchTable.current.reload();
                            }
                          });
                        },
                      });
                    }}
                  >
                    {intlFmtMsg({ id: 'nethws.batch.operations.modify.note' })}
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    disabled={_.isEmpty(selectedIds)}
                    type="link"
                    onClick={() => {
                      Batch({
                        intl,
                        field: 'tenant',
                        onOk: (value: any) => {
                          request(`${api.nethw}/tenant`, {
                            method: 'PUT',
                            body: JSON.stringify({
                              ids: selectedIds,
                              ...value,
                            }),
                          }).then(() => {
                            message.success(intl.formatMessage({ id: 'msg.modify.success' }));
                            if (fetchTable && fetchTable.current) {
                              fetchTable.current.reload();
                            }
                          });
                        }
                      });
                    }}
                  >
                    {intlFmtMsg({ id: 'hosts.batch.modify.tenant' })}
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Popconfirm
                    title={intlFmtMsg({ id: 'table.delete.sure' })}
                    onConfirm={() => {
                      request(`${api.nethws}`, {
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
                    <Button type="link" disabled={_.isEmpty(selectedIds)}>
                      {intlFmtMsg({ id: 'nethws.batch.operations.delete' })}
                    </Button>
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            )}
          >
            <Button icon="down">
              {intlFmtMsg({ id: 'nethws.batch.operations' })}
            </Button>
          </Dropdown>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              NethwsForm({
                language: intl.locale,
                type: 'create',
                onOk: (values: any) => request(api.nethws, {
                  method: 'POST',
                  body: JSON.stringify(values),
                }).then(() => {
                  message.success(intl.formatMessage({ id: 'msg.create.success' }));
                  if (fetchTable && fetchTable.current) {
                    fetchTable.current.reload();
                  }
                }),
              });
            }}
          >
            {intlFmtMsg({ id: 'table.create' })}
          </Button>
        </Col>
      </Row>
      <FetchTable
        ref={fetchTable}
        url={api.nethws}
        query={query}
        tableProps={{
          columns: _.filter(columns, (column: any) => column.visible) as any,
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
