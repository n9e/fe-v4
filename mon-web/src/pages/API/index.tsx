import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col, Input, Button, Table, Form, Modal, Dropdown, Icon, Menu, message } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';
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
  return request(`${api.networkCollect}/list?nid=${nid}&type=api`).then((res) => {
    return { data: res };
  });
};

const handleDelete = (record: DataItem, refresh: () => void, intlFmtMsg: any) => {
  request(api.networkCollect, {
    method: 'DELETE',
    body: JSON.stringify([{
      type: 'api',
      ids: [record.id],
    }]),
  }).then(() => {
    message.success(intlFmtMsg({ id: 'msg.delete.success' }));
    refresh();
  });
};

const handleOpenGraphs = (graphs: any) => {
  const now = moment();
  const end = now.clone().format('x');
  const start = now.clone().subtract(1, 'hour').format('x');

  const newGraphs = _.map(graphs, (graph) => {
    return {
      ...graph,
      title: 'api.status',
      type: 'chart',
      now: end,
      start,
      end,
      legend: false,
      shared: false,
    };
  });
  const configsList = _.map(newGraphs, (item) => {
    return {
      configs: JSON.stringify(item),
    };
  });
  request(api.tmpchart, {
    method: 'POST',
    body: JSON.stringify(configsList),
  }).then((res) => {
    window.open(`/mon/tmpchart?id=${_.join(res, ',')}`, '_blank');
  });
};

const handleAddAlarm = async (search: string, cid?: number) => {
  if (cid) {
    try {
      const result = await request(`${api.networkCollect}/api/stra?cid=${cid}`);
      if (result.has) {
        window.open(`/mon/strategy/${result.sid}`, '_blank');
      } else {
        window.open(`/mon/strategy/add?${search}&cid=${cid}`, '_blank');
      }
    } catch (e) {
      console.log(e);
    }
  } else {
    Modal.confirm({
      content: '批量报警产生的配置将只能去报警策略里面修改',
      onOk() {
        window.open(`/mon/strategy/add?${search}`, '_blank');
      },
    });
  }
};

const API = (props: any) => {
  const intlFmtMsg = useFormatMessage();
  const { getFieldDecorator, getFieldValue } = props.form;
  const nstreeContext = useContext(NsTreeContext);
  const nid = _.get(nstreeContext, 'data.selectedNode.id');
  const { tableProps, refresh, search } = useAntdTable(() => getTableData(nid), [nid], {
    form: props.form,
    formatResult: (result: any) => { // TODO ts
      const searchValue = getFieldValue('searchValue');
      const filterResult = _.filter(result.data, (item) => {
        const url = getURL(item);
        if (searchValue) {
          return item.name.indexOf(searchValue) > -1 || url.indexOf(searchValue) > -1;
        }
        return true;
      });
      return { data: filterResult, total: filterResult.length };
    },
  });
  const columns: ColumnProps<DataItem>[] = [
    {
      title: <FormattedMessage id="api.name" />,
      dataIndex: 'name',
    }, {
      title: <FormattedMessage id="api.url" />,
      render: (_t, record) => {
        return getURL(record);
      },
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
                  <Link to={{ pathname: `/api/modify/${record.id}` }}><FormattedMessage id="table.modify" /></Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to={{ pathname: `/api/clone/${record.id}` }}><FormattedMessage id="table.clone" /></Link>
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
                {/* <Menu.Item>
                  <a
                    onClick={() => {
                      handleOpenGraphs([{
                        metrics: [{
                          selectedEndpoint: [record.domain],
                          endpoints: [record.domain],
                          selectedTagkv: [{
                            tagk: 'endpoint',
                            tagv: [record.domain],
                          }, {
                            tagk: 'path',
                            tagv: [record.path],
                          }, {
                            tagk: 'method',
                            tagv: [record.method],
                          }, {
                            tagk: 'port',
                            tagv: [String(record.port)],
                          }],
                          selectedMetric: 'api.status',
                        }],
                      }]);
                    }}
                  ><FormattedMessage id="api.viewGraph" /></a>
                </Menu.Item>
                <Menu.Item>
                  <a
                    onClick={() => {
                      const query = {
                        nid,
                        metric: 'api.status',
                        endpoints: record.domain,
                        path: record.path,
                        method: record.method,
                        port: record.port,
                      };
                      handleAddAlarm(queryString.stringify(query), record.id)
                    }}
                  ><FormattedMessage id="api.alarm" /></a>
                </Menu.Item> */}
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
          <Button style={{ marginRight: 8 }}>
            <Link to={{ pathname: '/api/add' }}><FormattedMessage id="table.create" /></Link>
          </Button>
          {/* <Button
            disabled={selectedRows.length === 0}
            style={{ marginRight: 8 }}
            onClick={() => {
              handleOpenGraphs([{
                metrics: [{
                  selectedEndpoint: _.map(selectedRows, 'domain'),
                  endpoints: _.map(selectedRows, 'domain'),
                  selectedMetric: 'api.status',
                  selectedTagkv: [{
                    tagk: 'endpoint',
                    tagv: _.union(_.map(selectedRows, 'domain')),
                  }, {
                    tagk: 'path',
                    tagv: _.union(_.map(selectedRows, 'path')),
                  }, {
                    tagk: 'method',
                    tagv: _.union(_.map(selectedRows, 'method')),
                  }, {
                    tagk: 'port',
                    tagv: _.union(_.map(selectedRows, o => String(o.port))),
                  }],
                }],
              }]);
            }}
          >
            <FormattedMessage id="api.batch.viewGraph" />
          </Button> */}
          {/* <Button
            disabled={selectedRows.length === 0}
            onClick={() => {
              const query = {
                nid,
                metric: 'api.status',
                endpoints: _.union(_.map(selectedRows, 'domain')),
                path: _.union(_.map(selectedRows, 'path')),
                method: _.union(_.map(selectedRows, 'method')),
                port: _.union(_.map(selectedRows, 'port')),
              };
              handleAddAlarm(queryString.stringify(query));
            }}
          >
            <FormattedMessage id="api.batch.alarm" />
          </Button> */}
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

export default injectIntl(CreateIncludeNsTree(Form.create()(API), { visible: true }));
