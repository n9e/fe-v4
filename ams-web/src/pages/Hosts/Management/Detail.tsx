import React, { useEffect, useState } from 'react';
import { Tabs, Table, Breadcrumb, Card } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import { RouteComponentProps } from 'react-router-dom';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import request from '@pkgs/request';
import api from '@pkgs/api';
import Dashboard from './Dashboard';

const { TabPane } = Tabs;

export default function Detail(props: RouteComponentProps) {
  const intlFormatMsg = useFormatMessage();
  const id = _.get(props, 'match.params.id');
  const [hostData, setHostData] = useState<any>([]);
  const normalizeHostData = (data: any) => {
    return [
      {
        field: 'id',
        fieldName: 'ID',
        value: data.id,
      }, {
        field: 'sn',
        fieldName: 'SN',
        value: data.sn,
      }, {
        field: 'ident',
        fieldName: intlFormatMsg({ id: 'hosts.ident' }),
        value: data.ident,
      }, {
        field: 'ip',
        fieldName: 'IP',
        value: data.ip,
      }, {
        field: 'name',
        fieldName: intlFormatMsg({ id: 'hosts.name' }),
        value: data.name,
      }, {
        field: 'cate',
        fieldName: intlFormatMsg({ id: 'hosts.cate' }),
        value: data.cate,
      }, {
        field: 'cpu',
        fieldName: 'CPU',
        value: data.cpu,
      }, {
        field: 'mem',
        fieldName: intlFormatMsg({ id: 'hosts.mem' }),
        value: data.mem,
      }, {
        field: 'disk',
        fieldName: intlFormatMsg({ id: 'hosts.disk' }),
        value: data.disk,
      }, {
        field: 'note',
        fieldName: intlFormatMsg({ id: 'hosts.note' }),
        value: data.note,
      }, {
        field: 'tenant',
        fieldName: intlFormatMsg({ id: 'hosts.tenant' }),
        value: data.tenant,
      }, {
        field: 'clock',
        fieldName: intlFormatMsg({ id: 'hosts.clock' }),
        value: data.clock ? moment.unix(data.clock).format() : '',
      }
    ];
  };

  useEffect(() => {
    if (id) {
      request(`${api.host}/${id}`).then((res) => {
        const data = res || {};
        setHostData(normalizeHostData(data));
      });
    }
  }, [id]);

  const ident = _.get(_.find(hostData, { field: 'ident' }), 'value');

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
            <Table
              rowKey="field"
              size="small"
              bordered
              dataSource={hostData}
              columns={[
                {
                  title: intlFormatMsg({ id: 'field' }),
                  dataIndex: 'field',
                  render: (_text, record: any) => {
                    return record.fieldName;
                  },
                }, {
                  title: intlFormatMsg({ id: 'value' }),
                  dataIndex: 'value',
                }
              ]}
              pagination={false}
            />
          </TabPane>
          <TabPane tab={intlFormatMsg({ id: 'hosts.monitor' })} key="monitor">
            <Dashboard
              selectedHosts={ident ? [ident] : []}
              onSelectedHostsChange={(val: any[]) => {
                if (val) {
                  request(`${api.host}/${val}`).then((res) => {
                    const data = res || {};
                    setHostData(normalizeHostData(data));
                  });
                } else {
                  setHostData([]);
                }
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </>
  )
}
