import React, { Component } from 'react';
import {
  Modal, Form, Input, Radio,
} from 'antd';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';

interface Props {
  field: 'uuid' | 'ident',
  batch: string,
}

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class BatchSearch extends Component<Props & FormProps & ModalWrapProps & WrappedComponentProps> {
  handleOk = () => {
    this.props.form!.validateFields((err, values) => {
      if (!err) {
        const batch = _.replace(values.batch, /\n/g, ',');
        this.props.onOk(values.field, batch);
        this.props.destroy();
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const {
      title, visible, field, batch,
    } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem label={<FormattedMessage id="resource.filter.field" />}>
            {getFieldDecorator('field', {
              initialValue: field || 'ident',
            })(
              <RadioGroup>
                <Radio value="uuid">UUID</Radio>
                <Radio value="ident"><FormattedMessage id="resource.ident" /></Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="resource.filter.value" />}>
            {getFieldDecorator('batch', {
              initialValue: _.replace(batch, /,/g, '\n'),
            })(
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 10 }}
              />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Form.create()(BatchSearch)) as any);
