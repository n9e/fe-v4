import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Form, TreeSelect, Input, Select, Col, Row, Icon, Button } from "antd";
import { useDynamicList } from "@umijs/hooks";
import { normalizeTreeData, renderTreeNodes } from "@pkgs/Layout/utils";
import { getTreeData, addList, getSignalList, updateList } from "./services";
import { interval, getQueryVariabe, serviceRule } from "./config";
import "./style.less";
import _ from "lodash";

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 10 },
};
const formItemLayouts = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const Setting = (props: any) => {
  const { getFieldDecorator, getFieldProps } = props.form;
  const [treeData, setTreeData] = useState([]);
  const [sumShow, setSumShow] = useState("count");
  const [upshow, setUpShow] = useState("update");
  const [value, setValue] = useState({});
  const create = getQueryVariabe("id");
  const { list: tags, remove: tagsRemove, push: tagsPush } = useDynamicList();
  const { list: sql, remove: sqlRemove, push: sqlPush } = useDynamicList(
    create ? "" : [1]
  );
  const { list: screening, remove: scrRemove, push: scrPush } = useDynamicList(
    create ? "" : [1]
  );
  const {
    list: change,
    remove: changeRemove,
    push: changePush,
  } = useDynamicList(create ? "" : [1]);

  const fetchTreeData = () => {
    getTreeData().then((res) => {
      const data = normalizeTreeData(res);
      setTreeData(data as any);
    });
  };

  const treeNodes = React.useMemo(() => {
    return renderTreeNodes(treeData, "treeSelect");
  }, [treeData]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.form.validateFields((errors: any, values: any) => {
      if (!errors) {
        const params = values;
        if (params.tags) {
          const tags = {} as any;
          for (let i = 0; i < params.tags.length; i++) {
            tags[params.tags[i].tagName] = params.tags[i].tagValue;
          }
          params.append_tags = tags;
          delete params.tags;
        }
        if (params.screening) {
          const screening = {} as any;
          for (let i = 0; i < params.screening.length; i++) {
            screening[params.screening[i].scrname] =
              params.screening[i].scrvalue;
          }
          params.tags_column = screening;
          delete params.screening;
        }
        if (params.sql) {
          let sql = [] as any;
          for (let i = 0; i < params.sql.length; i++) {
            sql.push(
              `${params.sql[i].ip}:${params.sql[i].port}:${params.sql[i].db_name}:${params.sql[i].table_name}`
            );
          }
          params.db = sql;
          delete params.sql;
        }
        if (create) {
          updateList(params);
        } else {
          addList(params);
        }
      }
    });
  };

  const onChange = (value: string) => {
    setSumShow(value);
  };

  const onChangeup = (value: string) => {
    setUpShow(value);
  };

  useEffect(() => {
    fetchTreeData();
    if (create) {
      getSignalList(create).then((res) => {
        setValue(res);
        for (const key in res.append_tags) {
          tagsPush({ tagName: key, tagValue: res.append_tags[key] });
        }
        for (const key in res.tags_column) {
          scrPush({ scrname: key, scrvalue: res.tags_column[key] });
        }
        for (let i = 0; i < res.column_change.length; i++) {
          changePush({
            name: res.column_change[i].name,
            old: res.column_change[i].old,
            new: res.column_change[i].new,
          });
        }
        for (let i = 0; i < res.db.length; i++) {
          const keys = res.db[i].split(":");
          sqlPush({
            ip: keys[0],
            port: keys[1],
            db_name: keys[2],
            table_name: keys[3],
          });
        }
      });
    }
  }, []);

  return (
    <div>
      <Form {...formItemLayout} onSubmit={handleSubmit}>
        <FormItem label="节点">
          {getFieldDecorator("nid", {
            initialValue: _.get(value, "nid"),
            rules: [{ required: true, message: '请选择节点！' }],
          })(
            <TreeSelect
              placeholder="从rdb服务树接口获取"
              showSearch
              allowClear
              treeDefaultExpandAll
              treeNodeFilterProp="path"
              treeNodeLabelProp="path"
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            >
              {treeNodes}
            </TreeSelect>
          )}
        </FormItem>
        <FormItem label="指标名">
          <Input
            {...getFieldProps("metric", {
              initialValue: _.get(value, "metric"),
              rules: [{ required: true, message: '必填项！' }, serviceRule],
            })}
            placeholder="只能是英文字母、数字、下划线"
          />
        </FormItem>
        <FormItem label="采集周期">
          {getFieldDecorator("interval", {
            initialValue: _.get(value, "interval") || 10,
            rules: [{ required: true, message: '请选择！' }],
          })(
            <Select size="default" style={{ width: 100 }} defaultValue="10">
              {_.map(interval, (item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayouts}
          label="数据库表"
          style={{ marginBottom: -10 }}
        >
          {_.map(sql, (item: any, index) => {
            return (
              <Row key={index} gutter={10}>
                <Col span={4}>
                  <FormItem {...formItemLayouts} label="IP">
                    {getFieldDecorator(`sql[${index}].ip`, {
                      initialValue: item.ip,
                      rules: [{ required: true, message: '必填项！' }],
                    })(<Input placeholder="" style={{ width: "100%" }} />)}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem {...formItemLayouts} label="port">
                    {getFieldDecorator(`sql[${index}].port`, {
                      initialValue: item.port,
                      rules: [{ required: true , message: '必填项！'}],
                    })(<Input placeholder="" style={{ width: "100%" }} />)}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem {...formItemLayouts} label="库名">
                    {getFieldDecorator(`sql[${index}].db_name`, {
                      initialValue: item.db_name,
                      rules: [{ required: true, message: '必填项！' }],
                    })(<Input placeholder="" style={{ width: "100%" }} />)}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem {...formItemLayouts} label="表名">
                    {getFieldDecorator(`sql[${index}].table_name`, {
                      initialValue: item.table_name,
                      rules: [{ required: true , message: '必填项！'}],
                    })(<Input placeholder="" style={{ width: "100%" }} />)}
                  </FormItem>
                </Col>
                <Col span={1}>
                  {sql.length > 1 && (
                    <Icon
                      type="minus-circle-o"
                      onClick={() => {
                        sqlRemove(index);
                      }}
                    />
                  )}
                </Col>
                <Col span={1}>
                  <Icon
                    type="plus-circle-o"
                    onClick={() => {
                      sqlPush({
                        ip: "",
                        port: "",
                        db_name: "",
                        table_name: "",
                      });
                    }}
                  />
                </Col>
              </Row>
            );
          })}
        </FormItem>
        <FormItem label="计算函数">
          {getFieldDecorator("func", {
            initialValue: _.get(value, "func") || "count",
            rules: [{ required: true, message: '必填项！' }],
          })(
            <Select
              size="default"
              style={{ width: 100 }}
              defaultValue="count"
              onChange={onChange}
            >
              <Option key={1} value="count">
                COUNT
              </Option>
              <Option key={2} value="sum">
                SUM
              </Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="变更类型">
          {getFieldDecorator("sqlType", {
            initialValue: _.get(value, "sqlType") || "update",
            rules: [{ required: true, message: '必填项！' }],
          })(
            <Select size="default" style={{ width: 100 }} onChange={onChangeup}>
              <Option key={1} value="update">
                UPDATE
              </Option>
              <Option key={2} value="insert">
                INSERT
              </Option>
              <Option key={3} value="delete">
                DELETE
              </Option>
            </Select>
          )}
        </FormItem>
        {upshow === "update" ? (
          <FormItem
            {...formItemLayouts}
            label="变更字段"
            style={{ marginBottom: -10 }}
          >
            {_.map(change, (item: any, index) => {
              return (
                <Row key={index} gutter={10}>
                  <Col span={7}>
                    <FormItem {...formItemLayouts} label="字段名">
                      {getFieldDecorator(`change[${index}].name`, {
                        initialValue: item.name,
                        rules: [{ required: true, message: '必填项！' }],
                      })(<Input placeholder="" style={{ width: "100%" }} />)}
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem {...formItemLayouts} label="旧值">
                      {getFieldDecorator(`change[${index}].old`, {
                        initialValue: item.old,
                      })(<Input placeholder="" style={{ width: "100%" }} />)}
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem {...formItemLayouts} label="新值">
                      {getFieldDecorator(`change[${index}].new`, {
                        initialValue: item.new,
                      })(<Input placeholder="" style={{ width: "100%" }} />)}
                    </FormItem>
                  </Col>
                  <Col span={1}>
                    {change.length > 1 && (
                      <Icon
                        type="minus-circle-o"
                        onClick={() => {
                          changeRemove(index);
                        }}
                      />
                    )}
                  </Col>
                  <Col span={1}>
                    <Icon
                      type="plus-circle-o"
                      onClick={() => {
                        changePush({ name: "", old: "", new: "" });
                      }}
                    />
                  </Col>
                </Row>
              );
            })}
          </FormItem>
        ) : (
          ""
        )}
        {sumShow === "sum" ? (
          <FormItem label="求和字段">
            {getFieldDecorator("value_column", {
              initialValue: _.get(value, "value_column"),
              rules: [{ required: true, message: '必填项！' }],
            })(<Input />)}
          </FormItem>
        ) : (
          ""
        )}
        <FormItem
          {...formItemLayouts}
          label="筛选条件"
          style={{ marginBottom: -10 }}
        >
          {_.map(screening, (item: any, index) => {
            return (
              <Row key={index} gutter={10}>
                <Col span={7}>
                  <FormItem {...formItemLayouts} label="字段名">
                    {getFieldDecorator(`screening[${index}].scrname`, {
                      initialValue: item.scrname,
                      rules: [{ required: true , message: '必填项！'}],
                    })(<Input placeholder="" style={{ width: "100%" }} />)}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem {...formItemLayouts} label="值">
                    {getFieldDecorator(`screening[${index}].scrvalue`, {
                      initialValue: item.scrvalue,
                    })(<Input placeholder="" style={{ width: "100%" }} />)}
                  </FormItem>
                </Col>
                <Col span={1}>
                  {screening.length > 1 && (
                    <Icon
                      type="minus-circle-o"
                      onClick={() => {
                        scrRemove(index);
                      }}
                    />
                  )}
                </Col>
                <Col span={1}>
                  <Icon
                    type="plus-circle-o"
                    onClick={() => {
                      scrPush({ scrname: "", scrvalue: "" });
                    }}
                  />
                </Col>
              </Row>
            );
          })}
        </FormItem>
        <FormItem label="自定义tags">
          {_.map(tags, (item: any, index) => {
            return (
              <Row key={index} gutter={10}>
                <Col span={9}>
                  <FormItem>
                    {getFieldDecorator(`tags[${index}].tagName`, {
                      initialValue: item.tagName,
                      rules: [{ required: true , message: '必填项！'}],
                    })(
                      <Input
                        addonBefore="tagName"
                        placeholder=""
                        style={{ width: "100%" }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={10}>
                  <FormItem>
                    {getFieldDecorator(`tags[${index}].tagValue`, {
                      initialValue: item.tagValue,
                      rules: [{ required: true , message: '必填项！'}],
                    })(
                      <Input
                        addonBefore="tagValue"
                        placeholder="不是曲线值！匹配结果必须可枚举"
                        style={{ width: "100%" }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={5}>
                  {tags.length > 0 && (
                    <Icon
                      type="minus-circle-o"
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        tagsRemove(index);
                      }}
                    />
                  )}
                </Col>
              </Row>
            );
          })}
          <Button
            onClick={() => {
              tagsPush({ name: "", value: "" });
            }}
          >
            + 新增tag
          </Button>
        </FormItem>
        <FormItem wrapperCol={{ offset: 6 }} style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit">
            添加
          </Button>
          <Button style={{ marginLeft: 8 }}>
            <Link to={{ pathname: "/binlog" }}>取消</Link>
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default Form.create()(Setting);
