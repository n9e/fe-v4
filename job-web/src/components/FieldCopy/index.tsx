import React, { Component } from 'react';
import {
  Modal, Input, Icon, message,
} from 'antd';
import _ from 'lodash';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import clipboard from '@pkgs/clipboard';

interface Props {
  dataIndex: string,
  data: any[],
  hasSelected?: boolean,
}
type CopyType = 'all' | 'selected' | 'currentPage';
type HandleCopyBtnClick = (dataIndex: string, copyType: CopyType) => void;

class HostCopyTitle extends Component<Props & WrappedComponentProps> {
  static defaultProps = {
    data: [],
    selected: [],
    hasSelected: true,
  };

  handleCopyBtnClick: HandleCopyBtnClick = async (dataIndex, copyType) => {
    const { data } = this.props;
    let tobeCopy = [];

    if (copyType === 'all') {
      tobeCopy = _.map(data, (item) => item[dataIndex]);
    }

    if (_.isEmpty(tobeCopy)) {
      message.warning(this.props.intl.formatMessage({ id: 'host.copy.empty' }));
      return;
    }

    const tobeCopyStr = _.join(tobeCopy, '\n');
    const copySucceeded = clipboard(tobeCopyStr);

    if (copySucceeded) {
      if (this.props.intl.locale === 'zh') {
        message.success(`复制成功${tobeCopy.length}条记录`);
      } else if (this.props.intl.locale === 'en') {
        message.success(`Successful copy ${tobeCopy.length} items`);
      }
    } else {
      Modal.warning({
        title: this.props.intl.formatMessage({ id: 'host.copy.error' }),
        content: <Input.TextArea defaultValue={tobeCopyStr} />,
      });
    }
  }

  render() {
    const { dataIndex } = this.props;

    return (
      <span>
        Host
        <Icon
          type="copy"
          className="pointer"
          style={{ paddingLeft: 5 }}
          onClick={() => this.handleCopyBtnClick(dataIndex, 'all')}
        />
      </span>
    );
  }
}

export default injectIntl(HostCopyTitle);
