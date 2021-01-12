import React, { useEffect, useState } from "react";
import { Form, InputNumber, Input, DatePicker, Button, Radio } from "antd";
import queryString from "query-string";
import request from "@pkgs/request";
import api from "@common/api";
import moment from "moment";
import { Link } from "react-router-dom";

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
};

const formLayout = {
  width: 700,
  marginTop: 30,
  marginLeft: "auto",
  marginRight: "auto",
};

const switchItem = (item: any) => {
  const type = item.type;
  switch (type) {
    case "int":
      return <InputNumber style={{ width: "100%" }} />;
      break;
    case "char":
      return <Input />;
      break;
    case "date":
      return <DatePicker style={{ width: "100%" }} />;
      break;
    case "boolean":
      return;
      break;
    default:
      return <Input />;
      break;
  }
};

const CreateForm = (props: any) => {
  const { getFieldDecorator } = props.form;
  const query = queryString.parse(location.search);
  const [fields, setFields] = useState([]) as any;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.form.validateFields((err: any, values: any) => {
      if (!err) {
        console.log("Received values of form: ", values);
      }
    });
  };
  const getTemplate = () => {
    return request(`${api.collectRules}/${query.type}/template`).then((res) => {
      setFields(res?.fields);
    });
  };
  useEffect(() => {
    getTemplate();
  }, []);
  return (
    <Form onSubmit={handleSubmit} style={formLayout}>
      {console.log(fields)}
      {fields.map((item: any, index: any) => {
        // type 为 date 日期格式需要强制转化为 moment 格式
        item.value =
          item.type == "date" ? moment(item.value, "YYYY-MM-DD") : item.value;
        return (
          <FormItem
            key={item.name}
            {...formItemLayout}
            label={item.label}
            hasFeedback
          >
            {getFieldDecorator(item.name, {
              initialValue: item?.default,
              rules: [
                {
                  required: item.required,
                  //   message: item.errorMessage,
                },
              ],
            })(switchItem(item))}
          </FormItem>
        );
      })}
      <FormItem {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </FormItem>
    </Form>
  );
};

export default Form.create()(CreateForm);
