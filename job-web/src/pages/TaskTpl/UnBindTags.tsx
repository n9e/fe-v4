import React, { Component } from 'react';
import { Modal, Form, Select, message } from 'antd';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@common/api';

const FormItem = Form.Item;
const { Option } = Select;

class UnBindTags extends Component<any> {
  // static propTypes = {
  //   selectedIds: PropTypes.array.isRequired,
  //   uniqueTags: PropTypes.array.isRequired,
  //   visible: PropTypes.bool,
  //   onOk: PropTypes.func,
  //   destroy: PropTypes.func,
  // };

  static defaultProps = {
    // title: '批量解绑标签',
    visible: true,
    onOk: _.noop,
    destroy: _.noop,
  };

  handleOk = () => {
    const { selectedIds, title } = this.props;
    this.props.form.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api.tasktpl}s/tags`, {
          method: 'PUT',
          body: JSON.stringify({
            tags: _.join(values.tags, ','),
            ids: selectedIds,
            act: 'unbind',
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'tpl.tag.unbind.success' }));
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
    const { visible, uniqueTags } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={this.props.intl.formatMessage({ id: 'tpl.tag.unbind.title' })}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label={this.props.intl.formatMessage({ id: 'tpl.tag.unbind.field' })} required>
            {getFieldDecorator('tags', {
              rules: [{ required: true }],
            })(
              <Select mode="tags">
                {
                  _.map(uniqueTags, (tag) => {
                    return <Option key={tag}>{tag}</Option>;
                  })
                }
              </Select>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(injectIntl(UnBindTags)));
