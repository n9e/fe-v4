import React from 'react';
import { Modal, Form, TreeSelect } from 'antd';
import _ from 'lodash';
import ModalControl from '@pkgs/ModalControl';
import { renderTreeNodes } from '@pkgs/Layout/utils';

const FormItem = Form.Item;

const BatchCloneToNidModal = (props: any) => {
  return (
    <Modal
      title={props.title}
      visible={props.visible}
      onOk={() => {
        props.form.validateFields(async (err: any, values: any) => {
          if (!err) {
            props.onOk(values.nid);
            props.destroy();
          }
        });
      }}
      onCancel={() => {
        props.destroy();
      }}
    >
      <Form layout="vertical">
        <FormItem
          label="Node"
        >
          {
            props.form.getFieldDecorator('nid', {
            })(
              <TreeSelect
                showSearch
                allowClear
                treeDefaultExpandAll
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {renderTreeNodes(props.treeNodes, 'treeSelect')}
              </TreeSelect>,
            )
          }
        </FormItem>
      </Form>
    </Modal>
  );
}

export default ModalControl(Form.create()(BatchCloneToNidModal));
