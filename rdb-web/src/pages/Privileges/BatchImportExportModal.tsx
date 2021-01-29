import React, { Component } from 'react';
import { Input, Modal, Form } from 'antd';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import _ from 'lodash';
import { FormProps } from 'antd/lib/form';


const { TextArea } = Input;

interface NodeImportExport {
  type: 'import' | 'export',
  initialValues?: Node,
  onOk: (values: any, destroy?: () => void) => void,
  onCancel?: () => void,
}

class NodeEditorModal extends Component<NodeImportExport & ModalWrapProps & FormProps> {
  titleMap = {
    import: '导入策略',
    export: '导出策略',
  };

  handleOk = () => {
    this.props.form!.validateFields((err: any, values: any) => {
      if (!err) {
        this.props.onOk({
          ...values,
          leaf: values.leaf ? 1 : 0,
        }, this.props.destroy);
      }
      this.props.form?.resetFields();
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const {
      type, visible, initialValues
    } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Modal
        title={this.titleMap[type]}
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        className="NsTreeModal"
      >
        <Form
          layout="vertical"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Form.Item>
            {
              getFieldDecorator('data', {
                // initialValue,
              })(
                <TextArea autoSize={{ minRows: 2, maxRows: 10 }} />,
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export const nodeEditorModal = ModalControl(Form.create()(NodeEditorModal));
