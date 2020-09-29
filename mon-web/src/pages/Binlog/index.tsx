import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Table, Input, Card, Col, Row } from "antd";
import { getList, deletebinlog } from "./services";
import "./style.less";

const Nginxlog = () => {
  const { Search } = Input;
  const onClick = (ids: number) => {
    deletebinlog(ids);
  };
  const columns = [
    {
      title: "节点",
      dataIndex: "nid",
    },
    {
      title: "指标名",
      dataIndex: "metric",
    },
    {
      title: "采集周期",
      dataIndex: "interval",
    },
    {
      title: "数据库表",
      render: (value: any, record: any) => {
        const html = record.db.join("<br />");
        return (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: html }} />
        );
      },
    },
    {
      title: "计算函数",
      dataIndex: "func",
    },
    {
      title: "变更类型",
      dataIndex: "sqlType",
    },
    {
      title: "求和字段",
      dataIndex: "value_column",
    },
    {
      title: "操作",
      render: (value: any, record: any) => {
        return (
          <div>
            <Button className='mon-binlog'>
              <Link
                to={{ pathname: "/binlog/add", search: `id=${record.nid}` }}
              >
                查看
              </Link>
            </Button>
            <Button className="ml_20" onClick={() => onClick(record.nid)}>
              删除
            </Button>
          </div>
        );
      },
    },
  ];
  // const handleBatchDelete = () => {};
  const [datas, setData] = useState([]);
  useEffect(() => {
    getList().then((res) => {
      setData(res);
    });
  }, []);
  return (
    <div>
      <Card>
        <Row style={{ marginBottom: 10 }}>
          <Col span={12}>
            <Search
              placeholder="search"
              // onSearch={(value) => getSignalList(value)}
              style={{ width: 200 }}
            />
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Button>
              <Link to={{ pathname: "/binlog/add" }}>新增</Link>
            </Button>
            {/* <Button className="ml_20" onClick={handleBatchDelete}>
              批量删除
            </Button> */}
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
