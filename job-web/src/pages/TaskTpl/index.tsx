import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Table, Divider, Popconfirm, Tag, Row, Col, Input, Button, Dropdown, Menu, message } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from '@umijs/hooks';
import useFormatMessage, { getIntl } from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import request from '@pkgs/request';
import api from '@common/api';
import { Tpl } from './interface';
import BindTags from './BindTags';
import UnBindTags from './UnBindTags';
import ModifyNode from './ModifyNode';

function getTableData(options: any, nid: number, query: string) {
  if (nid) {
    return request(`${api.tasktpls}?limit=${options.pageSize}&p=${options.current}&nid=${nid}&query=${query}`).then((res) => {
      return { data: res.list, total: res.total };
    });
  }
  return Promise.resolve({ data: [], total: 0 });
}

const index = (_props: any) => {
  const nstreeContext = useContext(NsTreeContext);
  const nid = _.get(nstreeContext, 'data.selectedNode.id');
  const intl = getIntl();
  const intlFmtMsg = useFormatMessage();
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([] as any[]);
  const { tableProps, refresh } = useAntdTable<any, any>((options) => getTableData(options, nid, query), [nid, query]);

  function handleTagClick(tag: string) {
    if (!_.includes(query, tag)) {
      const newQuery = query ? `${query} ${tag}` : tag;
      setQuery(newQuery);
    }
  }

  function handleDelBtnClick(id: number) {
    request(`${api.tasktpl}/${id}`, {
      method: 'DELETE',
    }).then(() => {
      message.success(intlFmtMsg({ id: 'msg.delete.success' }));
      refresh();
    });
  }

  function handleBatchBindTags () {
    if (!_.isEmpty(selectedIds)) {
      BindTags({
        language: intl.locale,
        selectedIds,
        onOk: () => {
          refresh();
        },
      });
    }
  }

  function handleBatchUnBindTags() {
    if (!_.isEmpty(selectedIds)) {
      let uniqueTags = [] as any[];
      _.each(tableProps.dataSource, (item) => {
        const tags = item.tags ? _.split(item.tags, ',') : [];
        uniqueTags = _.union(uniqueTags, tags);
      });
      UnBindTags({
        language: intl.locale,
        selectedIds,
        uniqueTags,
        onOk: () => {
          refresh();
        },
      });
    }
  }

  function handleBatchModifyNode() {
    if (!_.isEmpty(selectedIds)) {
      ModifyNode({
        language: intl.locale,
        selectedIds,
        onOk: () => {
          refresh();
        },
      });
    }
  }

  const columns: ColumnProps<Tpl>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    }, {
      title: intlFmtMsg({ id: 'tpl.title' }),
      dataIndex: 'title',
      render: (text, record) => {
        return <Link to={{ pathname: `/tpls/${record.id}/detail` }}>{text}</Link>;
      },
    }, {
      title: intlFmtMsg({ id: 'tpl.tags' }),
      dataIndex: 'tags',
      render: (text) => {
        const tags = text ? _.split(text, ',') : [];
        return _.map(tags, item => <Tag color="blue" key={item} onClick={() => handleTagClick(item)}>{item}</Tag>);
      },
    }, {
      title: intlFmtMsg({ id: 'tpl.creator' }),
      dataIndex: 'creator',
      width: 150,
    }, {
      title: intlFmtMsg({ id: 'tpl.last_updated' }),
      dataIndex: 'last_updated',
      width: 160,
      render: (text) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
    }, {
      title: intlFmtMsg({ id: 'table.operations' }),
      width: 220,
      render: (_text, record) => {
        return (
          <span>
            <Link to={{ pathname: `/tasks-add`, search: `tpl=${record.id}` }}>
              {intlFmtMsg({ id: 'task.create' })}
            </Link>
            <Divider type="vertical" />
            <Link to={{ pathname: `/tpls/${record.id}/modify` }}>
              {intlFmtMsg({ id: 'table.modify' })}
            </Link>
            <Divider type="vertical" />
            <Popconfirm title={intlFmtMsg({ id: 'table.delete.sure' })} onConfirm={() => { handleDelBtnClick(record.id); }}>
              <a>{intlFmtMsg({ id: 'table.delete' })}</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];
  return (
    <>
      <Row>
        <Col span={16} className="mb10">
          <Input.Search
            style={{ width: 200 }}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </Col>
        <Col span={8} className="textAlignRight">
          <Link to={{ pathname: `/tpls/add`, search: `nid=${nid}` }}>
            <Button
              icon="plus"
              className="mr10"
            >
              {intlFmtMsg({ id: 'tpl.create' })}
            </Button>
          </Link>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <Button type="link" disabled={selectedIds.length === 0} onClick={() => { handleBatchBindTags(); }}>{intlFmtMsg({ id: 'tpl.tag.bind' })}</Button>
                </Menu.Item>
                <Menu.Item>
                  <Button type="link" disabled={selectedIds.length === 0} onClick={() => { handleBatchUnBindTags(); }}>{intlFmtMsg({ id: 'tpl.tag.unbind' })}</Button>
                </Menu.Item>
                <Menu.Item>
                  <Button type="link" disabled={selectedIds.length === 0} onClick={() => { handleBatchModifyNode(); }}>{intlFmtMsg({ id: 'tpl.node.modify' })}</Button>
                </Menu.Item>
              </Menu>
            }
          >
            <Button icon="down">{intlFmtMsg({ id: 'table.batch.operations' })}</Button>
          </Dropdown>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        {...tableProps}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (selectedRowKeys) => {
            setSelectedIds(selectedRowKeys);
          }
        }}
      />
    </>
  )
}

export default CreateIncludeNsTree(index, { visible: true });
