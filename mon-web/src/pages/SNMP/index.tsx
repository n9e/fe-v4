import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col, Input, Button, Table, Form, Modal, Dropdown, Icon, Menu, Popconfirm, message } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from '@umijs/hooks';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import request from '@pkgs/request';
import api from '@common/api';

interface DataItem {
  comment: string,
  created: string,
  creator: string,
  id: number,
  last_updated: string,
  last_updator: string,
  name: string,
  nid: number,
  header: { [index: string]: string },
  domain: string,
  interval: number,
  timeout: number,
  protocol: 'http' | 'https',
  port: number,
  method: 'GET' | 'POST' | 'PUT' | 'OPTIONS',
  path: string,
  post_body: string,
  expected_code: number,
  expected_string: number,
  unexpected_string: number,
}

const getURL = (record: DataItem) => {
  return `${record.protocol}://${record.domain}:${record.port}${record.path}`;
}

const getTableData = (nid: number) => {
  if (!nid) return;
  return request(`${api.networkCollect}/list?nid=${nid}&type=snmp`).then((res) => {
    return { data: res };
  });
};

const handleDelete = (record: DataItem, refresh: () => void, intlFmtMsg: any) => {
  request(api.networkCollect, {
    method: 'DELETE',
    body: JSON.stringify([{
      type: 'snmp',
      ids: [record.id],
    }]),
  }).then(() => {
    message.success(intlFmtMsg({ id: 'msg.delete.success' }));
    refresh();
  });
};

const SNMP = (props: any) => {
  const intlFmtMsg = useFormatMessage();
  const { getFieldDecorator, getFieldValue } = props.form;
  const nstreeContext = useContext(NsTreeContext);
  const nid = _.get(nstreeContext, 'data.selectedNode.id');
  const { tableProps, refresh, search } = useAntdTable(() => getTableData(nid), [nid], {
    form: props.form,
    formatResult: (result: any) => { // TODO ts
      const searchValue = getFieldValue('searchValue');
      const filterResult = _.filter(result.data, (item) => {
        if (searchValue) {
          return item.metric.indexOf(searchValue) > -1;
        }
        return true;
      });
      return { data: filterResult, total: filterResult.length };
    },
  });
  const columns: ColumnProps<DataItem>[] = [
    {
      title: <FormattedMessage id="snmp.oid_type" />,
      dataIndex: 'oid_type',
      render: (text) => {
        return <FormattedMessage id={`snmp.oid_type.${text}`} />;
      },
    }, {
      title: <FormattedMessage id="snmp.metric" />,
      dataIndex: 'metric',
    }, {
      title: <FormattedMessage id="snmp.metric_type" />,
      dataIndex: 'metric_type',
    }, {
      title: <FormattedMessage id="snmp.oid" />,
      dataIndex: 'oid',
    }, {
      title: <FormattedMessage id="snmp.module" />,
      dataIndex: 'module',
    }, {
      title: <FormattedMessage id="table.creator" />,
      dataIndex: 'creator',
      width: 80,
    }, {
      title: <FormattedMessage id="table.lastupdated" />,
      dataIndex: 'last_updated',
      render: (text) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
    }, {
      title: <FormattedMessage id="table.operations" />,
      width: 100,
      render: (_text, record) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <Link to={{ pathname: `/snmp/modify/${record.id}` }}><FormattedMessage id="table.modify" /></Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to={{ pathname: `/snmp/clone/${record.id}` }}><FormattedMessage id="table.clone" /></Link>
                </Menu.Item>
                <Menu.Item>
                  <a
                    onClick={() => {
                      Modal.confirm({
                        title: props.intl.formatMessage({ id: 'table.delete.sure' }),
                        onOk() {
                          handleDelete(record, refresh, intlFmtMsg);
                        },
                      });
                    }}
                  ><FormattedMessage id="table.delete" /></a>
                </Menu.Item>
              </Menu>
            }
          >
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
              <Icon type="more" style={{ fontSize: 24, fontWeight: 900 }} />
            </a>
          </Dropdown>
        );
      },
    },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState();
  const [selectedRows, setSelectedRows] = useState([] as any);

  if (!nid) {
    return (
      <div>
        <FormattedMessage id="node.select.help" />
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col span={12} className="mb10">
          <Form>
            {getFieldDecorator('searchValue')(
              <Input.Search placeholder="Search" style={{ width: 200 }} onSearch={search!.submit} />, // TODO ts
            )}
          </Form>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Popconfirm
            title={<FormattedMessage id="table.delete.sure" />}
            onConfirm={() => {
              request(api.networkCollect, {
                method: 'DELETE',
                body: JSON.stringify([{
                  type: 'snmp',
                  ids: _.map(selectedRows, 'id'),
                }]),
              }).then(() => {
                message.success(intlFmtMsg({ id: 'msg.delete.success' }));
                refresh();
              })
            }}
          >
            <Button
              style={{ marginRight: 8 }}
              disabled={selectedRows.length === 0}
            >
              <FormattedMessage id="table.delete.batch" />
            </Button>
          </Popconfirm>
          <Button style={{ marginRight: 8 }}>
            <Link to={{ pathname: '/snmp/add' }}><FormattedMessage id="table.create" /></Link>
          </Button>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys as any);
            setSelectedRows(selectedRows);
          },
        }}
        {...tableProps}
      />
    </>
  );
};

export default injectIntl(CreateIncludeNsTree(Form.create()(SNMP), { visible: true }));
