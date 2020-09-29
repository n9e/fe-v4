import React, { useContext, useRef } from 'react';
import { Divider, Popconfirm, Button, message } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import FetchTable from '@pkgs/FetchTable';
import api from '@common/api';
import request from '@pkgs/request';
import AddModal from './AddModal';
import ModifyModal from './ModifyModal';

function index(props: any) {
  const nsTreeContext = useContext(NsTreeContext);
  const tableRef = useRef<any>();
  const selectedNode: any = nsTreeContext.getSelectedNode();
  const handleAdd = () => {
    AddModal({
      language: props.intl.locale,
      title: props.intl.formatMessage({ id: 'table.create' }),
      onOk: (values: any) => {
        request(`${api.bigScreen}/create`, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            config: '',
            belong_to: String(selectedNode.id),
          }),
        }).then(() => {
          message.success(props.intl.formatMessage({ id: 'msg.create.success' }));
          tableRef.current.reload();
        });
      },
    });
  }

  const handleModify = (record: any) => {
    ModifyModal({
      language: props.intl.locale,
      name: record.name,
      title: props.intl.formatMessage({ id: 'table.modify' }),
      onOk: (values: any) => {
        request(`${api.bigScreen}/update`, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            id: record.id,
            config: '',
            belong_to: String(selectedNode.id),
          }),
        }).then(() => {
          message.success(props.intl.formatMessage({ id: 'msg.modify.success' }));
          tableRef.current.reload();
        });
      },
    });
  }

  const handleDel = (id: number) => {
    request(`${api.bigScreen}/delete`, {
      method: 'POST',
      body: JSON.stringify({
        id: [id],
      })
    }).then(() => {
      message.success(props.intl.formatMessage({ id: 'msg.delete.success' }));
      tableRef.current.reload();
    });
  }
  return (
    <div>
      <div className="mb10" style={{ overflow: 'hidden' }}>
        <div style={{ float: 'left' }}>
          {/* <Input.Search
            style={{ width: 200 }}
            placeholder="Search"
            onSearch={(value) => {
              this.setState({ searchVal: value });
            }}
          /> */}
        </div>
        <div style={{ float: 'right' }}>
          <Button className="mr10" onClick={handleAdd}>
            <FormattedMessage id="screen.create" />
          </Button>
        </div>
      </div>
      <FetchTable
        ref={tableRef}
        url={`${api.bigScreen}/list`}
        query={{
          equal: JSON.stringify({ belong_to: _.get(selectedNode, 'id')})
        }}
        fetchFunc={(url, pagination) => {
          return fetch(url).then((res) => {
            return res.json();
          }).then((res) => {
            return {
              data: res.data.list,
              pagination: {
                ...pagination,
                current: pagination!.current,
                total: res.data.count,
              },
            };
          });
        }}
        tableProps={{
          columns: [
            {
              title: <FormattedMessage id="table.name" />,
              dataIndex: 'name',
              render: (text, record) => {
                return <Link to={{ pathname: `/big-screen/${record.id}`}}>{text}</Link>;
              }
            }, {
              title: <FormattedMessage id="table.creator" />,
              dataIndex: 'creator',
            }, {
              title: <FormattedMessage id="table.operations" />,
              width: 200,
              render: (text, record) => {
                return (
                  <span>
                    <a onClick={() => handleModify(record)}><FormattedMessage id="table.modify" /></a>
                    <Divider type="vertical" />
                    <Popconfirm title={<FormattedMessage id="table.delete.sure" />} onConfirm={() => handleDel(record.id)}>
                      <a><FormattedMessage id="table.delete" /></a>
                    </Popconfirm>
                  </span>
                );
              },
            },
          ]
        }}
      />
    </div>
  )
}

export default CreateIncludeNsTree(injectIntl(index), { visible: true });
