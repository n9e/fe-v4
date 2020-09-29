import React, { Component } from 'react';
import _ from 'lodash';
import { Dropdown, Menu, Button } from 'antd';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import { BatchMod } from '@cpts/ResourceEdit';
import exportResources from '@common/exportResources';
import Resources from '@cpts/Resources';
import BatchBind from '@cpts/Resources/BatchBind';
import api from '@pkgs/api';

class index extends Component<WrappedComponentProps> {
  static contextType = NsTreeContext;

  table: any;

  // eslint-disable-next-line class-methods-use-this
  async export(fetchData: any) {
    const result = await fetchData({ limit: 1000 });
    exportResources(_.get(result, 'data'), []);
  }

  handleModifyBtnClick = (record: any) => {
    BatchMod({
      language: this.props.intl.locale,
      title: <FormattedMessage id="resource.batch.operations.modify.note" />,
      field: 'note',
      url: `${api.resources}/note`,
      selected: [record],
      onOk: () => {
        this.table.reload();
      },
    });
  }

  handleBatchBindHostsBtnClick = (selected: any) => {
    BatchBind({
      title: this.props.intl.formatMessage({ id: 'resource.batch.operations.mount.node' }),
      language: this.props.intl.locale,
      selected,
      onOk: () => {
        this.table.reload();
      },
    });
  }

  handleBatchModifyNoteBtnClick = (selected: any) => {
    BatchMod({
      language: this.props.intl.locale,
      title: <FormattedMessage id="resource.batch.operations.modify.note" />,
      field: 'note',
      url: `${api.resources}/note`,
      selected,
      onOk: () => {
        this.table.reload();
      },
    });
  }

  render() {
    const tenantData = _.filter(_.get(this.context, 'data.treeData'), (item) => item.cate === 'tenant');
    return (
      <Resources
        mode="spareResources"
        tenantData={tenantData}
        intl={this.props.intl}
        ref={(ref) => { this.table = ref; }}
        fetchUrl={`${api.resources}/orphan`}
        export={this.export}
        renderOper={(record) => (
          <a
            onClick={() => {
              this.handleModifyBtnClick(record);
            }}
          >
            <FormattedMessage id="table.modify" />
          </a>
        )}
        renderBatchOper={(selected) => (
          <Dropdown
            overlay={(
              <Menu>
                <Menu.Item>
                  <Button type="link" onClick={() => { this.handleBatchBindHostsBtnClick(selected); }}>
                    <FormattedMessage id="resource.batch.operations.mount" />
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button type="link" disabled={_.isEmpty(selected)} onClick={() => { this.handleBatchModifyNoteBtnClick(selected); }}>
                    <FormattedMessage id="resource.batch.operations.modify.note" />
                  </Button>
                </Menu.Item>
              </Menu>
            )}
          >
            <Button icon="down">
              <FormattedMessage id="resource.batch.operations" />
            </Button>
          </Dropdown>
        )}
      />
    );
  }
}

export default injectIntl(CreateIncludeNsTree(index as any, { visible: false }));
