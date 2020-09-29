import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message } from 'antd';
import _ from 'lodash';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@common/api';

const FormItem = Form.Item;
const { TextArea } = Input;

class BatchImportExportModal extends Component {
  static propTypes = {
    data: PropTypes.array, // 批量操作的数据
    type: PropTypes.string.isRequired, // import | export
    selectedNid: PropTypes.number,
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    destroy: PropTypes.func,
  };

  static defaultProps = {
    data: undefined,
    selectedNid: undefined,
    title: '',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  handleOk = () => {
    if (this.props.type === 'import') {
      const { getFieldValue } = this.props.form;
      const data = getFieldValue('data');
      let parsed;

      try {
        parsed = _.map(JSON.parse(data), (item) => {
          return {
            type: item.collect_type,
            data: {
              ...item,
              nid: this.props.selectedNid,
            },
          };
        });
      } catch (e) {
        message.error(e.toString());
      }

      if (parsed) {
        request(api.collect, {
          method: 'POST',
          body: JSON.stringify(parsed),
        }).then(() => {
          this.props.onOk();
          this.props.destroy();
        });
      }
    } else {
      this.props.destroy();
    }
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { title, visible, data } = this.props;
    const { getFieldDecorator } = this.props.form;
    let initialValue;

    try {
      initialValue = !_.isEmpty(data) ? JSON.stringify(data, null, 4) : undefined;
    } catch (e) {
      console.log(e);
    }

    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem>
            {
              getFieldDecorator('data', {
                initialValue,
              })(
                <TextArea autoSize={{ minRows: 2, maxRows: 10 }} />,
              )
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(BatchImportExportModal));
