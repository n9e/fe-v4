import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popconfirm, Divider, Input, Table, Row, Col, message } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import { prefixCls } from '@common/config';
import request from '@pkgs/request';
import api from '@common/api';
import DetailModal from './DetailModal';
import './style.less';

const nPrefixCls = `${prefixCls}-silence`;
const timeFormatMap = {
  antd: 'yyyy-MM-dd HH:mm:ss',
  moment: 'YYYY-MM-DD HH:mm:ss',
};

class index extends Component {
  static contextType = NsTreeContext;

  constructor(props) {
    super(props);
    this.othenParamsKey = ['dept_id'];
    this.state = {
      ...this.state,
      data: [],
      loading: false,
      filterValue: {
        search: '',
      },
      delBtnLoading: false,
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    this.fetchData(_.get(this.context, 'data.selectedNode.id'));
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    const selectedNodeId = _.get(this.context, 'data.selectedNode.id');
    const nextSelectedNodeId = _.get(nextContext, 'data.selectedNode.id');

    if (selectedNodeId !== nextSelectedNodeId) {
      this.fetchData(nextSelectedNodeId);
    }
  }

  fetchData(selectedNodeId) {
    if (selectedNodeId) {
      request(`${api.monNode}/${selectedNodeId}/maskconf`, {
      }).then((res) => {
        this.setState({ data: res || [] });
      });
    }
  }

  handleDelConfirm = (id) => {
    request(`${api.maskconf}/${id}`, {
      method: 'DELETE',
    }).then(() => {
      message.success('解除成功！');
      this.fetchData(_.get(this.context, 'data.selectedNode.id'));
    });
  }

  filterData() {
    const { data, filterValue } = this.state;
    const { search = '' } = filterValue;
    const reg = new RegExp(search);

    return _.filter(data, (item) => {
      if (search) {
        const metric = item.metric || '';
        const endpoints = item.endpoints || '';
        const cause = item.cause || '';
        if (!reg.test(metric) && !reg.test(endpoints) && !reg.test(cause)) {
          return false;
        }
      }
      return true;
    });
  }

  render() {
    const { filterValue } = this.state;
    const data = this.filterData();
    const selectedNodeId = _.get(this.context, 'data.selectedNode.id');

    if (!selectedNodeId) {
      return (
        <div>
          <FormattedMessage id="node.select.help" />
        </div>
      );
    }

    return (
      <div className={nPrefixCls}>
        <div className={`${nPrefixCls}-operationbar`} style={{ marginBottom: 10 }}>
          <Row>
            <Col span={12}>
              <Input
                style={{ width: 200, marginLeft: 8 }}
                placeholder="请输入指标名称"
                value={filterValue.search}
                onChange={(e) => {
                  this.setState({
                    filterValue: {
                      ...filterValue,
                      search: e.target.value,
                    },
                  });
                }}
              />
            </Col>
            <Col span={12} className="textAlignRight">
              <Button
                style={{ marginRight: 8 }}
              >
                <Link to={{ pathname: '/silence/add', search: `nid=${_.get(this.context, 'data.selectedNode.id')}` }}>
                  <FormattedMessage id="silence.add" />
                </Link>
              </Button>
            </Col>
          </Row>
        </div>
        <div className="alarm-strategy-content">
          <Table
            rowKey="id"
            dataSource={data}
            columns={[
              {
                title: <FormattedMessage id="silence.metric" />,
                dataIndex: 'metric',
                width: 150,
              }, {
                title: 'Endpoints',
                dataIndex: 'endpoints',
                render(text) {
                  return _.map(text, (item) => {
                    return <div key={item}>{item}</div>;
                  });
                },
              }, {
                title: <FormattedMessage id="silence.bindNode" />,
                dataIndex: 'node_path',
                render: (text, record) => {
                  if (record.category === 1) {
                    return text;
                  }
                  return _.map(text, val => val);
                },
              }, {
                title: <FormattedMessage id="silence.time" />,
                width: 180,
                render(text, record) {
                  const beginTs = record.btime;
                  const endTs = record.etime;
                  if (beginTs && endTs) {
                    return (
                      <span>
                        {moment(beginTs * 1000).format(timeFormatMap.moment)} ~ {moment(endTs * 1000).format(timeFormatMap.moment)}
                      </span>
                    );
                  }
                  return <span>unknown</span>;
                },
              }, {
                title: <FormattedMessage id="silence.cause" />,
                dataIndex: 'cause',
                width: 120,
              }, {
                title: <FormattedMessage id="silence.user" />,
                dataIndex: 'user',
              }, {
                title: <FormattedMessage id="table.operations" />,
                // width: 100,
                render: (text, record) => (
                  <span>
                    <Popconfirm title={<FormattedMessage id="table.delete.sure" />} onConfirm={() => { this.handleDelConfirm(record.id); }}>
                      <a><FormattedMessage id="silence.delete" /></a>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <a
                      onClick={() => {
                        DetailModal({
                          language: this.props.intl.locale,
                          data: record,
                          treeData: _.get(this.context, 'data.treeData'),
                        });
                      }}
                    >
                      <FormattedMessage id="table.detail" />
                    </a>
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    );
  }
}

export default CreateIncludeNsTree(injectIntl(index), { visible: true });
