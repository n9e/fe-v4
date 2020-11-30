import React, { useState } from 'react';
import { Row, Col, Input, Button, Popover, Tooltip, Alert, Form, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { PaginatedParams } from '@umijs/hooks/lib/useFormTable'
import { useFormTable } from '@umijs/hooks'
import clipboard from '@pkgs/clipboard';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { defaultPageSizeOptions } from '@pkgs/config'
import { systemName } from '@common/config';
import { UserProfile } from '@interface';

interface Result {
  total: number;
  list: UserProfile[];
}

interface Props {
  form: WrappedFormUtils;
}

const ButtonGroup = Button.Group;

const getTableData = ({ current, pageSize }: PaginatedParams[0], formData: Object): Promise<Result> => {
  let query = `p=${current}&limit=${pageSize}`;
  Object.entries(formData).forEach(([key, value]) => {
    if (value) {
      query += `&${key}=${value}`
    }
  });
  return request(`${api.user}s?${query}`).then((res) => {
    return res;
  });
};

function UserList(props: Props & WrappedComponentProps) {
  const [inviteTooltipVisible, setInviteTooltipVisible] = useState(false);
  const [invitePopoverVisible, setInvitePopoverVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copySucceeded, setCopySucceeded] = useState(false);
  const { tableProps, search } = useFormTable(getTableData, {
    defaultPageSize: 10,
    form: props.form,
  });
  const handleInviteBtnClick = () => {
    request(`${api.users}/invite`).then((res) => {
      const { origin } = window.location;
      const inviteLink = `${origin}/register?token=${res}`;
      const copySucceeded = clipboard(inviteLink);

      setCopySucceeded(copySucceeded);
      setInviteLink(inviteLink);
      setInviteTooltipVisible(false);
      setInvitePopoverVisible(true);
    });
  };
  const columns: ColumnProps<UserProfile>[] = [
    {
      title: <FormattedMessage id="user.username" />,
      dataIndex: 'username',
    }, {
      title: <FormattedMessage id="user.dispname" />,
      dataIndex: 'dispname',
    }, {
      title: <FormattedMessage id="user.email" />,
      dataIndex: 'email',
    }, {
      title: <FormattedMessage id="user.phone" />,
      dataIndex: 'phone',
    }, {
      title: 'IM',
      dataIndex: 'im',
    }, {
      title: <FormattedMessage id="user.leader" />,
      dataIndex: 'leader_name',
    }, {
      title: <FormattedMessage id="user.isroot" />,
      dataIndex: 'is_root',
      render: (text) => {
        if (text) {
          return <FormattedMessage id="yes" />;
        }
        return <FormattedMessage id="no" />;
      },
    },
  ];
  return (
    <div>
      <Row>
        <Col span={8} className="mb10">
          <Form>
            {props.form.getFieldDecorator('query')(
              <Input.Search placeholder="请输入用户名" style={{ width: 240 }} onSearch={search.submit} />,
            )}
          </Form>
        </Col>
        <Col span={16} className="textAlignRight">
          <ButtonGroup>
            <Popover
              trigger="click"
              placement="topRight"
              visible={invitePopoverVisible}
              onVisibleChange={(visible) => {
                if (!visible) {
                  setInvitePopoverVisible(visible);
                }
              }}
              content={
                copySucceeded ?
                  <Alert message={<FormattedMessage id="copy.success" />} type="success" /> :
                  <Alert message={
                    <div>
                      <p><FormattedMessage id="copy.faile" /></p>
                      <span>{inviteLink}</span>
                    </div>
                  } type="warning" />
              }
            >
              <Tooltip
                placement="topRight"
                visible={inviteTooltipVisible}
                onVisibleChange={(visible) => { setInviteTooltipVisible(visible); }}
                title={<FormattedMessage id="user.invite.tips" />}
              >
                <Button className="ml10" onClick={handleInviteBtnClick}><FormattedMessage id="user.invite" /></Button>
              </Tooltip>
            </Popover>
          </ButtonGroup>
        </Col>
      </Row>
      <Table
        columns={columns}
        rowKey="id"
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total) => {
            if (props.intl.locale === 'zh') {
              return `共 ${total} 条数据`;
            }
            if (props.intl.locale === 'en') {
              return `Total ${total} items`;
            }
            return null;
          },
          pageSizeOptions: defaultPageSizeOptions,
        }}
      />
    </div>
  );
}

export default Form.create()(injectIntl(UserList));
