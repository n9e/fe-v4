import React, { Component } from 'react';
import {
  Row, Col, Input, Button,
} from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';
import { FormattedMessage } from 'react-intl';
import DynamicColumns from '@pkgs/DynamicColumns';
import FetchTable from '@pkgs/FetchTable';
import TenantSelect from '@pkgs/TenantSelect';
import ResourceFieldCopy from '@cpts/ResourceFieldCopy';
import BatchSearch from './BatchSearch';

interface Props {
  backendPagingEnabled?: boolean,
  fetchUrl: string,
  columnKeys?: string[],
  export?: (fetchData: () => void) => void,
  renderOper?: (record: any) => React.ReactNode,
  renderBatchOper?: (selectedResources: any) => React.ReactNode,
  scroll?: any,
  field?: string,
  batch?: string,
  mode: string, // management || search
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

class index extends Component<Props, State> {
  static defaultProps = {
    backendPagingEnabled: true,
    scroll: { x: 100 },
  };

  fetchtable: any;

  constructor(props: Props) {
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
      dynamicColumnsValue: ['id', 'ident', 'ip', 'name'],
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
      title: 'Batch filter',
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
        title: 'SN',
        dataIndex: 'sn',
      }, {
        title: (
          <ResourceFieldCopy
            title={<FormattedMessage id="hosts.ident" />}
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
            title="IP"
            dataIndex="ip"
            getdata={() => _.get(this.fetchtable, 'state.data')}
            selected={selectedResources}
            fetchAllUrl={fetchAllUrl}
          />
        ),
        dataIndex: 'ip',
      }, {
        title: (
          <ResourceFieldCopy
            title={<FormattedMessage id="hosts.name" />}
            dataIndex="name"
            getdata={() => _.get(this.fetchtable, 'state.data')}
            selected={selectedResources}
            fetchAllUrl={fetchAllUrl}
          />
        ),
        dataIndex: 'name',
      }, {
        title: <FormattedMessage id="hosts.cate" />,
        dataIndex: 'cate',
      }, {
        title: 'CPU',
        dataIndex: 'cpu',
      }, {
        title: <FormattedMessage id="hosts.mem" />,
        dataIndex: 'mem',
      }, {
        title: <FormattedMessage id="hosts.disk" />,
        dataIndex: 'disk',
      }, {
        title: <FormattedMessage id="hosts.note" />,
        dataIndex: 'note',
      }, {
        title: <FormattedMessage id="hosts.tenant" />,
        dataIndex: 'tenant',
      }, {
        title: <FormattedMessage id="hosts.clock" />,
        dataIndex: 'clock',
        render: (text) => {
          return text ? moment.unix(text).format() : '';
        }
      },
    ];

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
              this.props.mode === 'management'
                ? (
                  <>
                    <Input.Search
                      className="mr10"
                      style={{ width: 200, verticalAlign: 'top' }}
                      onSearch={this.handleSearchChange}
                      placeholder="请输入查询名称"
                    />
                    <Button
                      className="mr10"
                      type={batch ? 'primary' : 'default'}
                      icon={batch ? 'check-circle' : ''}
                      onClick={this.handelBatchSearchBtnClick}
                    >
                      <FormattedMessage id="hosts.batch.filter" />
                    </Button>
                    <TenantSelect
                      style={{ minWidth: 100, marginRight: 10 }}
                      type="all"
                      placeholder={<FormattedMessage id="hosts.select.tenant" />}
                      value={tenant}
                      onChange={(val: string) => {
                        this.setState({ tenant: val });
                      }}
                    />
                  </>
                ) : null
            }
            <Button
              className="mr10"
              onClick={() => {
                if (this.props.export) {
                  this.props.export(this.fetchtable.request);
                }
              }}
            >
              <FormattedMessage id="hosts.export.excel" />
            </Button>
            <DynamicColumns
              uid="resources"
              targetType="button"
              options={dynamicColumnsOptions}
              value={dynamicColumnsValue}
              onChange={(keys: string[]) => {
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
