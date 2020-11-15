import React, { useEffect, useState } from 'react';
import { Tabs, Breadcrumb, Card } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import request from '@pkgs/request';
import api from '@pkgs/api';
import Dashboard from './Dashboard';
import Fields from './Fields';

const { TabPane } = Tabs;
function fetchDataByType(type: 'user' | 'team') {
  return request(`${api[type]}s${type === 'team' ? '/all' : ''}?limit=10000`).then((res: any) => res.list || []);
}

export default function Detail(props: RouteComponentProps) {
  const intlFormatMsg = useFormatMessage();
  const id = _.get(props, 'match.params.id');
  const [hostData, setHostData] = useState<any>([]);
  const [extendFields, setExtendFields] = useState<any>([]);
  const [extendFieldsValue, setExtendFieldsValue] = useState<any>([]);
  const [userData, setUserData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const fetchData = (currentId: number) => {
    if (currentId) {
      request(`${api.host}/${currentId}`).then((res) => {
        const data = res || {};
        setHostData(data);
      });
      request(`${api.host}/${currentId}/fields`).then((res) => {
        const data = res || {};
        setExtendFieldsValue(data);
      });
    }
  }

  useEffect(() => {
    fetchData(id);
    request(`${api.hosts}/fields`).then((res) => {
      const data = res || {};
      setExtendFields(data);
    });
    fetchDataByType('user').then((data) => {
      setUserData(data);
    });
    fetchDataByType('team').then((data) => {
      setTeamData(data);
    });
  }, [id]);

  const { ident } = hostData;

  return (
    <>
      <Breadcrumb style={{ margin: 10 }}>
        <Breadcrumb.Item>
          <Link to={{ pathname: `/hosts/management` }}>{intlFormatMsg({ id: 'hosts.list.title' })}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{ident}</Breadcrumb.Item>
      </Breadcrumb>
      <Card bodyStyle={{ padding: '10px 24px 24px 24px' }}>
        <Tabs
          animated={false}
          defaultActiveKey={_.get(props, 'location.state.detailActiveKey', 'detail')}
        >
          <TabPane tab={intlFormatMsg({ id: 'hosts.detail' })} key="detail">
            <Fields
              hostId={id}
              fileds={hostData}
              extendFields={extendFields}
              extendFieldsValue={extendFieldsValue}
              userData={userData}
              teamData={teamData}
            />
          </TabPane>
          <TabPane tab={intlFormatMsg({ id: 'hosts.monitor' })} key="monitor">
            <Dashboard
              selectedHosts={ident ? [ident] : []}
              onSelectedHostsChange={(val: number) => {
                if (val) {
                  fetchData(val);
                } else {
                  setHostData([]);
                  setExtendFieldsValue([]);
                }
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </>
  )
}
