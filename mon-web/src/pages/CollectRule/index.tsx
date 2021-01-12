import React, { useRef, useState, useContext } from "react";
import { ColumnProps } from "antd/lib/table";
import { NsTreeContext } from "@pkgs/Layout/Provider";
import CreateIncludeNsTree from "@pkgs/Layout/CreateIncludeNsTree";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Input,
  Divider,
  Button,
  Popconfirm,
  Form,
  message,
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
  const [query, setQuery] = useState<string>();
  const nstreeContext = useContext(NsTreeContext);
  const nid = _.get(nstreeContext, "data.selectedNode.id");
  const collectType = _.get(props, "match.params.type");

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
                pathname: `/collect/modify/${_.lowerCase(
                  record.collect_type
                )}/${record.id}`,
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
          <Input.Search
            placeholder="请输入查询名称"
            style={{ width: 200, verticalAlign: "top" }}
            onSearch={(val) => {
              setQuery(val);
            }}
          />
        </Col>
        <Col span={8} className="textAlignRight">
          <Link
            to={{
              pathname: `/collectRule/add?type=${_.get(props, "match.params.type")}`,
            }}
          >
            <Button>创建</Button>
          </Link>
        </Col>
      </Row>
      <FetchTable
        ref={table}
        url={`${api.getRulesList}?nid=${nid}&type=${collectType}&limit=10&p=1`}
        query={{ query }}
        tableProps={{
          columns,
        }}
      />
    </div>
  );
};

export default CreateIncludeNsTree(Form.create()(Index), { visible: true });
