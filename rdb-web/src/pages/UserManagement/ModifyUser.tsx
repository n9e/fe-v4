import React, { Component } from 'react';
import { Modal, message } from 'antd';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import ProfileForm from '@pkgs/ProfileForm';
import { auth } from '@pkgs/Auth';
import request from '@pkgs/request';
import api from '@pkgs/api';

class ModifyUser extends Component<ModalWrapProps & WrappedComponentProps> {
  static defaultProps = {
    title: '',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  private profileForm: any;

  handleOk = () => {
    this.profileForm.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api.user}/${this.props.data.id}/profile`, {
          method: 'PUT',
          body: JSON.stringify({
            ...values,
            is_root: values.is_root ? 1: 0,
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
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
    const { title, visible, data } = this.props;
    const { isroot } = auth.getSelftProfile();

    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <ProfileForm
          type="put"
          isrootVsible={isroot}
          initialValue={data}
          ref={(ref) => { this.profileForm = ref; }}
        />
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(ModifyUser) as any);
