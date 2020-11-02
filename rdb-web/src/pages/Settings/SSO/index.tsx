import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import api from "@common/api";
import {
  Button,
  Table,
  Input,
  Card,
  Col,
  Row,
  Modal,
  Form,
  message,
  Popconfirm,
  Divider,
} from "antd";
import request from "@pkgs/request";
import "./style.less";

const OOS = (props: any) => {
  const { getFieldDecorator } = props.form;
  const [modal, setModal] = useState(false);
  const [data, setData] = useState([]);
  const columns = [
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "ClientID",
      dataIndex: "clientId",
      width: 220,
    },
    {
      title: "ClientSecret",
      dataIndex: "clientSecret",
      width: 220,
    },
    {
      title: "RedirectUri",
      dataIndex: "redirectUri",
      width: 120,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      render: (text: any) => {
        return moment.unix(text).format();
      },
    },
    {
      title: "操作",
      render: (value: any, record: any) => {
        return (
          <div className="sso-login">
              <Link
                to={{
                  pathname: "/settings/sso/create",
                  search: `clientId=${record.clientId}`,
                }}
              >
               修改
              </Link>
            <Divider type="vertical" />
            <Popconfirm
              title="删除"
              onConfirm={() => {
                dele(record.clientId);
              }}
            >
              <a className="danger-link">删除</a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const onClick = () => {
    setModal(true);
  };

  const oncancel = () => {
    setModal(false);
  };

  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
  };

  const fetchData = async () => {
    try {
      const dat = await request(`${api.sso}/clients`);
      setData(dat.list);
    } catch (e) {
      console.log(e);
    }
  };

  const dele = async (id: string) => {
    try {
      await request(`${api.sso}/clients/${id}`, {
        method: "DELETE",
      });
      message.success("success");
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    props.form.validateFields(async (errors: any, values: any) => {
      if (!errors) {
        try {
          await request(`${api.sso}/clients`, {
            method: "POST",
            body: JSON.stringify({
              name: values.name,
              redirectUri: values.redirectUri,
            }),
          });
          message.success("请求成功");
          fetchData();
        } catch (e) {
          console.log(e);
        }
        setModal(false);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <Card>
        <Row style={{ marginBottom: 10 }}>
          <Col span={24} style={{ textAlign: "right" }}>
            <Button onClick={onClick}>新增</Button>
          </Col>
        </Row>
        <Table columns={columns} dataSource={data} />
      </Card>
      <Modal visible={modal} onCancel={oncancel} onOk={onSubmit}>
        <Form {...formItemLayout} onSubmit={onSubmit}>
          <Form.Item label="名称">
            {getFieldDecorator("name", {
              rules: [{ required: true }],
            })(<Input placeholder="请输入名称"></Input>)}
          </Form.Item>
          <Form.Item label="redirectUri">
            {getFieldDecorator("redirectUri", {
              rules: [{ required: true }],
            })(<Input placeholder="请输入redirectUri"></Input>)}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Form.create()(OOS);
