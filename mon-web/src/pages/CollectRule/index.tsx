import React, {
  useRef, useState, useContext, useEffect,
} from 'react';
import { ColumnProps } from 'antd/lib/table';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Divider,
  Button,
  Popconfirm,
  Form,
  message,
  Select,
  Dropdown,
  Icon,
  Menu,
} from 'antd';
import _ from 'lodash';
import FetchTable from '@pkgs/FetchTable';
import api from '@common/api';
import request from '@pkgs/request';
import moment from 'moment';

interface CollectDataItem {
  collect_type: "mysql";
  comment: string;
  id: number;
  name: string;
  nid: number;
  step: number;
  timeout: number;
}

const Index = (props: any) => {
  const table = useRef<any>();
  const [selectOption, setSelectOption] = useState<any>([]);
  const nstreeContext = useContext(NsTreeContext);
  const [type] = useState<string>('');
  const nid = _.get(nstreeContext, 'data.selectedNode.id');
  const [query, setQuery] = useState<any>({ nid, type });

  const getMonMenus = async () => {
    const monMenus = await request(`${api.collectRules}?category=remote`);
    return monMenus;
  };

  const handleDelBtnClick = (record: any) => {
    request(`${api.handlerRules}`, {
      method: 'DELETE',
      body: JSON.stringify([
        {
          type: record.collect_type,
          ids: [record.id],
        },
      ]),
    }).then(() => {
      table.current.reload();
      message.success('sucess');
    });
  };

  useEffect(() => {
    getMonMenus().then(res => setSelectOption(res));
  }, []);

  useEffect(() => {
    setQuery({ nid, type });
  }, [nid]);

  const columns: ColumnProps<CollectDataItem>[] = [
    {
      title: '采集名称',
      dataIndex: 'name',
    },
    {
      title: '类别',
      dataIndex: 'collect_type',
    },
    {
      title: '探针区域',
      dataIndex: 'region',
    },
    {
      title: '修改时间',
      dataIndex: 'last_updated',
      render: (text) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '采集周期',
      dataIndex: 'step',
      render: (text) => {
        return `${text} 秒`;
      },
    },
    {
      title: '更新人',
      dataIndex: 'updater',
    },
    {
      title: '备注',
      dataIndex: 'comment',
    },
    {
      title: '操作',
      render: (_text, record) => {
        return (
          <span>
            <Link
              to={{
                pathname: '/collect-rules/modify',
                search: `type=${record.collect_type}&nid=${nid}&id=${record.id}`,
              }}
            >
              修改
            </Link>
            <Divider type="vertical" />
            <Popconfirm
              title="删除"
              onConfirm={() => {
                handleDelBtnClick(record);
              }}
            >
              <a>删除</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];
  return (
    <div>
      <Row style={{ marginBottom: 15 }}>
        <Col span={16}>
          <Select
            style={{ width: 200, verticalAlign: 'top' }}
            onChange={(value: string) => setQuery({ ...query, type: value })}
            allowClear
            placeholder="请选择类别搜索"
          >
            {selectOption?.map((item: any) => {
              return <Select.Option key={item} value={item}>{item}</Select.Option>;
            })}
          </Select>
        </Col>
        <Col span={8} className="textAlignRight">
          <Dropdown
            overlay={
              <Menu
                onClick={(e) => {
                  props.history.push({
                    pathname: '/collect-rules/add',
                    search: `type=${e.key}&nid=${nid}`,
                  });
                }}
              >
                {_.map(selectOption, (item) => {
                  return <Menu.Item key={item}>{item}</Menu.Item>;
                })}
              </Menu>
            }
          >
            <Button>
              创建 <Icon type="down" />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <FetchTable
        ref={table}
        url={`${api.getRulesList}`}
        query={query}
        tableProps={{
          columns,
        }}
      />
    </div>
  );
};

export default CreateIncludeNsTree(Form.create()(Index), { visible: true });
