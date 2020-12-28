import React, { Component } from 'react';
import { Modal, Form, Select, message } from 'antd';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@common/api';

const FormItem = Form.Item;

class BindTags extends Component<any> {
  // static propTypes = {
  //   selectedIds: PropTypes.array.isRequired,
  //   visible: PropTypes.bool,
  //   onOk: PropTypes.func,
  //   destroy: PropTypes.func,
  // };

  static defaultProps = {
    visible: true,
    onOk: _.noop,
    destroy: _.noop,
  };

  handleOk = () => {
    const { selectedIds } = this.props;
    this.props.form.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api.tasktpls}/tags`, {
          method: 'PUT',
          body: JSON.stringify({
            tags: _.join(values.tags, ','),
            ids: selectedIds,
            act: 'bind',
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'tpl.tag.bind.success' }));
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
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={this.props.intl.formatMessage({ id: 'tpl.tag.bind.title' })}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label={this.props.intl.formatMessage({ id: 'tpl.tag.bind.field' })} required>
            {getFieldDecorator('tags', {
              rules: [{ required: true , message: '请选择！'}],
            })(
              <Select mode="tags" />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(injectIntl(BindTags)));
