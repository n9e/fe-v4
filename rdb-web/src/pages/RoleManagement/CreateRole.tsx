import React, { Component } from 'react';
import { Modal, message } from 'antd';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@common/api';
import RoleForm from './RoleForm';

interface Props {
  cate: 'global' | 'local';
  onOk: (id: number) => void;
}

class CreateRole extends Component<Props & ModalWrapProps & WrappedComponentProps> {
  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  private formRef: any; // TODO: ref type

  handleOk = () => {
    this.formRef.validateFields((err: any, values: any) => {
      if (!err) {
        request(api.roles, {
          method: 'POST',
          body: JSON.stringify(values),
        }).then((res) => {
          message.success(this.props.intl.formatMessage({ id: 'msg.create.success' }));
          this.props.onOk(res.id);
          this.props.destroy();
        });
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { visible, cate } = this.props;

    return (
      <Modal
        title={this.props.intl.formatMessage({ id: 'table.create' })}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <RoleForm cate={cate} ref={(ref) => { this.formRef = ref; }} />
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(CreateRole) as any);
