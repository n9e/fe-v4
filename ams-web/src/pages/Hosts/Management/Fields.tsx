import React from 'react';
import { Row, Col, Card, Form, Select, Input, InputNumber, DatePicker, message } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import request from '@pkgs/request';
import api from '@pkgs/api';
import './style.less';

interface Props {
  form?: any;
  hostId: number;
  fileds: any;
  extendFields: any[];
  extendFieldsValue: any[];
  userData: any[];
  teamData: any[];
}

const EditCell = ({ record, extendFieldsValue, form, save, userData, teamData }: any) => {
  const formItemProps = {
    onPressEnter: save,
    onBlur: save,
  };
  let fieldCpt = <Input size="small" {...formItemProps} />;
  let initialValue = _.get(_.find(extendFieldsValue, { field_ident: record.field_ident }), 'field_value');
  if (record.field_type === 'string' && record.field_extra === 'textarea') {
    fieldCpt = <Input.TextArea {...formItemProps} />;
  }
  if (record.field_type === 'number') {
    fieldCpt = <InputNumber size="small" style={{ width: '100%' }} {...formItemProps} />;
    initialValue = initialValue ? Number(initialValue) : undefined;
  }
  if (record.field_type === 'enum') {
    fieldCpt = (
      <Select size="small" style={{ width: '100%' }} {...formItemProps}>
        {
          _.map(_.split(record.field_extra, ','), (item) => {
            return <Select.Option key={item} value={item}>{item}</Select.Option>;
          })
        }
      </Select>
    );
  }
  if (record.field_type === 'time') {
    fieldCpt = (
      <DatePicker
        size="small"
        showTime
        style={{ width: '100%' }}
        onOpenChange={(status) => {
          if (!status) {
            save({});
          }
        }}
      />
    );
    initialValue = initialValue ? moment(initialValue) : undefined;
  }
  if (record.field_type === 'user') {
    fieldCpt = (
      <Select size="small" style={{ width: '100%' }} mode="multiple" {...formItemProps}>
        {
          _.map(userData, (item: any) => {
            return <Select.Option key={item.username} value={item.username}>{item.username}</Select.Option>;
          })
        }
      </Select>
    );
    initialValue = initialValue ? _.split(initialValue, ',') : undefined;
  }
  if (record.field_type === 'team') {
    fieldCpt = (
      <Select size="small" style={{ width: '100%' }} mode="multiple" {...formItemProps}>
        {
          _.map(teamData, (item: any) => {
            return <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>;
          })
        }
      </Select>
    );
    initialValue = initialValue ? _.split(initialValue, ',') : undefined;
  }

  return (
    <Form.Item style={{ margin: '0 20px 0 0' }}>
      {form.getFieldDecorator(record.field_ident, {
        rules: [
          {
            required: record.field_required,
          },
        ],
        initialValue,
      })(
        fieldCpt,
      )}
    </Form.Item>
  );
}

function Fields(props: Props) {
  const intlFormatMsg = useFormatMessage();
  const { fileds, extendFields, form, userData, teamData, extendFieldsValue } = props;
  const groupedExtendFields = _.groupBy(extendFields, 'field_cate');
  const save = (e: any) => {
    form.validateFields((error: any, values: any) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      const reqBody = _.map(values, (val, key) => {
        if (_.isNumber(val)) {
          val = _.toString(val);
        } else if (moment.isMoment(val)) {
          val = val.format('YYYY-MM-DD HH:mm:ss');
        } else if (_.isArray(val)) {
          val = _.join(val, ',');
        } else if (_.isUndefined(val)) {
          val = '';
        }
        return {
          'field_ident': key,
          'field_value': val,
        };
      });
      const canRequest = _.some(extendFieldsValue, (n) => {
        const val = _.get(_.find(reqBody, { field_ident: n.field_ident }), 'field_value');
        return val !== n.field_value;
      });
      if (canRequest) {
        request(`${api.host}/${props.hostId}/fields`, {
          method: 'PUT',
          body: JSON.stringify(reqBody),
        }).then(() => {
          message.success(intlFormatMsg({ id: 'msg.modify.success' }));
        });
      }
    });
  };

  return (
    <div>
      <Row gutter={10}>
        <Col span={12}>
          <Card size="small" className="ams-hosts-desc">
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                ID
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.id}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                SN
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.sn}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                {intlFormatMsg({ id: 'hosts.ident' })}
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.ident}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                IP
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.ip}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                {intlFormatMsg({ id: 'hosts.name' })}
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.name}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                {intlFormatMsg({ id: 'hosts.cate' })}
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.cate}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" className="ams-hosts-desc">
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                CPU
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.cpu}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                {intlFormatMsg({ id: 'hosts.mem' })}
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.mem}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                {intlFormatMsg({ id: 'hosts.disk' })}
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.disk}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                {intlFormatMsg({ id: 'hosts.note' })}
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.note}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                {intlFormatMsg({ id: 'hosts.tenant' })}
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.tenant}
              </div>
            </div>
            <div className="ams-hosts-desc-item">
              <div className="ams-hosts-desc-item-title">
                {intlFormatMsg({ id: 'hosts.clock' })}
              </div>
              <div className="ams-hosts-desc-item-content">
                {fileds.clock ? moment.unix(fileds.clock).format() : ''}
              </div>
            </div>
          </Card>
        </Col>
        {
          _.map(groupedExtendFields, (groupValue, groupKey) => {
            return (
              <Col span={24} key={groupKey} style={{ marginTop: 10 }}>
                <Card size="small" title={groupKey} className="ams-hosts-desc">
                  {
                    _.map(groupValue, (filedObj) => {
                      return (
                        <div className="ams-hosts-desc-item" key={filedObj.field_ident}>
                          <div className="ams-hosts-desc-item-title" style={{ marginTop: 10 }}>
                            {filedObj.field_name}
                          </div>
                          <div className="ams-hosts-desc-item-content">
                            <EditCell
                              record={filedObj}
                              extendFieldsValue={props.extendFieldsValue}
                              form={form}
                              save={(e: any) => {
                                save(e);
                              }}
                              userData={userData}
                              teamData={teamData}
                            />
                          </div>
                        </div>
                      );
                    })
                  }
                </Card>
              </Col>
            );
          })
        }
      </Row>
    </div>
  )
}

export default Form.create({})(Fields) as any;
