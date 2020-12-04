import React from 'react';
import { Button, message } from 'antd';
import _ from 'lodash';
import request from '@pkgs/request';
import { Link } from 'react-router-dom';
import api from '@common/api';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import TplForm from './TplForm';

const Add = (props: any) => {
  const intlFmtMsg = useFormatMessage();
  const handleSubmit = (values: any) => {
    request(`${api.tasktpls}?nid=${values.nid}`, {
      method: 'POST',
      body: JSON.stringify(values),
    }).then(() => {
      message.success(intlFmtMsg({ id: 'msg.create.success' }));
      props.history.push({
        pathname: `/tpls`,
      });
    });
  };

  return (
    <TplForm
      onSubmit={handleSubmit}
      footer={
        <div>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}> 
            {intlFmtMsg({ id: 'form.submit' })}
          </Button>
          <Button>
            <Link to={{ pathname: '/tpls' }}>返回</Link>
          </Button>
        </div>
      }
    />
  )
}

export default CreateIncludeNsTree(Add, { visible: false });
