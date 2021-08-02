import React, { useContext, useState, useEffect } from 'react';
import { Card, Table, Row, Col, Button, Input, message, Divider, Popconfirm, Tooltip, Modal, Dropdown, Menu } from 'antd';
import _ from 'lodash';
import useFormatMessage, { getIntl } from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import request from '@pkgs/request';
import api from '@common/api';
import Setting from './Setting';
import { getAggrStraList, deleteAggrStra, addAggrStra, modifyAggrStra } from './services';
import BatchImportExportModal from './BatchImportExportModal';
import BatchCloneToNidModal from './BatchCloneToNidModal';


function filterData(data: any, searchValue: string) {
  if (searchValue) {
    return _.filter(data, (item: any) => {
      return (
        _.includes(item.ns, searchValue) ||
        _.includes(item.newMetric, searchValue) ||
        _.includes(item.new_metric, searchValue) ||
        _.includes(item.status, searchValue) ||
        _.includes(item.lastUser, searchValue)
      );
    });
  }
  return data;
}

function index(props: any) {
  const intl = getIntl();
  const intlFmtMsg = useFormatMessage();
  const nstreeContext = useContext(NsTreeContext);
  const treeNodes = _.get(nstreeContext, 'data.treeNodes');
  const nid = _.get(nstreeContext, 'data.selectedNode.id');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([] as any);

  const fetchData = () => {
    if (nid) {
      setLoading(true);
      getAggrStraList(nid).then((res: any) => {
        setData(res);
      })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData([]);
    }
  };

  const handleAdd = () => {
    Setting({
      language: intl.locale,
      title: intlFmtMsg({ id: 'aggrStra.add.title' }),
      initialValues: {
        nid,
        raw_metrics: [{
          nid,
        }],
      },
      onOk: (reqBody: any) => {
        addAggrStra({
          ...reqBody,
          new_metric: `aggr.${reqBody.new_metric}`
        }).then(() => {
          message.success(intlFmtMsg({ id: 'msg.add.success' }));
          fetchData();
        });
      },
    });
  };

  const handleModify = (record: any) => {
    Setting({
      title: intlFmtMsg({ id: 'aggrStra.modify.title' }),
      initialValues: record,
      onOk: (reqBody: any) => {
        modifyAggrStra({
          ...reqBody,
          new_metric: `aggr.${reqBody.new_metric}`
        }).then(() => {
          message.success(intlFmtMsg({ id: 'msg.modify.success' }));
          fetchData();
        });
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteAggrStra(id).then(() => {
      message.success(intlFmtMsg({ id: 'msg.delete.success' }));
      fetchData();
    });
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: intlFmtMsg({ id: 'table.delete.there.sure' }),
      onOk() {
        deleteAggrStra(selectedRowKeys).then(() => {
          message.success(intlFmtMsg({ id: 'msg.delete.success' }));
          fetchData();
        });
      },
    });
  };

  const handleBatchExportBtnClick = (selectedRows: any[]) => {
    const newSelectedRows = _.map(selectedRows as any, (row) => {
      const record = _.cloneDeep(row);
      delete record.id;
      delete record.nid;
      delete record.creator;
      delete record.created;
      delete record.last_updator;
      delete record.last_updated;
      return record;
    });
    BatchImportExportModal({
      data: newSelectedRows,
      type: 'export',
      title: '导出策略',
    });
  }

  const handleBatchImportBtnClick = (nid: number) => {
    BatchImportExportModal({
      type: 'import',
      title: '导入策略',
      selectedNid: nid,
      onOk: () => {
        fetchData();
      },
    });
  }

  const handleBatchCloneToOtherNid = (selectedRows: any[], treeNodes: any[]) => {
    BatchCloneToNidModal({
      treeNodes,
      onOk: (nid: number) => {
        const reqBody = _.map(selectedRows, (item) => {
          const pureItem = _.pickBy(item, (v, k) => {
            return !_.includes(['id', 'creator', 'created', 'last_updator', 'last_updated'], k);
          });
          return {
            ...pureItem,
            nid,
          };
        });
        request(api.aggr, {
          method: 'POST',
          body: JSON.stringify(reqBody[0]),
        }).then(() => {
          message.success('克隆成功!');
          fetchData();
        });
      },
    });
  }

  useEffect(() => {
    fetchData();
  }, [nid]);

  if (!nid) {
    return (
      <div>
        <FormattedMessage id="node.select.help" />
      </div>
    );
  }

  return (
    <Card>
      <Row style={{ marginBottom: 10 }}>
        <Col span={12}>
          <Input
            style={{ width: 200 }}
            value={searchValue}
            placeholder="请输入查询名称"
            onChange={e => {
              setSearchValue(e.target.value);
            }}
          />
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            onClick={handleAdd}
            style={{ marginRight: 10 }}
          >
            {intlFmtMsg({ id: 'aggrStra.add.btn' })}
          </Button>
          <Dropdown overlay={
            <Menu>
              <Menu.Item>
                <a onClick={handleBatchDelete}>批量删除</a>
              </Menu.Item>
              <Menu.Item>
                <a onClick={() => { handleBatchCloneToOtherNid(selectedRows, treeNodes) }}>克隆到其他节点</a>
              </Menu.Item>
              <Menu.Item>
                <a onClick={() => { handleBatchImportBtnClick(nid) }}>导入策略</a>
              </Menu.Item>
              <Menu.Item>
                <a onClick={() => { handleBatchExportBtnClick(selectedRows) }}>导出策略</a>
              </Menu.Item>
            </Menu>
          }>
            <Button icon="down" >批量操作</Button>
          </Dropdown>
        </Col>
      </Row>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filterData(data, searchValue)}
        columns={[
          {
            title: intlFmtMsg({ id: 'aggrStra.metric' }),
            dataIndex: 'new_metric',
          },
          {
            title: intlFmtMsg({ id: 'aggrStra.lastUser' }),
            dataIndex: 'last_updator',
          },
          {
            title: intlFmtMsg({ id: 'aggrStra.updated' }),
            dataIndex: 'last_updated',
            render: (text) => {
              return moment(text).format('YYYY-MM-DD HH:mm:ss');
            },
          },
          {
            title: intlFmtMsg({ id: 'table.operations' }),
            render: (text, record: any) => {
              return (
                <span>
                  {record.nid === nid ? (
                    <a onClick={() => handleModify(record)}>
                      {intlFmtMsg({ id: 'table.modify' })}
                    </a>
                  ) : (
                      <Tooltip
                        title={intlFmtMsg({
                          id: 'aggrStra.modify.target.node',
                          values: { node: record.ns },
                        })}
                      >
                        <span>{intlFmtMsg({ id: 'table.modify' })}</span>
                      </Tooltip>
                    )}

                  <Divider type="vertical" />
                  {record.nid === nid ? (
                    <Popconfirm
                      title={intlFmtMsg({ id: 'table.delete.sure' })}
                      onConfirm={() => handleDelete(record.id)}
                    >
                      <a>{intlFmtMsg({ id: 'table.delete' })}</a>
                    </Popconfirm>
                  ) : (
                      <Tooltip
                        title={intlFmtMsg({
                          id: 'aggrStra.delete.target.node',
                          values: { node: record.ns },
                        })}
                      >
                        <span>{intlFmtMsg({ id: 'table.delete' })}</span>
                      </Tooltip>
                    )}
                </span>
              );
            },
          },
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys: any, selectedRows: any[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
            setSelectedRows(selectedRows);
          },
        }}
      />
    </Card>
  );
}

export default CreateIncludeNsTree(index, { visible: true });
