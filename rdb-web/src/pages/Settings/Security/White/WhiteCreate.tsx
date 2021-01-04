import React, { Component } from "react";
import { Input, Modal, Form, DatePicker } from "antd";
import { FormProps } from "antd/lib/form";
import ModalControl, { ModalWrapProps } from "@pkgs/ModalControl";
import { WhiteCreate } from "@interface";
import moment from "moment";

interface IParams {
  startTime: [number, number];
  startIp: string;
  endIp: string;
}

interface Props {
  type: "create" | "modify";
  initialValues?: WhiteCreate;
  onOk: (values: IParams, destroy?: () => void) => void;
}

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class WhiteCreateForm extends Component<Props & ModalWrapProps & FormProps> {
  titleMap = {
    create: "创建白名单",
    modify: "修改白名单",
  };

  getDate = (time: string) => {
    const date = new Date();
    let year = date.getFullYear();
    let month: any = date.getMonth() + 1;
    month = month > 9 ? month : "0" + month;
    let day: any = date.getDate();
    day = day > 9 ? day : "0" + day;
    if (time === "start") {
      return `${year}-${month}-${day} 00:00:00`;
    } else {
      return `${year}-${month}-${day} 23:59:59`;
    }
  };

  handleOk = () => {
    this.props.form!.validateFields((err, values: IParams) => {
      if (!err) {
        const startTime = Math.floor(
          new Date(values.startTime[0]).getTime() / 1000
        );
        const endTime = Math.floor(
          new Date(values.startTime[1]).getTime() / 1000
        );
        this.props.onOk(
          {
            startIp: values.startIp,
            endIp: values.endIp,
            startTime: startTime,
            endTime: endTime,
          },
          this.props.destroy
        );
      }
    });
  };

  handleCancel = () => {
    this.props.destroy();
  };

  render() {
    const { type, initialValues, visible } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Modal
        title={this.titleMap[type]}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form
          layout="vertical"
          style={{ width: 350, margin: "auto" }}
          onSubmit={(e) => {
            e.preventDefault();
            this.handleOk();
          }}
        >
          <FormItem label="起始IP">
            {getFieldDecorator("startIp", {
              initialValue: initialValues ? initialValues.startIp : "",
              rules: [{ required: true, message: "必填项！" }],
            })(<Input />)}
          </FormItem>
          <FormItem label="结束IP">
            {getFieldDecorator("endIp", {
              initialValue: initialValues ? initialValues.endIp : "",
              rules: [{ required: true, message: "必填项！" }],
            })(<Input />)}
          </FormItem>
          <FormItem label="开始时间">
            {getFieldDecorator("startTime", {
              initialValue: initialValues
                ? [
                    moment(Number(initialValues.startTime) * 1000),
                    moment(Number(initialValues.endTime) * 1000),
                  ]
                : [
                    moment(this.getDate('start'), "YYYY-MM-DD hh:mm:ss"),
                    moment(this.getDate('end'), "YYYY-MM-DD hh:mm:ss"),
                  ],
              rules: [{ required: true, message: "必填项！" }],
            })(
              <RangePicker renderExtraFooter={() => "extra footer"} showTime />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(WhiteCreateForm));
