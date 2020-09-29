import React, { useRef } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  Popconfirm, Divider, Breadcrumb, Row, Col, Button, message,
} from 'antd';
import _ from 'lodash';
import useFormatMessage, { getIntl } from '@pkgs/hooks/useFormatMessage';
import api from '@common/api';
import request from '@pkgs/request';
import FetchTable from '@pkgs/FetchTable';
import NodeCateFieldForm from './NodeCateFieldForm';
import { fields } from './config';

export default function NodeCateType(props: RouteComponentProps<any>) {
  const intl = getIntl();
  const intlFmtMsg = useFormatMessage();
  const fetchTable = useRef<any>();
  const { ident: cate } = props.match.params;
  const handleCreate = () => {
    NodeCateFieldForm({
      language: intl.locale,
      type: 'create',
      initialValues: {
        cate,
      },
      onOk: (values: any, destroy: any) => {
        request(`${api.nodeCates}/fields`, {
          method: 'POST',
          body: JSON.stringify(values),
        }).then(() => {
          message.success(intlFmtMsg({ id: 'msg.create.success' }));
          if (fetchTable && fetchTable.current) {
            fetchTable.current.reload();
          }
        }).finally(() => {
          destroy();
        });
      },
    });
  };
  const handleModify = (record: any) => {
    NodeCateFieldForm({
      language: intl.locale,
      type: 'modify',
      initialValues: record,
      onOk: (values: any, destroy: any) => {
        delete values.cate;
        delete values.field_ident;
        request(`${api.nodeCates}/field/${record.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        }).then(() => {
          message.success(intlFmtMsg({ id: 'msg.modify.success' }));
          if (fetchTable && fetchTable.current) {
            fetchTable.current.reload();
          }
        }).finally(() => {
          destroy();
        });
      },
    });
  };
  const handleDelete = (id: number) => {
    request(`${api.nodeCates}/field/${id}`, {
      method: 'Delete',
    }).then(() => {
      message.success(intlFmtMsg({ id: 'msg.delete.success' }));
      if (fetchTable && fetchTable.current) {
        fetchTable.current.reload();
      }
    });
  };
  return (
    <div>
      <Row style={{ marginBottom: 10 }}>
        <Col span={12}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to={{ pathname: '/treenode-management/node-cate' }}>
                {intlFmtMsg({ id: 'menu.rdb.superUser.treenode-management.node-cate' })}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {cate}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button onClick={() => { handleCreate(); }}>
            { intlFmtMsg({ id: 'table.create' }) }
          </Button>
        </Col>
      </Row>
      <FetchTable
        ref={fetchTable}
        backendPagingEnabled={false}
        url={`${api.nodeCates}/fields`}
        query={{
          cate,
        }}
        tableProps={{
          columns: [
            {
              title: intlFmtMsg({ id: 'node.cate.field.ident' }),
              dataIndex: 'field_ident',
            }, {
              title: intlFmtMsg({ id: 'node.cate.field.name' }),
              dataIndex: 'field_name',
            }, {
              title: intlFmtMsg({ id: 'node.cate.field.type' }),
              dataIndex: 'field_type',
              render: (text) => {
                if (intl.locale === 'zh') {
                  return _.get(_.find(fields, { ident: text }), 'name');
                }
                return _.get(_.find(fields, { ident: text }), 'ident');
              },
            }, {
              title: intlFmtMsg({ id: 'node.cate.field.extra' }),
              dataIndex: 'field_extra',
              render: (text, record) => {
                if (record.field_type === 'string') {
                  return text === 'input' ? intlFmtMsg({ id: 'node.cate.field.extra.string.input' }) : intlFmtMsg({ id: 'node.cate.field.extra.string.textarea' });
                }
                if (record.field_type === 'number') {
                  return `${intlFmtMsg({ id: 'node.cate.field.extra.number' })}: ${text}`;
                }
                if (record.field_type === 'enum') {
                  return text;
                }
                return 'none';
              },
            }, {
              title: intlFmtMsg({ id: 'node.cate.field.required' }),
              dataIndex: 'field_required',
              render: (text) => (text === 1 ? 'yes' : 'no'),
            }, {
              title: intlFmtMsg({ id: 'table.operations' }),
              render: (_text, record) => (
                <span>
                  <span>
                    <a onClick={() => { handleModify(record); }}>
                      {intlFmtMsg({ id: 'table.modify' })}
                    </a>
                  </span>
                  <Divider type="vertical" />
                  <Popconfirm
                    title={intlFmtMsg({ id: 'table.delete.sure' })}
                    onConfirm={() => { handleDelete(record.id); }}
                  >
                    <a className="danger-link">{intlFmtMsg({ id: 'table.delete' })}</a>
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
