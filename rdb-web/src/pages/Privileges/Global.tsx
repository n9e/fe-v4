import React, { useState, useEffect } from 'react'
import { normalizeTreeData } from '@pkgs/Layout/utils';
import { TreeNodes } from './interface'
import request from '@pkgs/request';
import api from '@pkgs/api';
import _ from 'lodash';
import { Tree, Button, Modal, Form, message } from 'antd';
import ContextMenu from '@pkgs/ContextMenu';
import BaseAddForm from './BaseAddForm';


export interface IState {
  treeLoading?: boolean,
  selectedNode?: TreeNodes,
  treeData?: TreeNodes[],
  treeNodes?: TreeNodes[],
  expandedKeys?: string[],
  treeSearchValue?: string,
  reloadflag?: number,
  autoExpandParent: boolean,
  checkedKeys: any,
  selectedKeys: any,
}

const { TreeNode } = Tree;

const Global = (props: any) => {
  const [state, setState] = useState<IState>({
    treeData: [],
    treeNodes: [],
    expandedKeys: ['0-0-0', '0-0-1'],
    autoExpandParent: true,
    checkedKeys: [],
    selectedKeys: [],
  })

  const [rightOnclick, setRightClick] = useState({
    contextMenuVisiable: false,
    contextMenuTop: 0,
    contextMenuLeft: 0,
    contextMenuType: 'createPdl',
    contextMenuSelectedNode: {},
  })
  const [firstVisible, setFirstVisible] = useState(false);
  const { getFieldDecorator, validateFields } = props.form;

  const fetchData = async () => {
    const tree = await request(`${api.privileges}`);
    const treeNodes = normalizeTreeData(_.cloneDeep(tree));
    setState({ ...state, treeData: treeNodes })
  }

  const renderTreeNodes = (data: any) =>
    data.map((item: any) => {
      if (item.children) {
        return (
          <TreeNode title={item.cn} key={item.id} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} {...item} title={item.cn} />;
    });


  const onExpand = (expandedKeys: any) => {
    // console.log('onExpand', expandedKeys);
    setState({
      ...state,
      expandedKeys,
      autoExpandParent: false,
    });
  };


  const onSelect = (selectedKeys: any, _info: any) => {
    // console.log('onSelect', info);
    setState({ ...state, selectedKeys });
  };

  const onOk = (e: any) => {
    e.preventDefault();
    validateFields((errors: any, values: any) => {
      if (errors) return;
      if (!errors) {
        setFirstVisible(false);
        request(api.privileges, {
          method: 'POST',
          body: JSON.stringify([{
            cn: values.cn,
            en: values.en,
            leaf: values.left ? 1 : 0,
            typ: 'global',
            pid: 1,
            weight: 1,
            path: "a.switch",
          }])
        }).then(() => {
          message.success('success')
          fetchData();
        })
      }
    }
    )
  }

  const onCancel = () => setFirstVisible(false)

  const onCheck = (checkedKey: any) => {
    const checkedKeys = checkedKey.map((item: string) => Number(item));
    setState({ ...state, checkedKeys })
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确定删除选中权限点？',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        request(api.privileges, {
          method: 'DELETE',
          body: JSON.stringify(state.checkedKeys)
        }).then(() => fetchData())
      },
    });
  }
  useEffect(() => {
    fetchData()
  }, [])


  return <>
    <Button onClick={() => setFirstVisible(true)}>添加一级权限</Button>
    <Button style={{ marginLeft: 8 }} onClick={handleDelete}>批量删除</Button>
    <Button style={{ marginLeft: 8 }}>导入</Button>
    <Button style={{ marginLeft: 8 }}>导出</Button>
    <Tree
      checkable
      onExpand={onExpand}
      expandedKeys={state.expandedKeys}
      autoExpandParent={state.autoExpandParent}
      onCheck={onCheck}
      checkedKeys={state.checkedKeys}
      onSelect={onSelect}
      draggable
      selectedKeys={state.selectedKeys}
      onRightClick={(e) => {
        e.event.stopPropagation();
        setRightClick({
          contextMenuVisiable: true,
          contextMenuLeft: e.event.clientX,
          contextMenuTop: e.event.clientY,
          contextMenuType: 'operate',
          contextMenuSelectedNode: e.node.props,
        });
      }}
    >
      {renderTreeNodes(state.treeData)}
    </Tree>
    <Modal
      title='添加一级权限'
      visible={firstVisible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <BaseAddForm getFieldDecorator={getFieldDecorator} />
    </Modal>
    <ContextMenu
      visible={rightOnclick.contextMenuVisiable}
      left={rightOnclick.contextMenuLeft}
      top={rightOnclick.contextMenuTop}>
      <ul
        className="ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root"
      >
        <li className="ant-dropdown-menu-item">
          <a>创建权限</a>
        </li>
        <li className="ant-dropdown-menu-item">
          <a>修改权限</a>
        </li>
        <li className="ant-dropdown-menu-item">
          <a>删除权限</a>
        </li>
        <li className="ant-dropdown-menu-item">
          <a>批量添加权限</a>
        </li>
      </ul>
    </ContextMenu>
  </>
}

export default Form.create()(Global);
