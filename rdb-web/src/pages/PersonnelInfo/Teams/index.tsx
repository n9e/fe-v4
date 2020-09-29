import React, { useState } from 'react';
import { Icon, Row, Col, message } from 'antd';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import _ from 'lodash';
import { Tenant } from '@interface';
import request from '@pkgs/request';
import Members from '@cpts/Members';
import { appname } from '@common/config';
import api from '@common/api';
import SiderList from './SiderList';
import CreateTeam from './CreateTeam';
import ModifyTeam from './ModifyTeam';
import './assets/style.less';

function index(props: WrappedComponentProps) {
  const [selectedItem, setSelectedItem] = useState<Tenant>();
  const [siderListKey, setSiderListKey] = useState(_.uniqueId('siderListKey'));

  return (
    <Row gutter={20}>
      <Col span={6}>
        <SiderList
          key={siderListKey}
          title={props.intl.formatMessage({ id: 'menu.rdb.superUser.team-management' })}
          intl={props.intl}
          selectedItem={selectedItem}
          onChange={(item) => {
            setSelectedItem(item);
          }}
          onCreate={() => {
            CreateTeam({
              language: props.intl.locale,
              onOk: () => {
                setSiderListKey(_.uniqueId('siderListKey'));
              },
            });
          }}
          onDelete={(id) => {
            request(`${api.team}/${id}`, {
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
        <div className={`${appname}-team-meta`}>
          <h4>
            <span style={{ paddingRight: 10 }}>{_.get(selectedItem, 'name')}</span>
            <a>
              <Icon
                type="edit"
                onClick={() => {
                  ModifyTeam({
                    language: props.intl.locale,
                    data: selectedItem,
                    onOk: () => {
                      setSiderListKey(_.uniqueId('siderListKey'));
                    },
                  });
                }}
              />
            </a>
          </h4>
          <div className={`${appname}-team-meta-detail`}>
            <span style={{ paddingRight: 20 }}>
              {props.intl.formatMessage({ id: 'table.ident' })}: {_.get(selectedItem, 'ident')}
            </span>
            <span>
            {props.intl.formatMessage({ id: 'table.note' })}: {_.get(selectedItem, 'note')}
            </span>
          </div>
        </div>
        <div>
          <Members type="team" id={_.get(selectedItem, 'id')} />
        </div>
      </Col>
    </Row>
  );
}

export default injectIntl(index);
