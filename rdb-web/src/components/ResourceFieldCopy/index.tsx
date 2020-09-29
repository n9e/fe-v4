import React, { Component } from 'react';
import {
  Dropdown, Menu, Modal, Input, Icon, message,
} from 'antd';
import _ from 'lodash';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import clipboard from '@pkgs/clipboard';
import request from '@pkgs/request';

interface Props {
  title: string | React.ReactNode,
  dataIndex: string,
  selected: any[],
  fetchAllUrl: string,
  getdata: () => any[],
  hasSelected?: boolean,
}
type CopyType = 'all' | 'selected' | 'currentPage';
type HandleCopyBtnClick = (dataIndex: string, copyType: CopyType) => void;

class ResourceFieldCopy extends Component<Props & WrappedComponentProps> {
  static defaultProps = {
    selected: [],
    hasSelected: true,
  };

  handleCopyBtnClick: HandleCopyBtnClick = async (dataIndex, copyType) => {
    const { getdata, selected, fetchAllUrl } = this.props;
    let tobeCopy = [];

    if (copyType === 'all') {
      let allData = [];
      allData = await request(fetchAllUrl);
      allData = allData.list !== undefined ? allData.list : allData;
      tobeCopy = _.map(allData, (item) => item[dataIndex]);
    } else if (copyType === 'currentPage') {
      const data = getdata();
      tobeCopy = _.map(data, (item) => item[dataIndex]);
    } else if (copyType === 'selected') {
      tobeCopy = _.map(selected, (item) => item[dataIndex]);
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
    const { dataIndex, hasSelected, title } = this.props;

    if (hasSelected) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={(
            <Menu>
              <Menu.Item>
                <a onClick={() => this.handleCopyBtnClick(dataIndex, 'selected')}>
                  <FormattedMessage id="copy.selected" />
                </a>
              </Menu.Item>
              <Menu.Item>
                <a onClick={() => this.handleCopyBtnClick(dataIndex, 'currentPage')}>
                  <FormattedMessage id="copy.currentPage" />
                </a>
              </Menu.Item>
              <Menu.Item>
                <a onClick={() => this.handleCopyBtnClick(dataIndex, 'all')}>
                  <FormattedMessage id="copy.all" />
                </a>
              </Menu.Item>
            </Menu>
          )}
        >
          <span>
            {
              title
            }
            <Icon type="copy" className="pointer" style={{ paddingLeft: 5 }} />
          </span>
        </Dropdown>
      );
    }
    return (
      <span>
        {
          this.props.children ? this.props.children : title
        }
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

export default injectIntl(ResourceFieldCopy);
