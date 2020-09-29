import React, { Component } from 'react';
import _ from 'lodash';
import {
  Form, Input, Radio, Button,
} from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import exportResources from '@common/exportResources';
import Resources from '@cpts/Resources';
import api from '@pkgs/api';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class index extends Component<any> {
  table: any;

  state = {
    url: '',
    field: '',
    batch: '',
  }

  exportFunc = async (fetchData: any) => {
    const result = await fetchData();
    if (result) {
      const { data } = result;
      const newData = _.map(data, (item) => ({
        ...item,
        nodes: _.join(_.map(item.nodes, (item) => item.path), '\n\r'),
      }));
      exportResources(newData, ['nodes']);
    }
  }

  handleSubmit = (e: any) => {
    const { getFieldValue } = this.props.form;
    e.preventDefault();
    this.setState({
      url: `${api.resources}/search`,
      field: getFieldValue('field'),
      batch: getFieldValue('batch'),
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form!;
    return (
      <div>
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <FormItem label={<FormattedMessage id="resource.filter.field" />}>
            {getFieldDecorator('field', {
              initialValue: 'ident',
            })(
              <RadioGroup>
                <Radio value="uuid">UUID</Radio>
                <Radio value="ident"><FormattedMessage id="resource.ident" /></Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="resource.filter.value" />}>
            {getFieldDecorator('batch', {
              initialValue: '',
            })(
              <Input.TextArea
                autosize={{ minRows: 2, maxRows: 10 }}
              />,
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit">
              <FormattedMessage id="resource.search" />
            </Button>
          </FormItem>
        </Form>
        <Resources
          intl={this.props.intl}
          ref={(ref) => { this.table = ref; }}
          mode="shortcut"
          scroll={{ x: 1000 }}
          fetchUrl={this.state.url}
          export={this.exportFunc}
          field={this.state.field}
          batch={this.state.batch}
        />
      </div>
    );
  }
}

export default injectIntl(CreateIncludeNsTree(Form.create()(index), { visible: false }));
