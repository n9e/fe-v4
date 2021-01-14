import React, { useEffect, useState } from "react";
import { Form, Input, Button, Radio, message, TreeSelect, Select } from "antd";
import queryString from "query-string";
import request from "@pkgs/request";
import api from "@common/api";
import { nameRule, interval } from "./config";
import { normalizeTreeData } from "@pkgs/Layout/utils";
import { renderTreeNodes } from "@pkgs/Layout/utils";
import { Link } from "react-router-dom";
import BaseList from "./BaseList";
import _ from "lodash";
import { TreeNode } from "@pkgs/interface";
import BaseGroupList from "./BaseGroupList";

interface IParams {
  type: string;
  nid: number;
}

interface IProps {
  type: "create" | "modify";
  initialValues?: any;
  onOk: (values: IParams, destroy?: () => void) => void;
}

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
};

const formLayout = {
  width: 700,
  marginTop: 30,
  marginLeft: "auto",
  marginRight: "auto",
};

const CreateForm = (props: any | IProps) => {
  const { getFieldDecorator, validateFields, getFieldProps } = props.form;
  const query = queryString.parse(location.search);
  const [fields, setFields] = useState([]) as any;
  const [value, setValue] = useState({}) as any;
  const [treeData, setTreeData] = useState([] as TreeNode[]);
  const [regionData, setRegionData] = useState([] as string[]);

  const switchItem = (item: any) => {
    const type = item.type;
    switch (type) {
      case "string":
        return <Input placeholder={item.description} />;
        break;
      case "folat":
        return <Input />;
        break;
      case "boolean":
        return (
          <Radio.Group>
            <Radio value={true}>true</Radio>
            <Radio value={false}>false</Radio>
          </Radio.Group>
        );
        break;
      case "array":
        return item.name === "commands" ? (
          <BaseGroupList
            tempData={fields?.definitions["redis.RedisCommand"]}
            initialValues={value}
            form={props.form}
            getFieldDecorator={getFieldDecorator} 
          />
        ) : (
          <BaseList data={item} getFieldDecorator={getFieldDecorator} />
        );
        break;
      default:
        return <Input />;
        break;
    }
  };

  const fetchData = async () => {
    try {
      const dat = await request(
        `${api.createRules}?id=${query.id}&type=${query.type}`
      );
      setValue(dat);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchRegionData = () => {
    return request(`${api.regions}`);
  };

  const handlerPOST = (values: any) => {
    request(api.createRules, {
      method: "POST",
      body: JSON.stringify([
        {
          type: query.type,
          data: {
            creator: value.creator,
            created: value.created,
            id: values.id,
            nid: Number(query.nid),
            region: values.region,
            service: values.service,
            step: values.step,
            name: values.name,
            collect_type: query.type,
            data: values,
          },
        },
      ]),
    })
      .then(() => {
        message.success("保存成功！");
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handlerPUT = (values: any) => {
    request(api.createRules, {
      method: "PUT",
      body: JSON.stringify({
        type: query.type,
        data: {
          id: value?.id,
          name: values?.name,
          region: values?.region,
          nid: Number(query.nid),
          collect_type: query.type,
          data: values,
        },
      }),
    })
      .then(() => {
        message.success("修改成功！");
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    validateFields((err: any, values: any) => {
      if (!err) {
        if (query.nType === "create") {
          handlerPOST(values);
        } else {
          handlerPUT(values);
        }
      }
    });
  };
  const getTemplate = () => {
    return request(`${api.collectRules}/${query.type}/template`).then((res) => {
      setFields(res);
    });
  };
  const fetchTreeData = () => {
    return request(api.tree).then((res) => {
      const treeData = normalizeTreeData(res);
      return treeData;
    });
  };

  useEffect(() => {
    getTemplate();
    fetchTreeData().then((res) => {
      setTreeData(res);
    });
    fetchRegionData().then((res) => {
      setRegionData(res);
    });
    query.nType === "create" ? null : fetchData();
  }, []);

  return (
    <Form onSubmit={handleSubmit} style={formLayout}>
      <FormItem {...formItemLayout} label="归属节点" required>
        {getFieldDecorator("nid", {
          initialValue: query.nid,
          rules: [{ required: true, message: "请选择节点！" }],
        })(
          <TreeSelect
            style={{ width: 500 }}
            showSearch
            allowClear
            treeDefaultExpandAll
            treeNodeFilterProp="path"
            treeNodeLabelProp="path"
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          >
            {renderTreeNodes(treeData, "treeSelect")}
          </TreeSelect>
        )}
      </FormItem>
      <FormItem {...formItemLayout} label="采集名称">
        <Input
          {...getFieldProps("name", {
            initialValue: query.nType === "modify" ? value?.name : "",
            rules: [{ required: true, message: "必填项！" }, nameRule],
          })}
          size="default"
          style={{ width: 500 }}
          placeholder="不能为空！"
        />
      </FormItem>
      <FormItem {...formItemLayout} label="区域名称">
        <Select
          size="default"
          {...getFieldProps("region", {
            initialValue: value?.region || regionData[0],
            rules: [{ required: true, message: "请选择！" }],
          })}
        >
          {_.map(regionData, (item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      </FormItem>
      <FormItem {...formItemLayout} label="采集周期">
        <Select
          size="default"
          style={{ width: 100 }}
          {...getFieldProps("step", {
            initialValue: value?.step,
            rules: [{ required: true, message: "请选择！" }],
          })}
        >
          {_.map(interval, (item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>{" "}
        秒
      </FormItem>
      {fields?.fields?.map((item: any, _index: any) => {
        return (
          <>
            <FormItem key={item.name} {...formItemLayout} label={item.label}>
              {getFieldDecorator(item.name, {
                initialValue:
                  query.nType === "modify" ? value?.data?.[item.name] : "",
                rules: [{ required: item?.required, message: "必填项！" }],
              })(switchItem(item))}
            </FormItem>
          </>
        );
      })}
      <FormItem {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
        <Button style={{ marginLeft: 8 }}>
          <Link to={{ pathname: "/collectRule/subgroup" }}>返回</Link>
        </Button>
      </FormItem>
    </Form>
  );
};

export default Form.create()(CreateForm);
