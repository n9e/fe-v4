import React, { useContext, useState, useEffect } from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import List from './List';

function index() {
  const nstreeData = useContext(NsTreeContext);
  const { selectedNode } = nstreeData.data;
  const currentNodePath = _.get(selectedNode, 'path');
  const [nodePath, setNodePath] = useState(currentNodePath);
  const nid = _.get(selectedNode, 'id');
  // eslint-disable-next-line no-restricted-globals
  const query = queryString.parse(location.search);

  useEffect(() => {
    setNodePath(query.nodepathSerach);
  }, []);

  useEffect(() => {
    setNodePath(currentNodePath);
  }, [currentNodePath]);

  return <List
    nodepath={nodePath}
    nid={nid}
    type="all"
    activeKey="all"
  />;
}

export default CreateIncludeNsTree(index, { visible: true });
