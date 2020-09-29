import React, { useContext, useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import _ from 'lodash';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { normalizeTreeData } from '@pkgs/Layout/utils';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import { TreeNode } from '@pkgs/interface';
import request from '@pkgs/request';
import api from '@common/api';
import CollectForm from './CollectForm';

const fetchTreeData = () => {
  return request(api.tree).then((res) => {
    const treeData = normalizeTreeData(res);
    return treeData;
  });
};

const fetchData = (params: any) => {
  return request(`${api.collect}?id=${params.id}&type=${params.type}`);
};

const handleSubmit = (params: any, values: any, data: any) => {
  const { action, type } = params;
  let reqBody = {
    type,
    data: values,
  } as any;
  if (action === 'add' || action === 'clone') reqBody = [reqBody];
  if (action === 'modify') reqBody.data.id = data.id;
  return request(api.collect, {
    method: action === 'modify' ? 'PUT' : 'POST',
    body: JSON.stringify(reqBody),
  });
};

const CollectFormMain = (props: any) => {
  const params = _.get(props, 'match.params');
  const intlFmtMsg = useFormatMessage();
  const nstreeContext = useContext(NsTreeContext);
  const [treeData, setTreeData] = useState([] as TreeNode[]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTreeData().then((res) => {
      setTreeData(res);
    });
  }, []);

  useEffect(() => {
    if (params.action === 'add') {
      setData({
        nid: _.get(nstreeContext, 'data.selectedNode.id'),
      });
      setLoading(false);
    } else {
      fetchData(params).then((res) => {
        setData(res);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [params.id, params.type]);

  const ActiveForm = CollectForm[params.type];

  return (
    <Spin spinning={loading}>
      <ActiveForm
        params={params}
        treeData={treeData}
        initialValues={data}
        onSubmit={(values: any) => {
          handleSubmit(params, values, data).then(() => {
            message.success(intlFmtMsg({ id: 'msg.modify.success' }));
            props.history.push({
              pathname: '/collect',
            });
          });
        }}
      />
    </Spin>
  );
}

export default CreateIncludeNsTree(CollectFormMain);
