import React, { useState, useEffect } from 'react'
import { normalizeTreeData } from '@pkgs/Layout/utils';
import { TreeNodes } from './interface'
import request from '@pkgs/request';
import api from '@pkgs/api';
import _ from 'lodash';
import { Tree, Button, Modal, Form, message } from 'antd';
import ContextMenu from '@pkgs/ContextMenu';
import { nodeEditorModal } from './BaseAddForm';
import BaseFormGroupForm from './BaseAddGroupForm';
export interface IState {
  treeLoading?: boolean,
  selectedNode?: TreeNodes,
  treeData: TreeNodes[],
  treeNodes: TreeNodes[],
  expandedKeys?: string[],
  treeSearchValue?: string,
  autoExpandParent: boolean,
  checkedKeys: any,
  selectedKeys: any,
}

interface IType {
  type: string,
}

const { TreeNode } = Tree;

const Global = (props: IType | any) => {
  const [state, setState] = useState<IState>({
    treeData: [],
    treeNodes: [],
    expandedKeys: [],
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
  });
  const [groupVisable, setGroupVisable] = useState(false)
  const [selectNode, setSelectNode] = useState([]) as any;
  const { type } = props
  const fetchData = async () => {
    const tree = await request(`${api.privileges}?typ=${type}`);
    const treeNodes = normalizeTreeData(_.cloneDeep(tree));
    setState({ ...state, treeData: _.sortBy(treeNodes, 'weight') })
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
    setState({
      ...state,
      expandedKeys,
      autoExpandParent: false,
    });
  };

  const handleCreatePrivileges = () => {
    setRightClick({ ...rightOnclick, contextMenuVisiable: false });
    nodeEditorModal({
      type: 'create',
      onOk: (values: any, destroy: any) => {
        let selectedNode = rightOnclick.contextMenuSelectedNode as any;
        const { id, typ, path } = selectedNode;
        request(api.privileges, {
          method: 'POST',
          body: JSON.stringify([{
            ...values,
            typ: typ || type,
            pid: id || 0,
            weight: state.treeData.length + 1,
            path: path ? `${path}.${values.en}` : values.en,
          }]),
        }).then(() => {
          message.success('sucess');
          fetchData();
          selectedNode = [];
          if (destroy) destroy();
        });
      },
    })
  }

  const handleCreateGroupPrivileges = () => {
    setRightClick({ ...rightOnclick, contextMenuVisiable: false });
    setGroupVisable(true)
    let selectedNode = rightOnclick.contextMenuSelectedNode as any;
    const data = selectedNode.dataRef || selectedNode
    setSelectNode(data);
  }

  const handleModifyPrivileges = () => {
    setRightClick({ ...rightOnclick, contextMenuVisiable: false });
    let selectedNode = rightOnclick.contextMenuSelectedNode as any;
    nodeEditorModal({
      type: 'modify',
      initialValues: selectedNode.dataRef || selectedNode,
      onOk: (values: any, destroy: any) => {
        const { id, typ, path, pid, weight } = selectedNode.dataRef || selectedNode;
        request(api.privileges, {
          method: 'PUT',
          body: JSON.stringify([{
            ...values,
            typ: typ,
            id: id,
            pid: pid,
            weight: weight,
            path: path,
          }]),
        }).then(() => {
          message.success('sucess');
          fetchData();
          selectedNode = [];
          if (destroy) destroy();
        });
      },
      onCancel: () => {
        selectedNode = []
      }
    })
  }

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

  const handleDeletePrivileges = () => {
    setRightClick({ ...rightOnclick, contextMenuVisiable: false });
    Modal.confirm({
      title: '删除权限点',
      onOk: () => {
        const selectedNode = rightOnclick.contextMenuSelectedNode as any;
        const { id } = selectedNode;
        request(api.privileges, {
          method: 'DELETE',
          body: JSON.stringify([id])
        }).then(() => {
          message.success('success');
          fetchData();
          Modal.destroyAll();
        });
      },
    });
  }

  const onCancel = () => setGroupVisable(false)

  useEffect(() => { fetchData() }, [])

  return <>
    <Button onClick={handleCreatePrivileges}>添加一级权限</Button>
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
    <ContextMenu
      visible={rightOnclick.contextMenuVisiable}
      left={rightOnclick.contextMenuLeft}
      top={rightOnclick.contextMenuTop}>
      <ul
        className="ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root"
      >
        <li className="ant-dropdown-menu-item">
          <a onClick={handleCreatePrivileges}>创建权限</a>
        </li>
        <li className="ant-dropdown-menu-item">
          <a onClick={handleModifyPrivileges}>修改权限</a>
        </li>
        <li className="ant-dropdown-menu-item" >
          <a onClick={handleDeletePrivileges}>删除权限</a>
        </li>
        <li className="ant-dropdown-menu-item">
          <a onClick={handleCreateGroupPrivileges}>批量添加权限</a>
        </li>
      </ul>
    </ContextMenu>
    <Modal
      visible={groupVisable}
      footer={null}
      onCancel={onCancel}
      width={700}
    >
      <BaseFormGroupForm
        selectNode={selectNode}
        onCanel={onCancel}
        fetchData={fetchData}
      />
    </Modal>
  </>
}

export default Form.create()(Global);
