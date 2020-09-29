import React, { useContext, useState, useEffect } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  Button,
  Input,
  message,
  Divider,
  Popconfirm,
  Tooltip,
  Modal,
} from 'antd';
import _ from 'lodash';
import useFormatMessage, { getIntl } from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import Setting from './Setting';
import { getAggrStraList, deleteAggrStra, addAggrStra, modifyAggrStra } from './services';

function filterData(data: any, searchValue: string) {
  if (searchValue) {
    return _.filter(data, (item: any) => {
      return (
        _.includes(item.ns, searchValue) ||
        _.includes(item.newMetric, searchValue) ||
        _.includes(item.status, searchValue) ||
        _.includes(item.lastUser, searchValue)
      );
    });
  }
  return data;
}

function index() {
  const intl = getIntl();
  const intlFmtMsg = useFormatMessage();
  const nstreeContext = useContext(NsTreeContext);
  const nid = _.get(nstreeContext, 'data.selectedNode.id');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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

  useEffect(() => {
    fetchData();
  }, [nid]);

  return (
    <Card>
      <Row style={{ marginBottom: 10 }}>
        <Col span={12}>
          <Input
            style={{ width: 200 }}
            value={searchValue}
            placeholder="search"
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
          <Button
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            {intlFmtMsg({ id: 'aggrStra.batch.delete.btn' })}
          </Button>
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
          onChange: (newSelectedRowKeys: any) => {
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
      />
    </Card>
  );
}

export default CreateIncludeNsTree(index, { visible: true });
