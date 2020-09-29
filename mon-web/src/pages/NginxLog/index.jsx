import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Table, Input, Card, Col, Row,
} from 'antd';
import { getList, deletenginx } from './services';
import './style.less';

const Nginxlog = () => {
  const { Search } = Input;
  const [datas, setData] = useState([]);
  useEffect(() => {
    getList().then((res) => {
      setData(res);
    });
  }, []);

  const onClick = (ids) => {
    deletenginx(ids);
  };

  const columns = [
    {
      title: 'nid',
      dataIndex: 'nid',
    },
    {
      title: '服务',
      dataIndex: 'sevice',
    },
    {
      title: '采集周期',
      dataIndex: 'interval',
    },
    {
      title: '匹配域名',
      render: (value, record) => {
        const html = record.domain.join('<br />');
        return (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: html }} />
        );
      },
    },
    {
      title: 'APIPATCH',
      render: (value, record) => {
        const html = record.url_path_prefix.join('<br />');
        return (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: html }} />
        );
      },
    },
    {
      title: 'func',
      render: (value, record) => {
        const html = record.func.join('<br />');
        return (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: html }} />
        );
      },
    },
    {
      title: '操作',
      render: (value, record) => {
        return (
          <div className="mon-nginxlog">
            <Button>
              <Link to={{ pathname: '/nginx/add', search: `id=${record.id}` }}>
                查看
              </Link>
            </Button>
            <Button className="ml_20" onClick={() => onClick(record.id)}>
              删除
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Card>
        <Row style={{ marginBottom: 10 }}>
          <Col span={12}>
            <Search placeholder="search" style={{ width: 200 }} />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button>
              <Link to={{ pathname: '/nginx/add' }}>新增</Link>
            </Button>
            {/* <Button className="ml_20">批量删除</Button> */}
          </Col>
        </Row>
        <Table
          // rowSelection
          className="mt_20"
          columns={columns}
          dataSource={datas}
        />
      </Card>
    </div>
  );
};

export default Nginxlog;
