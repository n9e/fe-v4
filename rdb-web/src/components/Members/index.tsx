import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Row, Col, Input, Button, Popconfirm, Breadcrumb, message } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import FetchTable from '@pkgs/FetchTable';
import request from '@pkgs/request';
import api from '@common/api';
import { UserProfile, Team } from '@interface';
import AddMembers from './AddMembers';

interface Props {
  type: 'tenant' | 'team' | 'role',
  id?: number,
}

const ButtonGroup = Button.Group;

function Members(props: Props & WrappedComponentProps & RouteComponentProps) {
  const { type, id } = props;
  const [meta, setMeta] = useState<Team>({} as Team);
  const [fetchUrl, setFetchUrl] = useState('');
  const [fetchQuery, setFetchQuery] = useState('');
  const table = useRef<any>();
  const handleAddBtnClick = () => {
    AddMembers({
      language: props.intl.locale,
      id,
      type: props.type,
      mgmt: _.get(meta, 'mgmt'),
      onOk: () => {
        table.current!.reload();
      },
    });
  };
  const handleDelBtnClick = (uid: number) => {
    const { type, id } = props;
    const body = type === 'role' ? {
      ids: [uid],
    } : {
      user_ids: [uid],
    };
    request(`${api[type]}/${id}/users/unbind`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }).then(() => {
      table.current!.reload();
      message.success(props.intl.formatMessage({ id: 'member.delete.success' }));
    });
  };

  const columns: ColumnProps<UserProfile>[] = [
    {
      title: <FormattedMessage id="user.username" />,
      dataIndex: 'username',
    }, {
      title: <FormattedMessage id="user.dispname" />,
      dataIndex: 'dispname',
    }, {
      title: <FormattedMessage id="user.email" />,
      dataIndex: 'email',
    }, {
      title: <FormattedMessage id="user.phone" />,
      dataIndex: 'phone',
    }, {
      title: 'IM',
      dataIndex: 'im',
      width: 200,
    },
  ];
  if (type !== 'tenant') {
    columns.push({
      title: <FormattedMessage id="user.leader" />,
      dataIndex: 'leader_name',
    });
  }
  if (
    type === 'team' && meta.mgmt == 1
    || type === 'tenant'
  ) {
    columns.splice(2, 0, {
      title: <FormattedMessage id="user.isadmin" />,
      dataIndex: 'is_admin',
      render: (text) => {
        if (text) {
          return <FormattedMessage id="yes" />;
        }
        return <FormattedMessage id="no" />;
      },
    });
  }
  columns.push({
    title: <FormattedMessage id="table.operations" />,
    width: 100,
    render: (_text, record) => {
      return (
        <span>
          <Popconfirm title={<FormattedMessage id="table.delete.sure" />} onConfirm={() => { handleDelBtnClick(record.id); }}>
            <a className="danger-link"><FormattedMessage id="table.delete" /></a>
          </Popconfirm>
        </span>
      );
    },
  });

  useEffect(() => {
    if (id) {
      if (type === 'role') {
        setFetchUrl(`${api[type]}/${id}/users`);
      } else {
        setFetchUrl(`${api[type]}/${id}`);
      }
    }
  }, [id]);

  return (
    <div>
      {
        type !== 'tenant' && type !== 'team' && type !== 'role' ?
          <Breadcrumb style={{ marginBottom: 20 }}>
            <Breadcrumb.Item>
              <Link to={{ pathname: `/${type}` }}>
                <FormattedMessage id={`member.${type}`} />
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item><span>{meta.name}</span></Breadcrumb.Item>
            <Breadcrumb.Item>
              <FormattedMessage id="member.management" />
            </Breadcrumb.Item>
          </Breadcrumb> : null
      }
      <Row>
        <Col span={8} className="mb10">
          <Input.Search
            style={{ width: 200 }}
            onSearch={(val) => { setFetchQuery(val); }}
          />
        </Col>
        <Col span={16} className="textAlignRight">
          <ButtonGroup>
            <Button onClick={handleAddBtnClick}><FormattedMessage id="member.create" /></Button>
          </ButtonGroup>
        </Col>
      </Row>
      <FetchTable
        ref={table}
        url={fetchUrl}
        query={{ query: fetchQuery }}
        processData={(data, res) => {
          setMeta(res[type]);
          return Promise.resolve(data);
        }}
        tableProps={{
          columns,
        }}
      />
    </div>
  );
}

export default injectIntl(withRouter(Members));
