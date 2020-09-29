import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import ModalControl from '@pkgs/ModalControl';
import CustomForm from './CustomForm';

class DetailModal extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    destroy: PropTypes.func,
  };

  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  constructor(props) {
    super(props);
    this.state = {
      submitLoading: false,
    };
  }

  handleOk = () => {
    this.props.onOk();
    this.props.destroy();
  }

  handleCancel = () => {
    this.props.onCancel();
    this.props.destroy();
  }

  render() {
    const {
      visible, category, data, treeData,
    } = this.props;
    const { submitLoading } = this.state;

    return (
      <div>
        <Modal
          width={900}
          title={<FormattedMessage id="silence.detail.title" />}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={submitLoading}
        >
          <CustomForm
            ref={(ref) => { this.customForm = ref; }}
            category={category}
            treeData={treeData}
            initialValues={data}
            readOnly
          />
        </Modal>
      </div>
    );
  }
}

export default ModalControl(DetailModal);
