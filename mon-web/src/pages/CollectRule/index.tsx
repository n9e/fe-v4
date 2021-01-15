import React, { useRef, useState, useContext, useEffect } from "react";
import { ColumnProps } from "antd/lib/table";
import { NsTreeContext } from "@pkgs/Layout/Provider";
import CreateIncludeNsTree from "@pkgs/Layout/CreateIncludeNsTree";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Divider,
  Button,
  Popconfirm,
  Form,
  message,
  Select,
} from "antd";
import _ from "lodash";
import FetchTable from "@pkgs/FetchTable";
import api from "@common/api";
import request from "@pkgs/request";
import moment from "moment";

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
  const [selectOption, setSelectOption] = useState([]) as any;
  const nstreeContext = useContext(NsTreeContext);
  const [type] = useState<string>("");
  const nid = _.get(nstreeContext, "data.selectedNode.id");
  const [query, setQuery] = useState({nid: nid, type: type}) as any;

  const getMonMenus = async () => {
    return await request(`${api.collectRules}?category=remote`);
  };

  const handleDelBtnClick = (record: any) => {
    request(`${api.handlerRules}`, {
      method: "DELETE",
      body: JSON.stringify([
        {
          type: record.collect_type,
          ids: [record.id],
        },
      ]),
    }).then(() => {
      table.current.reload();
      message.success("sucess");
    });
  };

  useEffect(() => {
    getMonMenus().then((res) => setSelectOption(res));
  }, []);
  const columns: ColumnProps<CollectDataItem>[] = [
    {
      title: "显示名",
      dataIndex: "name",
    },
    {
      title: "类别",
      dataIndex: "collect_type",
    },
    {
      title: "创建者",
      dataIndex: "creator",
    },
    {
      title: "区域名称",
      dataIndex: "region",
    },
    {
      title: "修改时间",
      dataIndex: "last_updated",
      render: (text) => {
        return moment(text).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "操作",
      render: (text, record) => {
        return (
          <span>
            <Link
              to={{
                pathname: `/collectRule/add`,
                search: `type=${record.collect_type}&nType=modify&nid=${nid}&id=${record.id}`,
              }}
            >
              修改
            </Link>
            <Divider type="vertical" />
            <Popconfirm
              title={"删除"}
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
            style={{ width: 200, verticalAlign: "top" }}
            onChange={(value: string) => setQuery({...query, type:value})}
            allowClear
            placeholder='请选择基础组件!'
          >
            {selectOption?.map((item: any) => {
              return <Select.Option value={item}>{item}</Select.Option>;
            })}
          </Select>
        </Col>
        <Col span={8} className="textAlignRight">
          <Link
            to={{
              pathname: `/collectRule/add`,
              search: `type=${query.type}&nType=create&nid=${nid}`,
            }}
          >
            <Button disabled={!query.type}>创建</Button>
          </Link>
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
