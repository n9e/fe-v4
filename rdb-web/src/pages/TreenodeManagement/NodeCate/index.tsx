import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Row, Col, Button, Popconfirm, Divider, Tag, message,
} from 'antd';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import FetchTable from '@pkgs/FetchTable';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import request from '@pkgs/request';
import api from '@common/api'
import NodeCateForm from './NodeCateForm';

function index(props: WrappedComponentProps) {
  const table = useRef<any>();
  const handlePostBtnClick = () => {
    NodeCateForm({
      language: props.intl.locale,
      type: 'create',
      onOk: (values: any, destroy: any) => {
        request(api.nodeCates, {
          method: 'POST',
          body: JSON.stringify(values),
        }).then(() => {
          table.current!.reload();
          destroy();
          message.success(props.intl.formatMessage({ id: 'msg.create.success' }));
        });
      },
    });
  };
  const handleModifyBtnClick = (id: number, record: any) => {
    NodeCateForm({
      language: props.intl.locale,
      type: 'modify',
      initialValues: record,
      onOk: (values: any, destroy: any) => {
        request(`${api.nodeCate}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        }).then(() => {
          table.current!.reload();
          destroy();
          message.success(props.intl.formatMessage({ id: 'msg.modify.success' }));
        });
      },
    });
  };
  const handleDelBtnClick = (id: number) => {
    request(`${api.nodeCate}/${id}`, {
      method: 'DELETE',
    }).then(() => {
      table.current!.reload();
      message.success(props.intl.formatMessage({ id: 'msg.delete.success' }));
    });
  };
  return (
    <div>
      <Row style={{ marginBottom: 10 }}>
        <Col span={16} className="mb10" />
        <Col span={8} className="textAlignRight">
          <Button onClick={handlePostBtnClick}>
            <FormattedMessage id="table.create" />
          </Button>
        </Col>
      </Row>
      <FetchTable
        ref={table}
        url={api.nodeCates}
        tableProps={{
          columns: [
            {
              title: <FormattedMessage id="node.color" />,
              dataIndex: 'icon_color',
              render: (text) => <Tag color={text}>{text}</Tag>,
            }, {
              title: <FormattedMessage id="node.cate" />,
              dataIndex: 'ident',
            }, {
              title: <FormattedMessage id="node.cate.name" />,
              dataIndex: 'name',
            }, {
              title: <FormattedMessage id="table.operations" />,
              width: 200,
              render: (_text, record) => (
                <span>
                  <Link to={{ pathname: `/treenode-management/node-cate/${record.ident}/types` }}><FormattedMessage id="node.cate.field.mgr" /></Link>
                  <Divider type="vertical" />
                  <a onClick={() => handleModifyBtnClick(record.id, record)}><FormattedMessage id="table.modify" /></a>
                  <Divider type="vertical" />
                  <Popconfirm title={<FormattedMessage id="table.delete.sure" />} onConfirm={() => handleDelBtnClick(record.id)}>
                    <a className="danger-link"><FormattedMessage id="table.delete" /></a>
                  </Popconfirm>
                </span>
              ),
            },
          ],
        }}
      />
    </div>
  );
}

export default CreateIncludeNsTree(injectIntl(index) as any, { visible: false });
