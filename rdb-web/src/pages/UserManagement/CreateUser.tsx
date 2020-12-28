import React, { Component } from 'react';
import { Modal, message } from 'antd';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import ProfileForm from '@pkgs/ProfileForm';
import { auth } from '@pkgs/Auth';
import request from '@pkgs/request';
import api from '@pkgs/api';

class CreateUser extends Component<ModalWrapProps & WrappedComponentProps> {
  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  private profileFormRef: any; // TODO: ref type

  handleOk = () => {
    this.profileFormRef.validateFields((err: any, values: any) => {
      if (!err) {
        const active_begin = values.type === 1 ? new Date(values.active_begin).getTime() : null;
        const active_end = values.type === 1 ? new Date(values.active_end).getTime() : null;
        request(`${api.users}`, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            active_begin: active_begin,
            active_end: active_end,
            is_root: values.is_root ? 1 : 0,
            is_tenant_admin: values.is_tenant_admin ? 1 : 0,
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.create.success' }));
          this.props.onOk();
          this.props.destroy();
        });
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { visible } = this.props;
    const { isroot } = auth.getSelftProfile();

    return (
      <Modal
        title={this.props.intl.formatMessage({ id: 'table.create' })}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <ProfileForm
          isrootVsible={isroot}
          ref={(ref) => { this.profileFormRef = ref; }}
        />
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(CreateUser) as any);
