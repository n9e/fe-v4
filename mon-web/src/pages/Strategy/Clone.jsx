import React, { Component } from 'react';
import { message } from 'antd';
import _ from 'lodash';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import SettingFields from './SettingFields';
import { getStrategy, addStrategy } from './services';
import { normalizeFormData } from './utils';
import './style.less';

class Add extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: undefined,
    };
  }

  componentDidMount = () => {
    this.getStrategy(this.props);
  }

  getStrategy(props) {
    const strategyId = _.get(props, 'match.params.strategyId');
    if (strategyId) {
      getStrategy(strategyId).then((values) => {
        this.setState({
          values: normalizeFormData(values),
        });
      });
    }
  }

  handleSubmit = (values) => {
    const { history } = this.props;
    addStrategy(values).then(() => {
      message.success('添加报警策略成功!');
      history.push({
        pathname: '/strategy',
      });
    });
  }

  render() {
    const { values } = this.state;

    if (values) {
      return (
        <div>
          <SettingFields
            initialValues={values}
            onSubmit={this.handleSubmit}
          />
        </div>
      );
    }
    return null;
  }
}

export default CreateIncludeNsTree(Add);
