import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Icon, Input, Tooltip } from 'antd';
import { objectTrim } from './utils';

export default class Tags extends Component {
  static propTypes = {
    readOnly: PropTypes.bool.isRequired,
    value: PropTypes.array,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    value: [],
    onChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: _.isArray(props.value),
    };
  }
  handleAddBtnClick = () => {
    const { onChange } = this.props;
    const visible = !this.state.visible;
    this.setState({
      visible,
    }, () => {
      if (!visible) {
        onChange();
      } else {
        onChange([]);
      }
    });
  }
  handleTkeyChange = (e) => {
    const { onChange, value } = this.props;
    const currentTag = value[0] || {};
    const val = e.target.value;
    onChange([{
      tkey: val,
      tval: currentTag.tval || [],
    }]);
  }
  handleTvalChange = (e) => {
    const { onChange, value } = this.props;
    const currentTag = value[0] || {};
    const val = e.target.value;
    let valArr = [];
    if (val) {
      valArr = _.split(val, '\n');
      objectTrim(valArr);
    }
    onChange([{
      tkey: currentTag.tkey || '',
      tval: valArr,
    }]);
  }
  render() {
    const { value = [], readOnly } = this.props;
    const { visible } = this.state;
    const currentTag = value[0] || {};
    const currentTval = currentTag.tval || [];
    const currentTvalStr = currentTval.join('\n');

    if (readOnly) {
      if (visible) {
        return (
          <div>
            <Input value={currentTag.tkey} disabled />
            <Input value={currentTvalStr} disabled />
          </div>
        );
      }
      return null;
    }
    return (
      <div>
        <a onClick={this.handleAddBtnClick}>
          <span style={{ paddingRight: 5 }}>按照tag屏蔽</span>
          {
            visible ? <Tooltip title="取消tag屏蔽"><Icon type="cross-circle-o" /></Tooltip> : null
          }
        </a>
        （只屏蔽包含特定tag的报警通知）
        {
          visible ?
            <div>
              <Input
                disabled={readOnly}
                placeholder="tag名称"
                value={currentTag.tkey}
                onChange={this.handleTkeyChange}
              />
              <Input
                disabled={readOnly}
                type="textarea"
                placeholder="tag取值，多个值用换行分割 (支持通配符)"
                value={currentTvalStr}
                onChange={this.handleTvalChange}
              />
            </div> : null
        }
      </div>
    );
  }
}
