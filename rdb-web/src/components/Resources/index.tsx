import React, { Component } from 'react';
import {
  Row, Col, Input, Button, Tag, Select,
} from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import queryString from 'query-string';
import { FormattedMessage, WrappedComponentProps } from 'react-intl';
import DynamicColumns from '@pkgs/DynamicColumns';
import FetchTable from '@pkgs/FetchTable';
import api from '@pkgs/api';
import request from '@pkgs/request';
import ResourceFieldCopy from '@cpts/ResourceFieldCopy';
import BatchSearch from './BatchSearch';

interface Props {
  backendPagingEnabled?: boolean,
  fetchUrl: string,
  columnKeys?: string[],
  export: (fetchData: () => void) => void,
  renderOper?: (record: any) => React.ReactNode,
  renderBatchOper?: (selectedResources: any) => React.ReactNode,
  scroll?: any,
  field?: string,
  batch?: string,
  mode?: string,
  tenantData?: any,
}

interface State {
  field?: string,
  batch?: string,
  searchValue: string,
  tenant?: string,
  selectedRowKeys: any,
  selectedResources: any,
  bindingVisible: boolean,
  processData?: (data: any[]) => Promise<any>,
  dynamicColumnsValue: string[],
}

const processData = async (data: any[]) => {
  let newData = data;
  const ids = _.map(data, 'id');
  if (ids.length) {
    const res = await request(`${api.resources}/bindings?ids=${_.join(ids, ',')}`);
    newData = _.map(data, (item) => {
      const result = _.find(res, { id: item.id });
      return {
        ...item,
        nodes: _.get(result, 'nodes'),
      };
    });
  }
  return newData;
};

class index extends Component<Props & WrappedComponentProps, State> {
  static defaultProps = {
    backendPagingEnabled: true,
    scroll: { x: 100 },
  };

  fetchtable: any;

  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      field: props.field,
      batch: props.batch,
      searchValue: '',
      tenant: undefined,
      selectedRowKeys: [],
      selectedResources: [],
      bindingVisible: false,
      processData: undefined,
      dynamicColumnsValue: ['id', 'uuid', 'ident', 'note'],
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    let nextField = this.state.field;
    let nextBatch = this.state.batch;
    if (this.props.field !== nextProps.field) {
      nextField = nextProps.field || '';
    }
    if (this.props.batch !== nextProps.batch) {
      nextBatch = nextProps.batch || '';
    }
    this.setState({
      field: nextField,
      batch: nextBatch,
    });
  }

  handelBatchSearchBtnClick = () => {
    BatchSearch({
      title: <FormattedMessage id="resource.batch.filter" />,
      field: this.state.field,
      batch: this.state.batch,
      onOk: (field: string, batch: string) => {
        this.setState({ field, batch });
      },
    });
  }

  handleSearchChange = (value: string) => {
    this.setState({
      searchValue: value,
    });
  }

  reload = () => {
    if (this.fetchtable) {
      this.fetchtable.reload();
    }
  }

  getQuery = () => {
    const {
      batch, field, searchValue, tenant,
    } = this.state;
    const query: { [index: string]: string | number | undefined } = {};

    if (batch) {
      query.batch = _.replace(batch, /\n/g, ',');
    }
    if (field) {
      query.field = field;
    }
    if (searchValue) {
      query.query = searchValue;
    }
    if (tenant) {
      query.tenant = tenant;
    }

    return query;
  }

  getColumns = () => {
    const { backendPagingEnabled, fetchUrl } = this.props;
    const { selectedResources } = this.state;
    const query = this.getQuery();

    if (backendPagingEnabled) {
      query.limit = 10000;
    }

    const fetchAllUrl = `${fetchUrl}?${queryString.stringify(query)}`;

    let fullColumns: ColumnProps<any>[] = [
      {
        title: (
          <ResourceFieldCopy
            title="UUID"
            dataIndex="uuid"
            getdata={() => _.get(this.fetchtable, 'state.data')}
            selected={selectedResources}
            fetchAllUrl={fetchAllUrl}
          />
        ),
        dataIndex: 'uuid',
      }, {
        title: (
          <ResourceFieldCopy
            title={<FormattedMessage id="resource.ident" />}
            dataIndex="ident"
            getdata={() => _.get(this.fetchtable, 'state.data')}
            selected={selectedResources}
            fetchAllUrl={fetchAllUrl}
          />
        ),
        dataIndex: 'ident',
      }, {
        title: (
          <ResourceFieldCopy
            title={<FormattedMessage id="resource.name" />}
            dataIndex="name"
            getdata={() => _.get(this.fetchtable, 'state.data')}
            selected={selectedResources}
            fetchAllUrl={fetchAllUrl}
          />
        ),
        dataIndex: 'name',
      }, {
        title: <FormattedMessage id="resource.cate" />,
        dataIndex: 'cate',
      }, {
        title: <FormattedMessage id="resource.tenant" />,
        dataIndex: 'tenant',
      }, {
        title: <FormattedMessage id="resource.labels" />,
        dataIndex: 'labels',
        render: (text) => {
          if (text) {
            return _.map(_.split(text, ','), (item) => {
              return <Tag key={item}>{item}</Tag>;
            });
          }
          return null;
        },
      }, {
        title: <FormattedMessage id="resource.extend" />,
        dataIndex: 'extend',
      }, {
        title: <FormattedMessage id="table.note" />,
        dataIndex: 'note',
      },
    ];

    if (
      this.props.mode === 'resourcesTree' ||
      this.props.mode === 'shortcut'
    ) {
      fullColumns.push({
        title: <FormattedMessage id="resource.node" />,
        dataIndex: 'nodes',
        render: (text) => (
          <div>
            {
              _.map(text, (item) => (
                <div key={item.id}>
                  {item.path}
                </div>
              ))
            }
          </div>
        ),
      });
    }

    if (this.props.renderOper) {
      fullColumns.push({
        title: <FormattedMessage id="table.operations" />,
        render: (_text, record) => this.props.renderOper!(record),
      });
    }

    const { dynamicColumnsValue } = this.state;

    fullColumns = _.map(fullColumns, (column) => {
      let visible = true;
      if (column.dataIndex) {
        visible = dynamicColumnsValue.indexOf(column.dataIndex) > -1;
      }
      return {
        ...column,
        visible,
      };
    });

    return fullColumns;
  }

  render() {
    const {
      batch, dynamicColumnsValue, tenant,
    } = this.state;
    const query = this.getQuery();
    const columns = this.getColumns();
    const dynamicColumnsOptions = _.map(_.filter(columns, (column) => column.dataIndex), (column: any) => {
      return {
        label: column.title,
        value: column.dataIndex,
        disabled: column.disabled,
      };
    });
    return (
      <div>
        <Row>
          <Col span={20} className="mb10">
            {
              this.props.mode !== 'shortcut'
                ? (
                  <>
                    <Input.Search
                      className="mr10"
                      style={{ width: 200, verticalAlign: 'top' }}
                      onSearch={this.handleSearchChange}
                    />
                    <Button
                      className="mr10"
                      type={batch ? 'primary' : 'default'}
                      icon={batch ? 'check-circle' : ''}
                      onClick={this.handelBatchSearchBtnClick}
                    >
                      <FormattedMessage id="resource.batch.filter" />
                    </Button>
                  </>
                ) : null
            }
            {
              this.props.mode === 'spareResources' ?
                <Select
                  style={{ minWidth: 100, marginRight: 10 }}
                  placeholder="筛选租户"
                  allowClear
                  value={tenant}
                  onChange={(val: string) => {
                    this.setState({ tenant: val });
                  }}
                >
                  {
                    _.map(this.props.tenantData, (item) => {
                      return <Select.Option key={item.ident}>{item.name}</Select.Option>;
                    })
                  }
                </Select> : null
            }
            <Button
              className="mr10"
              onClick={() => {
                this.props.export(this.fetchtable.request);
              }}
            >
              <FormattedMessage id="resource.export.excel" />
            </Button>
            <DynamicColumns
              uid="resources"
              targetType="button"
              options={dynamicColumnsOptions}
              value={dynamicColumnsValue}
              onChange={(keys: string[]) => {
                if (dynamicColumnsValue.indexOf('nodes') === -1 && keys.indexOf('nodes') > -1) {
                  this.setState({
                    processData,
                  }, () => {
                    this.reload();
                  });
                }
                this.setState({
                  dynamicColumnsValue: keys,
                });
              }}
            />
          </Col>
          {
            this.props.renderBatchOper
              ? (
                <Col span={4} className="textAlignRight">
                  {this.props.renderBatchOper(this.state.selectedResources)}
                </Col>
              ) : null
          }
        </Row>
        <FetchTable
          ref={(ref) => { this.fetchtable = ref; }}
          backendPagingEnabled={this.props.backendPagingEnabled}
          url={this.props.fetchUrl}
          query={query}
          processData={(data) => {
            if (this.state.processData) {
              return this.state.processData(data);
            }
            return Promise.resolve(data);
          }}
          tableProps={{
            rowSelection: {
              selectedRowKeys: this.state.selectedRowKeys,
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                  selectedRowKeys,
                  selectedResources: selectedRows,
                });
              },
            },
            columns: _.filter(columns, (column: any) => column.visible) as any,
          }}
        />
      </div>
    );
  }
}

export default index;
