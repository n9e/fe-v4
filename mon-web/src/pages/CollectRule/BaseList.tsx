import React from "react";
import { Form, Input, Icon, Col, Row } from "antd";
import { FormComponentProps } from "antd/lib/form";
import { useDynamicList } from "@umijs/hooks";

interface IParams {
  data: {
    name: string;
    label: string;
    description: string;
    required: true;
    type: "string";
  };
  getFieldDecorator: any;
}

export default Form.create()((props: FormComponentProps & IParams) => {
  const { list, remove, getKey, push } = useDynamicList([""]);
  const {name, label, description, required, type} = props.data;
  const Rows = (index: number, item: any) => (
    <Row>
      <Form.Item key={name} >
        {props.getFieldDecorator(`${name}[${getKey(index)}]`, {
          initialValue: name,
          rules: [
            {
              required: required,
              message: description,
            },
          ],
        })(
          <Col span={22}>
            <Input placeholder="请输入！" />
          </Col>
        )}
        {list.length > 1 && (
          <Col span={1}>
            <Icon
              type="minus-circle-o"
              style={{ marginLeft: 8 }}
              onClick={() => {
                remove(index);
              }}
            />
          </Col>
        )}
        <Col span={1}>
          <Icon
            type="plus-circle-o"
            style={{ marginLeft: 8 }}
            onClick={() => {
              push("");
            }}
          />
        </Col>
      </Form.Item>
    </Row>
  );
  return <>{list.map((ele: any, index: any) => Rows(index, ele))}</>;
});
