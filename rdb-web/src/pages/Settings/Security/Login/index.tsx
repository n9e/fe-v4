import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Row, Col, Select, Checkbox, message } from 'antd';
import { auth, authPost } from './request';

interface IPwd {
    maxNumErr: string,
    maxSessionNumber: string,
    maxConnIdelTime: string,
    lockTime: string,
    pwdMinLenght: string,
    pwdHistorySize: string,
    pwdExpiresIn: string,
    pwdIncludeUpper: string,
    pwdIncludeLower: string,
    pwdIncludeNumber: string,
    pwdIncludeSpecChar: string,
    find: string,
}

const { Item } = Form;
const { Option } = Select;
const Login = (props: any) => {
    const [data, setData] = useState({} as IPwd);
    const [change, setChange] = useState({ pwd: false, security: false });
    const { getFieldDecorator } = props.form;
    const formItemLayout = {
        labelCol: {
            sm: { span: 8 },
        },
        wrapperCol: {
            sm: { span: 14 },
        },
    };
    const options = [
        { label: '大写字母', value: 'pwdIncludeUpper' },
        { label: '小写字母', value: 'pwdIncludeLower' },
        { label: '数字', value: 'pwdIncludeNumber' },
        { label: '下划线', value: 'Orange' },
        { label: '特殊字符', value: 'pwdIncludeSpecChar:string' },
    ];

    const handlerSumbit = (type: string) => {
        props.form!.validateFields((err: string, values: IPwd) => {
            if (!err) {
                authPost(values).then(() => {
                    message.success('sucess');
                    type === 'security' ? setChange({ ...change, security: false }) :
                        setChange({ ...change, pwd: false })
                        ;
                })
            }
        });
    }

    const onChange = () => {
        setChange({ ...change, security: true });
    }

    const onChangePwd = () => {
        setChange({ ...change, pwd: true });
    }
    useEffect(() => {
        auth().then((res) => { setData(res) });
    }, [])
    return (
        <div>
            <Card
                bordered={false}
                title='账号设置'
                extra={<a
                    style={{ display: change.security ? 'none' : 'block' }}
                    onClick={onChange}>修改</a>}
            >
                <Form {...formItemLayout}>
                    <Row>
                        <Col span={12}>
                            <Item label="连续错误次数">
                                {getFieldDecorator("maxNumberErr", {
                                    initialValue: data.maxNumErr,
                                })(change.security ? <Input placeholder="请输入允许连续错误次数" /> : <p>{data.maxNumErr}</p>)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="锁定时间(不小于20分钟)">
                                {getFieldDecorator("lockTime", {
                                    initialValue: data.lockTime,
                                })(change.security ? <Input placeholder="请输入锁定时间" /> : <p>{data.lockTime}</p>)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item label="最大并发数">
                                {getFieldDecorator("maxSessionNumber", {
                                    initialValue: data.maxSessionNumber,
                                })(change.security ? <Input placeholder="请输入最大并发数" /> : <p>{data.maxSessionNumber}</p>)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="会话超过时间(1-30分钟)">
                                {getFieldDecorator("maxConnIdelTime", {
                                    initialValue: data.maxConnIdelTime,
                                })(change.security ? <Input placeholder="请输入会话超过时间" /> : <p>{data.maxConnIdelTime}</p>)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item label="访问机制">
                                {getFieldDecorator("find", {
                                    initialValue: '0',
                                })(change.security ? <Select placeholder="请选择访问机制" defaultValue='0'>
                                    <Option value='0'>黑名单</Option>
                                    <Option value='1'>白名单</Option>
                                </Select> : data.find === '0' ? <p>白名单</p> : <p>黑名单</p>)}
                            </Item>
                        </Col>
                        <Col span={2} offset={10}>
                            <Item>
                                <Button
                                    type="primary"
                                    onClick={() => handlerSumbit('security')}
                                    style={{ display: change.security ? 'block' : 'none' }}
                                >保存</Button>
                            </Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <Card
                bordered={false}
                title='密码设置'
                extra={<a
                    style={{ display: change.pwd ? 'none' : 'block' }}
                    onClick={onChangePwd}>修改</a>}
            >
                <Form {...formItemLayout}>
                    <Row>
                        <Col span={12}>
                            <Item label="最小长度(位)">
                                {getFieldDecorator("pwdMinLenght", {
                                    initialValue: data.pwdMinLenght,
                                })(change.pwd ? <Input placeholder="请输入密码最小长度" /> : <p>{data.pwdMinLenght}</p>)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="密码复杂度">
                                {getFieldDecorator("pwdIncludeUpper", {
                                    initialValue: ['pwdIncludeNumber']
                                })(<Checkbox.Group options={options} />
                                )}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item label="有效期(月)">
                                {getFieldDecorator("pwdExpiresIn", {
                                    initialValue: data.pwdExpiresIn,
                                })(change.pwd ? <Input placeholder="请输入密码有效期" /> : <p>{data.pwdExpiresIn}</p>)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="历史重复次数(次)">
                                {getFieldDecorator("pwdHistorySize", {
                                    initialValue: data.pwdHistorySize,
                                })(change.pwd ? <Input placeholder="请输入历史重复次数" /> : <p>{data.pwdHistorySize}</p>)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={2} offset={22}>
                            <Item>
                                <Button
                                    type="primary"
                                    onClick={() => handlerSumbit('pwd')}
                                    style={{ display: change.pwd ? 'block' : 'none' }}
                                >保存</Button>
                            </Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    )
}

export default Form.create()(Login);
