import React, { useState, useEffect } from 'react';
import { Icon, Row, Col, Tabs, Tree, Button, message } from 'antd';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { RouteComponentProps } from 'react-router-dom';
import _ from 'lodash';
import { Tenant } from '@interface';
import Members from '@cpts/Members';
import { appname } from '@common/config';
import request from '@pkgs/request';
import api from '@common/api';
import SiderList from './SiderList';
import CreateRole from './CreateRole';
import ModifyRole from './RoleDetail';
import './assets/style.less';

const { TabPane } = Tabs;
const { TreeNode } = Tree;

function getOpsTreeNodes(opsTree: any) {
  return _.map(opsTree, (systemItem) => {
    return (
      <TreeNode value={systemItem.system} title={systemItem.system} key={systemItem.system}>
        {
          _.map(systemItem.groups, (groupItem) => {
            return (
              <TreeNode value={groupItem.title} title={groupItem.title} key={`${systemItem.system}-${groupItem.title}`}>
                {
                  _.map(groupItem.ops, (opItem) => {
                    return <TreeNode value={opItem.en} title={opItem.cn} key={opItem.en} isLeaf/>;
                  })
                }
              </TreeNode>
            );
          })
        }
      </TreeNode>
    );
  });
}

function index(props: WrappedComponentProps & RouteComponentProps<{type: 'global' | 'locale'}>) {
  const [cate, setCate] = useState(props.match.params.type);
  const [selectedItem, setSelectedItem] = useState<Tenant>();
  const [siderListKey, setSiderListKey] = useState(_.uniqueId('siderListKey'));
  const [state, setState] = useState<any>({
    selected: {
      global: [],
      local: [],
    },
    meta: {},
    operations: [],
    opsTree: [],
  });

  if (cate !== props.match.params.type) {
    setCate(props.match.params.type);
    setSelectedItem(undefined);
  }

  useEffect(() => {
    if (selectedItem) {
      request(`${api.role}/${selectedItem.id}`).then((res) => {
        if (res.role) {
          request(`${api.ops}/${res.role.cate}`).then((ops) => {
            if (res.role.cate === 'global') {
              setState({
                selected: {
                  global: res.operations,
                  local: [],
                },
                meta: res.role,
                operations: res.operations,
                opsTree: ops,
              });
            } else if (res.role.cate === 'local') {
              setState({
                selected: {
                  local: res.operations,
                  global: [],
                },
                meta: res.role,
                operations: res.operations,
                opsTree: ops,
              });
            }
          });
        }
      });
    }
  }, [selectedItem]);

  return (
    <Row gutter={20}>
      <Col span={6}>
        <SiderList
          key={siderListKey}
          subType={cate}
          title={props.intl.formatMessage({ id: 'menu.rdb.superUser.role-management' })}
          intl={props.intl}
          selectedItem={selectedItem}
          onChange={(item) => {
            setSelectedItem(item);
          }}
          onCreate={() => {
            CreateRole({
              language: props.intl.locale,
              cate,
              onOk: () => {
                setSiderListKey(_.uniqueId('siderListKey'));
              },
            });
          }}
          onDelete={(id) => {
            request(`${api.role}/${id}`, {
              method: 'DELETE',
            }).then(() => {
              setSelectedItem(undefined);
              setSiderListKey(_.uniqueId('siderListKey'));
              message.success(props.intl.formatMessage({ id: 'msg.delete.success' }));
            });
          }}
        />
      </Col>
      <Col span={18}>
        <div className={`${appname}-role-meta`}>
          <h4>
            <span style={{ paddingRight: 10 }}>{_.get(selectedItem, 'name')}</span>
            <a>
              <Icon
                type="edit"
                onClick={() => {
                  ModifyRole({
                    language: props.intl.locale,
                    data: selectedItem,
                    cate,
                    meta: state.meta,
                    operations: state.operations,
                    onOk: () => {
                      setSiderListKey(_.uniqueId('siderListKey'));
                    },
                  });
                }}
              />
            </a>
          </h4>
          <div className={`${appname}-role-meta-detail`}>
            <span>
              {props.intl.formatMessage({ id: 'table.note' })}: {_.get(selectedItem, 'note')}
            </span>
          </div>
        </div>
          <Tabs defaultActiveKey="role">
            <TabPane tab={props.intl.formatMessage({ id: 'role.tab.operations' })} key="role">
              <div style={{ border: '1px solid #efefef' }}>
                <Tree
                  checkable
                  checkedKeys={state.selected[cate]}
                  onCheck={(_checkedKeys, event) => {
                    const { checkedNodes } = event;
                    let checkedKeys: string[] = [];
                    _.forEach(checkedNodes, (node) => {
                      if (node.props.isLeaf) {
                        checkedKeys.push(node.props.value);
                      }
                    });
                    setState({
                      ...state,
                      selected: { ...state.selected, [cate]: checkedKeys },
                    });
                  }}
                >
                  {getOpsTreeNodes(state.opsTree)}
                </Tree>
              </div>
              <Button
                type="primary"
                style={{ marginTop: 10 }}
                onClick={() => {
                  if (selectedItem) {
                    request(`${api.role}/${selectedItem.id}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                        ...state.meta,
                        operations: state.selected[cate],
                      }),
                    }).then(() => {
                      setState({
                        ...state,
                        operations: state.selected[cate],
                      });
                      message.success('保存成功！');
                    });
                  }
                }}
              >
                <FormattedMessage id="form.save" />
              </Button>
            </TabPane>
            {
              _.get(selectedItem, 'cate') === 'global' ?
                <TabPane tab={props.intl.formatMessage({ id: 'role.tab.members' })} key="member">
                  <Members type="role" id={_.get(selectedItem, 'id')} />
                </TabPane> : null
            }
          </Tabs>
      </Col>
    </Row>
  );
}

export default injectIntl(index);
