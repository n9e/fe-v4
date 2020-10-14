import React, { useRef } from 'react';
import { Dropdown, Menu, Button, Modal, Card, Divider, message } from 'antd';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import exportHosts from '@common/exportHosts';
import Hosts from '@cpts/Hosts';
import Batch from '@cpts/Hosts/Batch';
import BatchImport from '@cpts/Hosts/BatchImport';
import api from '@pkgs/api';
import request from '@pkgs/request';
import { getIntl } from '@pkgs/hooks/useFormatMessage';

export default function index() {
  const intl = getIntl();
  const hosts = useRef<any>();
  return (
    <Card>
      <Hosts
        ref={hosts}
        mode="management"
        fetchUrl={api.hosts}
        export={async (fetchData: any) => {
          const result = await fetchData({ limit: 10000 });
          if (result) {
            const { data } = result;
            const newData = _.map(data, (item) => ({
              ...item,
              nodes: _.join(_.map(item.nodes, (item) => item.path), '\n\r'),
            }));
            exportHosts(newData, []);
          }
        }}
        renderOper={(record) => {
          return (
            <>
              <Link to={{ pathname: `/hosts/management/${record.id}`, state: { detailActiveKey: 'detail' } }}><FormattedMessage id="hosts.detail" /></Link>
              <Divider type="vertical" />
              <Link to={{ pathname: `/hosts/management/${record.id}`, state: { detailActiveKey: 'monitor' } }}><FormattedMessage id="hosts.monitor" /></Link>
            </>
          );
        }}
        renderBatchOper={(selected) => (
          <Dropdown
            overlay={(
              <Menu>
                <Menu.Item>
                  <Button
                    type="link"
                    onClick={() => {
                      BatchImport({
                        intl,
                        onOk: () => {
                          hosts.current.reload();
                        }
                      });
                    }}
                  >
                    <FormattedMessage id="hosts.batch.import" />
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    disabled={_.isEmpty(selected)}
                    type="link"
                    onClick={() => {
                      Batch({
                        intl,
                        field: 'note',
                        selected,
                        url: `${api.hosts}/note`,
                        onOk: () => {
                          hosts.current.reload();
                        }
                      });
                    }}
                  >
                    <FormattedMessage id="hosts.batch.modify.note" />
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    disabled={_.isEmpty(selected)}
                    type="link"
                    onClick={() => {
                      Batch({
                        intl,
                        field: 'cate',
                        selected,
                        url: `${api.hosts}/cate`,
                        onOk: () => {
                          hosts.current.reload();
                        }
                      });
                    }}
                  >
                    <FormattedMessage id="hosts.batch.modify.cate" />
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    disabled={_.isEmpty(selected)}
                    type="link"
                    onClick={() => {
                      Batch({
                        intl,
                        field: 'tenant',
                        selected,
                        url: `${api.hosts}/tenant`,
                        onOk: () => {
                          hosts.current.reload();
                        }
                      });
                    }}
                  >
                    <FormattedMessage id="hosts.batch.modify.tenant" />
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    disabled={_.isEmpty(selected)}
                    type="link"
                    onClick={() => {
                      Modal.confirm({
                        content: intl.formatMessage({ id: 'hosts.batch.back' }),
                        onOk: () => {
                          request(`${api.hosts}/back`, {
                            method: 'PUT',
                            body: JSON.stringify({
                              ids: _.map(selected, 'id'),
                            }),
                          }).then(() => {
                            message.success(intl.formatMessage({ id: 'hosts.batch.back.success' }));
                            hosts.current.reload();
                          });
                        },
                      });
                    }}
                  >
                    <FormattedMessage id="hosts.batch.back" />
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    disabled={_.isEmpty(selected)}
                    type="link"
                    onClick={() => {
                      Modal.confirm({
                        content: intl.formatMessage({ id: 'hosts.batch.delete' }),
                        onOk: () => {
                          request(api.hosts, {
                            method: 'DELETE',
                            body: JSON.stringify({
                              ids: _.map(selected, 'id'),
                            }),
                          }).then(() => {
                            message.success(intl.formatMessage({ id: 'hosts.batch.delete.success' }));
                            hosts.current.reload();
                          });
                        },
                      });
                    }}
                  >
                    <FormattedMessage id="hosts.batch.delete" />
                  </Button>
                </Menu.Item>
              </Menu>
            )}
          >
            <Button icon="down"><FormattedMessage id="hosts.batch.operations" /></Button>
          </Dropdown>
        )}
      />
    </Card>
  )
}
