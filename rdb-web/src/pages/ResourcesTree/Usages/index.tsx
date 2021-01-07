import React, { useEffect, useState, useRef, useContext } from "react";
import { Table, Divider, Modal, Form, Input, message, Popconfirm } from "antd";
import { getUsages, updateQuota } from "./request";
import { FormComponentProps } from "antd/lib/form";
import { ModalWrapProps } from "@pkgs/ModalControl";
import { NsTreeContext } from "@pkgs/Layout/Provider";
import request from "@pkgs/request";
import api from "@pkgs/api";

import _ from "lodash";

interface usages {
  name: string;
  nameServer: string;
  used: number;
  total: number;
  username: string;
}

const Usages = (props: ModalWrapProps & FormComponentProps) => {
  const table = useRef<any>();
  const nsTreeContext = useContext(NsTreeContext);
  const selectedNode = nsTreeContext.getSelectedNode();
  const { getFieldDecorator } = props.form;
  const [bmsCpu, setBmsCpu] = useState({} as any);
  const [bmsMemorySize, setBmsMemorySize] = useState({} as any);
  const [cmpCPU, setCmpCPU] = useState({} as any);
  const [vmMemorySize, setVmMemorySize] = useState({} as any);
  const [volume, setVolume] = useState({} as any);
  const [visible, setVisible] = useState(false);
  const [record, setRecord] = useState({} as usages);
  const [isRoot, setIsRoot] = useState<number>(0);
  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
  };

  const fetchData = async () => {
    try {
      const dat = await request(api.selftProfile);
      const is_root = _.get(dat, "is_root");
      setIsRoot(is_root);
    } catch (e) {
      console.log(e);
    }
  };

  const renderContent = (value: string, _row: number, index: number) => {
    if (index === 1 || index === 3) {
      return {
        children: value,
        props: {
          colSpan: 0,
        },
      };
    }
    if (index === 0 || index === 2) {
      return {
        children: value,
        props: {
          rowSpan: 2,
        },
      };
    }
    return value;
  };

  const columns = [
    { title: "服务名称", dataIndex: "name", width: 180, render: renderContent },
    { title: "配额项", dataIndex: "username", width: 150 },
    { title: "已用配额", dataIndex: "used", width: 150 },
    { 
      title: "总配额", 
      width: 150, 
      dataIndex: "total", 
      render:(value: any) => value === 999999999999 ? '不限' : value
    },
    {
      title: isRoot ? "操作" : null,
      render: (_value: string, row: any) => {
        return isRoot === 1 ? (
          <span>
            <a
              onClick={() => {
                handleUsages(row);
              }}
            >
              编辑
            </a>
            <Divider type="vertical" />
            <Popconfirm
              title="重置后该配额项的总配额将被设为“不限”，是否重置？"
              onConfirm={() => {
                updateQuota(String(selectedNode?.id), row.nameServer, 999999999999);
                getUsagesList(selectedNode?.id);
              }}
            >
              <a>重置</a>
            </Popconfirm>
          </span>
        ) : null;
      },
    },
  ];
  const handleUsages = (row: usages) => {
    setVisible(true);
    setRecord(row);
  };
  const dataSource = [
    {
      key: "1",
      name: "弹性云服务器",
      username: "CPU数",
      used: cmpCPU.used,
      total: cmpCPU.total,
      nameServer: "cmp.vm.cpu.num",
    },
    {
      key: "2",
      name: "弹性云服务器",
      username: "内存（GB）",
      used: vmMemorySize.used,
      total: vmMemorySize.total,
      nameServer: "cmp.vm.memory.size",
    },

    {
      key: "3",
      name: "裸金属服务器",
      username: "CPU数",
      used: bmsCpu.used,
      total: bmsCpu.total,
      nameServer: "bms.cpuNum",
    },
    {
      key: "4",
      name: "裸金属服务器",
      username: "内存（GB）",
      used: bmsMemorySize.used,
      total: bmsMemorySize.total,
      nameServer: "bms.memorySize",
    },
    {
      key: "5",
      name: "云硬盘",
      username: "容量（GB）",
      used: volume.used,
      total: volume.total,
      nameServer: "cmp.volume.size",
    },
  ];

  const oncancel = () => {
    setVisible(false);
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    props.form.validateFields(async (errors: any, values: any) => {
      if (!errors) {
        try {
          updateQuota(
            String(selectedNode?.id),
            record.nameServer,
            Number(values.total)
          ).then(() => {
            getUsagesList(selectedNode?.id);
          });
        } catch (e) {
          console.log(e);
        }
        setVisible(false);
      }
    });
  };

  const getUsagesList = (tenantId: number) => {
    getUsages(tenantId).then((res) => {
      if (res.usages) {
        res.usages.map(
          (item: { name: string; used: number; total: number }) => {
            switch (item.name) {
              case "bms.cpuNum":
                setBmsCpu(item);
                break;
              case "bms.memorySize":
                setBmsMemorySize(item);
                break;
              case "cmp.vm.cpu.num":
                setCmpCPU(item);
                break;
              case "cmp.vm.memory.size":
                setVmMemorySize(item);
                break;
              case "cmp.volume.size":
                setVolume(item);
                break;
              default:
                return;
            }
          }
        );
      } else if (res.error.code === "SYS.1003") {
        setBmsCpu({ used: 0, total: 0 }),
          setBmsMemorySize({ used: 0, total: 0 }),
          setCmpCPU({ used: 0, total: 0 }),
          setVmMemorySize({ used: 0, total: 0 }),
          setVolume({ used: 0, total: 0 });
      }
    });
  };
  useEffect(() => {
    fetchData();
    getUsagesList(selectedNode?.id);
  }, []);

  useEffect(() => {
    getUsagesList(selectedNode?.id);
  }, [selectedNode?.id]);
  return (
    <div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        ref={table}
      />
      <Modal
        visible={visible}
        onCancel={oncancel}
        title="编辑配额"
        onOk={onSubmit}
        destroyOnClose={true}
      >
        <Form {...formItemLayout} onSubmit={onSubmit}>
          <Form.Item label="总配额">
            {getFieldDecorator("total", {
              rules: [{ required: true, message: "必填项！" }],
            })(<Input placeholder="总配额"></Input>)}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Form.create()(Usages);
