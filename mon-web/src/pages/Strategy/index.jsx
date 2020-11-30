import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Table, Button, Input, Select, Tag, Divider, message, Popconfirm, Dropdown, Menu, Modal } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { FormattedMessage, injectIntl } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { prefixCls, priorityOptions } from '@common/config';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import request from '@pkgs/request';
import api from '@common/api';
import { delStrategy } from './services';
import BatchModModal from './BatchModModal';
import BatchImportExportModal from './BatchImportExportModal';

const { Option } = Select;

class index extends Component {
  static contextType = NsTreeContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      strategyData: [],
      userData: [],
      teamData: [],
      priority: undefined, // for filter
      search: '',
      selectedRows: [],
    };
  }

  componentDidMount = () => {
    this.fetchData();
    this.fetchOtherData();
  }

  componentWillMount = () => {
    const { selectedNode } = this.context.data;
    if (selectedNode) this.selectedNodeId = _.get(selectedNode, 'id');
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    const { selectedNode } = nextContext.data;
    const nextSelectedNodeId = _.get(selectedNode, 'id');

    if (!_.isEqual(this.selectedNodeId, nextSelectedNodeId)) {
      this.setState({
        selectedRows: [],
      }, () => {
        this.selectedNodeId = nextSelectedNodeId;
        this.fetchData();
      });
    }
  }

  async fetchData() {
    if (this.selectedNodeId) {
      this.setState({ loading: true });
      request(`${api.stra}?nid=${this.selectedNodeId}`).then((strategyData) => {
        this.setState({ strategyData });
      }).catch((res) => {
        console.log(res);
      }).finally(() => {
        this.setState({ loading: false });
      });
    }
  }

  async fetchOtherData() {
    try {
      const userData = await request(`${api.users}?limit=10000`);
      const teamData = await request(`${api.teams}/all?limit=10000`);
      this.setState({
        userData: userData.list, teamData: teamData.list,
      });
    } catch (e) {
      console.log(e);
    }
  }

  handleDel(id) {
    delStrategy([id]).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'msg.delete.success' }));
      this.fetchData();
    });
  }

  handleBatchModExclNidBtnClick = () => {
    const { selectedRows } = this.state;
    const { treeData } = this.context.data;
    BatchModModal({
      type: 'exclNid',
      selectedNid: this.selectedNodeId,
      treeNodes: treeData,
      data: selectedRows,
      onOk: () => {
        this.fetchData();
      },
    });
  }

  handleBatchModNotifyBtnClick = () => {
    const { selectedRows } = this.state;
    BatchModModal({
      type: 'notify',
      data: selectedRows,
      onOk: () => {
        this.fetchData();
      },
    });
  }

  handleBatchCloneToOtherNidBtnClick = () => {
    const { selectedRows } = this.state;
    const { treeData } = this.context.data;
    BatchModModal({
      type: 'clone',
      data: selectedRows,
      treeNodes: treeData,
      onOk: () => {
        this.fetchData();
      },
    });
  }

  handleBatchDelBtnClick = () => {
    const { intl } = this.props;
    const { selectedRows } = this.state;
    const ids = _.map(selectedRows, 'id');

    if (ids.length) {
      Modal.confirm({
        title: intl.formatMessage({ id: 'stra.batch.delete' }),
        content: intl.formatMessage({ id: 'table.delete.sure' }),
        onOk: () => {
          delStrategy(ids).then(() => {
            message.success(intl.formatMessage({ id: 'msg.delete.success' }));
            this.fetchData();
          });
        },
      });
    }
  }

  handleBatchImportBtnClick = () => {
    BatchImportExportModal({
      type: 'import',
      title: this.props.intl.formatMessage({ id: 'stra.batch.import' }),
      selectedNid: this.selectedNodeId,
      onOk: () => {
        this.fetchData();
      },
    });
  }

  handleBatchExportBtnClick = () => {
    const { selectedRows } = this.state;
    const newSelectedRows = _.map(selectedRows, (row) => {
      const record = _.cloneDeep(row);
      delete record.id;
      delete record.nid;
      delete record.callback;
      delete record.creator;
      delete record.created;
      delete record.last_updator;
      delete record.last_updated;
      delete record.excl_nid;
      delete record.notify_group;
      delete record.notify_user;
      delete record.leaf_nids;
      delete record.need_upgrade;
      delete record.alert_upgrade;
      return record;
    });
    BatchImportExportModal({
      data: newSelectedRows,
      type: 'export',
      title: this.props.intl.formatMessage({ id: 'stra.batch.export' }),
    });
  }

  filterData() {
    const { strategyData, priority, search } = this.state;
    const currentStrategyData = [];
    const inheritStrategyData = [];

    _.each(strategyData, (item) => {
      let flag = true;
      if (priority) {
        flag = item.priority === priority;
      }
      if (search) {
        const { userData, teamData } = this.state;
        const { name, exprs, notify_group: notifyGroup, notify_user: notifyUser } = item;
        const metrics = _.map(exprs, expr => expr.metric);
        const team = _.map(notifyGroup, (itemGroup) => {
          return _.get(_.find(teamData, { id: itemGroup }), 'name');
        });
        const user = _.map(notifyUser, (itemUser) => {
          return _.get(_.find(userData, { id: itemUser }), 'dispname');
        });
        const notifyTarget = [...team, ...user];
        if (
          name.indexOf(search) === -1 &&
          _.every(metrics, metric => metric.indexOf(search) === -1) &&
          _.every(notifyTarget, notifyTargetItem => notifyTargetItem.indexOf(search) === -1)
        ) {
          flag = false;
        }
      }
      if (flag) {
        if (this.selectedNodeId === item.nid) {
          currentStrategyData.push(item);
        } else {
          inheritStrategyData.push(item);
        }
      }
    });
    return {
      currentStrategyData: _.sortBy(currentStrategyData, 'name'),
      inheritStrategyData: _.sortBy(inheritStrategyData, 'name'),
    };
  }

  render() {
    const { currentStrategyData } = this.filterData();
    return (
      <div className={`${prefixCls} ${prefixCls}-list`}>
        <Row className="mb10">
          <Col span={12}>
            <Select
              allowClear
              style={{ width: 100, marginRight: 10 }}
              className="mr10"
              placeholder={this.props.intl.formatMessage({ id: 'stra.priority' })}
              value={this.state.priority}
              onChange={(value) => {
                this.setState({ priority: value });
              }}
            >
              {
                _.map(priorityOptions, (option) => {
                  return <Option key={option.value} value={option.value}>{option.label}</Option>;
                })
              }
            </Select>
            <Input
              style={{ width: 200 }}
              className="mr10"
              placeholder="请输入查询名称"
              value={this.state.search}
              onChange={(e) => {
                this.setState({ search: e.target.value });
              }}
            />
          </Col>
          <Col span={12} className="textAlignRight">
            <Button className="mr10">
              <Link to={{ pathname: '/strategy/add', search: `nid=${this.selectedNodeId}` }}>
                <FormattedMessage id="stra.add" />
              </Link>
            </Button>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item>
                    <a onClick={() => { this.handleBatchModExclNidBtnClick(); }}><FormattedMessage id="stra.batch.modify.excludeNs" /></a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => { this.handleBatchModNotifyBtnClick(); }}><FormattedMessage id="stra.batch.modify.notify" /></a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => { this.handleBatchCloneToOtherNidBtnClick(); }}><FormattedMessage id="stra.batch.cloneTo.otherNode" /></a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => { this.handleBatchDelBtnClick(); }}><FormattedMessage id="stra.batch.delete" /></a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => { this.handleBatchImportBtnClick(); }}><FormattedMessage id="stra.batch.import" /></a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => { this.handleBatchExportBtnClick(); }}><FormattedMessage id="stra.batch.export" /></a>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button icon="down"><FormattedMessage id="table.batch.operations" /></Button>
            </Dropdown>
          </Col>
        </Row>
        <Table
          rowKey="id"
          pagination={false}
          loading={this.state.loading}
          dataSource={currentStrategyData}
          rowSelection={{
            selectedRowKeys: _.map(this.state.selectedRows, 'id'),
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({
                selectedRows,
              });
            },
          }}
          columns={[
            {
              title: <FormattedMessage id="stra.name" />,
              dataIndex: 'name',
              width: 150,
              render: (text, record) => {
                return <Link to={{ pathname: `/strategy/${record.id}` }}>{text}</Link>;
              },
            }, {
              title: <FormattedMessage id="stra.priority" />,
              width: 40,
              dataIndex: 'priority',
              render: (text) => {
                const currentPriority = _.find(priorityOptions, { value: text });
                return <Tag color={currentPriority.color}>{currentPriority.label}</Tag>;
              },
            }, {
              title: <FormattedMessage id="stra.metric" />,
              // width: 100,
              render: (text, record) => {
                const { exprs } = record;
                return _.map(exprs, (expr, i) => {
                  return (
                    <div key={i}>{expr.metric}</div>
                  );
                });
              },
            }, {
              title: <FormattedMessage id="stra.notify" />,
              render: (text, record) => {
                const { userData, teamData } = this.state;
                const team = _.map(record.notify_group, (item) => {
                  return _.get(_.find(teamData, { id: item }), 'name');
                });
                const user = _.map(record.notify_user, (item) => {
                  return _.get(_.find(userData, { id: item }), 'dispname');
                });
                return _.map([...team, ...user], (item, i) => {
                  return <Tag key={i}>{item}</Tag>;
                });
              },
            }, {
              width: 110,
              title: <FormattedMessage id="table.lastupdated" />,
              render: (text, record) => {
                return (
                  <div>
                    <div>{moment(record.last_updated).format('YYYY-MM-DD HH:mm:ss')}</div>
                  </div>
                );
              },
            }, {
              width: 140,
              title: <FormattedMessage id="table.operations" />,
              render: (text, record) => {
                return (
                  <span className="operation-btns">
                    <Link to={{ pathname: `/strategy/${record.id}` }}><FormattedMessage id="table.modify" /></Link>
                    <Divider type="vertical" />
                    <Link to={{ pathname: `/strategy/${record.id}/clone` }}><FormattedMessage id="table.clone" /></Link>
                    <Divider type="vertical" />
                    <Popconfirm title={<FormattedMessage id="table.delete.sure" />} onConfirm={() => { this.handleDel(record.id); }}>
                      <a><FormattedMessage id="table.delete" /></a>
                    </Popconfirm>
                  </span>
                );
              },
            },
          ]}
        />
      </div>
    );
  }
}

export default CreateIncludeNsTree(injectIntl(index), { visible: true });
