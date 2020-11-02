import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { Link } from "react-router-dom";
import request from "@pkgs/request";
import queryString from 'query-string';
import moment from "moment";
import api from "@common/api";
import _ from "lodash";

const Create = (props: any) => {
  const { search } = location;
  const { getFieldDecorator } = props.form;
  const cId= queryString.parse(search);
  const FormItem = Form.Item;
  const [value, setValue] = useState({});

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 10 },
  };

  const fetchData = async () => {
    try {
      const dat = await request(`${api.sso}/clients/${cId.clientId}`);
      setValue(dat);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.form.validateFields(async (errors: any, values: any) => {
      if (!errors) {
        try {
          await request(`${api.sso}/clients/${cId.clientId}`, {
            method: "PUT",
            body: JSON.stringify({
              name: values.name,
              redirectUri: values.redirectUri,
              clientSecret: values.clientSecret,
            }),
          });
          message.success("sucess");
          props.history.push({
            pathname: `/settings/sso`,
          });
        } catch (e) {
          console.log(e);
        }
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <Form {...formItemLayout} onSubmit={handleSubmit}>
        <FormItem label="名称">
          {getFieldDecorator("name", {
            initialValue: _.get(value, "name"),
            rules: [{ required: true }],
          })(<Input></Input>)}
        </FormItem>
        <FormItem label="RedirectUri">
          {getFieldDecorator("redirectUri", {
            initialValue: _.get(value, "redirectUri"),
            rules: [{ required: true }],
          })(<Input></Input>)}
        </FormItem>
        <FormItem label="ClientID">
          {getFieldDecorator("clientId", {
            initialValue: _.get(value, "clientId"),
            rules: [{ required: true }],
          })(<Input disabled></Input>)}
        </FormItem>
        <FormItem label="ClientSecret">
          {getFieldDecorator("clientSecret", {
            initialValue: _.get(value, "clientSecret"),
            rules: [{ required: true }],
          })(<Input></Input>)}
        </FormItem>
        <FormItem label="createdAt">
          {getFieldDecorator("createdAt", {
            initialValue: moment.unix(value.createdAt).format(),
            // initialValue: _.get(value, 'createdAt'),
            rules: [{ required: true }],
          })(<Input disabled></Input>)}
        </FormItem>
        <FormItem wrapperCol={{ offset: 6 }} style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit">
            修改
          </Button>
          <Button style={{ marginLeft: 8 }}>
            <Link to={{ pathname: "/settings/sso" }}>取消</Link>
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default Form.create()(Create);
