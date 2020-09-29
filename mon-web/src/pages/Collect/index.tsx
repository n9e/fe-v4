import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Input, Divider, Dropdown, Button, Icon, Menu, Select, Popconfirm, Modal, Table, Form, message } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from '@umijs/hooks';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import request from '@pkgs/request';
import api from '@common/api';
import { typeMap } from './config';
import BatchCloneToNidModal from './BatchCloneToNidModal';
import BatchImportExportModal from './BatchImportExportModal';

interface CollectDataItem {
  collect_type: 'port' | 'proc' | 'plugin',
  comment: string,
  created: string,
  creator: string,
  id: number,
  last_updated: string,
  last_updator: string,
  name: string,
  nid: number,
  port: number,
  step: number,
  tags: string,
  timeout: number,
};

const getTableData = (nid: number) => {
  return request(`${api.collect}/list?nid=${nid}`).then((res) => {
    return { data: res };
  });
};

const handleDelete = (record: CollectDataItem, refresh: () => void, intlFmtMsg: any) => {
  request(api.collect, {
    method: 'DELETE',
    body: JSON.stringify([{
      type: record.collect_type,
      ids: [record.id],
    }]),
  }).then(() => {
    message.success(intlFmtMsg({ id: 'msg.delete.success' }));
    refresh();
  });
};

const handleBatchDelete = (selectedRows: CollectDataItem[], refresh: () => void, intlFmtMsg: any) => {
  Modal.confirm({
    title: intlFmtMsg({ id: 'table.delete' }),
    content: intlFmtMsg({ id: 'table.delete.sure' }),
    onOk: () => {
      const typeGroup = _.groupBy(selectedRows, 'collect_type');
      const reqBody = _.map(typeGroup, (value, key) => {
        return {
          type: key,
          ids: _.map(value, 'id'),
        };
      });
      request(api.collect, {
        method: 'DELETE',
        body: JSON.stringify(reqBody),
      }).then(() => {
        message.success(intlFmtMsg({ id: 'msg.delete.success' }));
        refresh();
      });
    },
  });
}

const handleBatchCloneToOtherNid = (selectedRows: CollectDataItem[], refresh: () => void, intlFmtMsg: any, treeNodes: any[]) => { // TODO ts
  BatchCloneToNidModal({
    treeNodes,
    onOk: (nid: number) => {
      const reqBody = _.map(selectedRows, (item) => {
        const pureItem = _.pickBy(item, (v, k) => {
          return !_.includes(['id', 'creator', 'created', 'last_updator', 'last_updated'], k);
        });
        return {
          type: item.collect_type,
          data: {
            ...pureItem,
            nid,
          },
        };
      });
      request(api.collect, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      }).then(() => {
        message.success(intlFmtMsg({ id: 'msg.clone.success' }));
        refresh();
      });
    },
  });
}

const handleBatchImportBtnClick = (nid: number, intlFmtMsg: any, refresh: any) => {
  BatchImportExportModal({
    type: 'import',
    title: intlFmtMsg({ id: 'collect.batch.import' }),
    selectedNid: nid,
    onOk: () => {
      refresh();
    },
  });
}

const handleBatchExportBtnClick = (selectedRows: any[], intlFmtMsg: any) => {
  const newSelectedRows = _.map(selectedRows, (row) => {
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
    title: intlFmtMsg({ id: 'collect.batch.export' }),
  });
}

const Collect = (props: any) => {
  const intlFmtMsg = useFormatMessage();
  const { getFieldDecorator, getFieldValue } = props.form;
  const nstreeContext = useContext(NsTreeContext);
  const nid = _.get(nstreeContext, 'data.selectedNode.id');
  const treeNodes = _.get(nstreeContext, 'data.treeNodes');
  const { tableProps, refresh, search } = useAntdTable(() => getTableData(nid), [nid], {
    form: props.form,
    formatResult: (result: any) => { // TODO ts
      const collectType = getFieldValue('collectType');
      const searchValue = getFieldValue('searchValue');
      const filterResult = _.filter(result.data, (item) => {
        if (collectType && item.collect_type !== collectType) return false;
        if (searchValue && item.search_value.indexOf(searchValue) === -1) return false;
        return true;
      });
      return { data: filterResult, total: filterResult.length };
    },
  });
  const columns: ColumnProps<CollectDataItem>[] = [
    {
      title: <FormattedMessage id="table.name" />,
      dataIndex: 'name',
    }, {
      title: <FormattedMessage id="table.cate" />,
      dataIndex: 'collect_type',
      render: (text) => {
        return typeMap[text];
      },
    }, {
      title: <FormattedMessage id="table.creator" />,
      dataIndex: 'creator',
    }, {
      title: <FormattedMessage id="table.lastupdated" />,
      dataIndex: 'last_updated',
      render: (text) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
    }, {
      title: <FormattedMessage id="table.operations" />,
      render: (text, record) => {
        return (
          <span>
            <Link to={{ pathname: `/collect/modify/${_.lowerCase(record.collect_type)}/${record.id}` }}><FormattedMessage id="table.modify" /></Link>
            <Divider type="vertical" />
            <Link to={{ pathname: `/collect/clone/${_.lowerCase(record.collect_type)}/${record.id}` }}><FormattedMessage id="table.clone" /></Link>
            <Divider type="vertical" />
            <Popconfirm
              title={<FormattedMessage id="table.delete.sure" />}
              onConfirm={() => { handleDelete(record, refresh, intlFmtMsg); }}
            >
              <a><FormattedMessage id="table.delete" /></a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState();
  const [selectedRows, setSelectedRows] = useState();

  return (
    <>
      <Row>
        <Col span={12} className="mb10">
          <Form style={{ display: 'flex', justifyContent: 'flex-start' }}>
            {getFieldDecorator('collectType')(
              <Select
                allowClear
                style={{ width: 100, marginRight: 8 }}
                className="mr10"
                placeholder={<FormattedMessage id="table.cate" />}
                onChange={search!.submit} // TODO ts
              >
                {
                  _.map(typeMap, (value, key) => {
                    return <Select.Option key={key} value={key}><FormattedMessage id={`collect.${key}`} /></Select.Option>;
                  })
                }
              </Select>,
            )}
            {getFieldDecorator('searchVal')(
              <Input.Search placeholder="Search" style={{ width: 200 }} onSearch={search!.submit} />, // TODO ts
            )}
          </Form>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Dropdown
            overlay={
              <Menu>
                {
                  _.map(typeMap, (value, key) => {
                    return (
                      <Menu.Item key={key}>
                        <Link to={{ pathname: `/collect/add/${key}` }}><FormattedMessage id={`collect.${key}`} /></Link>
                      </Menu.Item>
                    );
                  })
                }
              </Menu>
            }
          >
            <Button style={{ marginRight: 8 }}>
              <FormattedMessage id="table.create" /> <Icon type="down" />
            </Button>
          </Dropdown>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <a onClick={() => { handleBatchDelete(selectedRows, refresh, intlFmtMsg); }}><FormattedMessage id="table.delete" /></a>
                </Menu.Item>
                <Menu.Item>
                  <a onClick={() => { handleBatchCloneToOtherNid(selectedRows, refresh, intlFmtMsg, treeNodes); }}><FormattedMessage id="clone.to.other.node" /></a>
                </Menu.Item>
                <Menu.Item>
                    <a onClick={() => { handleBatchImportBtnClick(nid, intlFmtMsg, refresh); }}><FormattedMessage id="stra.batch.import" /></a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => { handleBatchExportBtnClick(selectedRows, intlFmtMsg); }}><FormattedMessage id="stra.batch.export" /></a>
                  </Menu.Item>
              </Menu>
            }
          >
            <Button>
              <FormattedMessage id="table.batch.operations" /> <Icon type="down" />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Table
        rowKey={(record: CollectDataItem) => {
          return record.id + record.collect_type;
        }}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
          },
        }}
        {...tableProps}
      />
    </>
  );
};

export default CreateIncludeNsTree(Form.create()(Collect), { visible: true });
