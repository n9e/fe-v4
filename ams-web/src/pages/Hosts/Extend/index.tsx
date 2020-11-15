import React, { useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  Popconfirm,
  Divider,
  Breadcrumb,
  Row,
  Col,
  Button,
  message,
} from "antd";
import _ from "lodash";
import api from "@pkgs/api";
import request from "@pkgs/request";
import FetchTable from "@pkgs/FetchTable";
import FormModal from "./FormModal";
import { fields } from "./config";

const ExtendList = (props: RouteComponentProps<any>) => {
  const fetchTable = useRef<any>();
  const { ident: cate } = props.match.params;

  const handleCreate = () => {
    FormModal({
      type: "create",
      initialValues: {
        cate,
      },
      onOk: (values: any, destroy: any) => {
        request(`${api.hosts}/fields`, {
          method: "POST",
          body: JSON.stringify(values),
        })
          .then(() => {
            message.success("创建成功");
            if (fetchTable && fetchTable.current) {
              fetchTable.current.reload();
            }
          })
          .finally(() => {
            destroy();
          });
      },
    });
  };

  const handleModify = (record: any) => {
    FormModal({
      type: "modify",
      initialValues: record,
      onOk: (values: any, destroy: any) => {
        delete values.cate;
        delete values.field_ident;
        request(`${api.hosts}/field/${record.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        })
          .then(() => {
            message.success("修改成功");
            if (fetchTable && fetchTable.current) {
              fetchTable.current.reload();
            }
          })
          .finally(() => {
            destroy();
          });
      },
    });
  };

  const handleDelete = (id: number) => {
    request(`${api.hosts}/field/${id}`,{
        method: 'Delete',
    }).then((res) => {
      console.log(res);
      message.success("删除成功");
      if (fetchTable && fetchTable.current) {
        fetchTable.current.reload();
      }
    });
  };

  return (
    <div style={{ padding: 24, backgroundColor: "white" }}>
      <Row style={{ marginBottom: 10 }}>
        <Col span={12}>
          <Breadcrumb>
            <Breadcrumb.Item></Breadcrumb.Item>
            <Breadcrumb.Item>{cate}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Button
            onClick={() => {
              handleCreate();
            }}
          >
            创建
          </Button>
        </Col>
      </Row>
      <FetchTable
        ref={fetchTable}
        backendPagingEnabled={false}
        url={`${api.hosts}/fields`}
        query={{
          cate,
        }}
        tableProps={{
          columns: [
            {
              title: "名称",
              dataIndex: "field_ident",
            },
            {
              title: "标识",
              dataIndex: "field_name",
            },
            {
              title: "分类",
              dataIndex: "field_cate",
            },
            {
              title: "类型",
              dataIndex: "field_type",
              render: (text) => {
                return _.get(_.find(fields, { ident: text }), "name");
              },
            },
            {
              title: "扩展",
              dataIndex: "field_extra",
              render: (text, record) => {
                if (record.field_type === "string") {
                  return text === "input" ? "单行输入框" : "多行输入框";
                }
                if (record.field_type === "number") {
                  return `单位: ${text}`;
                }
                if (record.field_type === "enum") {
                  return text;
                }
                return "none";
              },
            },
            {
              title: "是否必填项",
              dataIndex: "field_required",
              render: (text) => (text === 1 ? "yes" : "no"),
            },
            {
              title: "操作",
              render: (_text, record) => (
                <span>
                  <span>
                    <a
                      onClick={() => {
                        handleModify(record);
                      }}
                    >
                      修改
                    </a>
                  </span>
                  <Divider type="vertical" />
                  <Popconfirm
                    title="删除"
                    onConfirm={() => {
                      handleDelete(record.id);
                    }}
                  >
                    <a className="danger-link">删除</a>
                  </Popconfirm>
                </span>
              ),
            },
          ],
        }}
      />
    </div>
  );
};

export default ExtendList;
