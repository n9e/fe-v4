import React, { useState, useEffect } from 'react'
import { normalizeTreeData } from '@pkgs/Layout/utils';
import { TreeNode } from './interface'

export interface IState {
  treeLoading?: boolean,
  selectedNode?: TreeNode,
  treeData?: TreeNode[],
  treeNodes?: TreeNode[],
  expandedKeys?: string[],
  treeSearchValue?: string,
  reloadflag?: number,
}
const Global = () => {
  const [state, setState] = useState<IState>({
    treeData: [],
    treeNodes: [],
  })

  useEffect(() => {

  },[])
  return <>
    <div>权限页面</div>
  </>
}

export default Global;
