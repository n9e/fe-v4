import React, { Component } from 'react';
import { Modal, message } from 'antd';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@common/api';
import TeamForm from './TeamForm';

class ModifyTeam extends Component<ModalWrapProps & WrappedComponentProps> {
  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  private formRef: any;

  handleOk = () => {
    this.formRef.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api.team}/${this.props.data.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
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
    const { visible, data } = this.props;

    return (
      <Modal
        title={this.props.intl.formatMessage({ id: 'table.modify' })}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <TeamForm type="put" initialValue={data} ref={(ref: any) => { this.formRef = ref; }} />
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(ModifyTeam) as any);
