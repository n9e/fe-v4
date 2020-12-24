import React, { useRef, useState } from 'react';
import { Input, Popconfirm, Divider, message, Row, Col, Button } from 'antd';
import FetchTable from '@pkgs/FetchTable';
import WhiteCreate from './WhiteCreate';
import moment from 'moment';
import api from '@common/api';
import request from '@pkgs/request';
import "./style.less";

interface IParams {
    startTime: number,
    endTime: number,
    startIp: string,
    endIp: string
}
const White = () => {
    const fetchTable = useRef<any>();
    const [query, setQuery] = useState({});
    const handlePostBtnClick = () => {
        WhiteCreate({
            type: 'create',
            onOk: (values: IParams, destroy: any) => {
                request(api.white, {
                    method: 'POST',
                    body: JSON.stringify(values),
                }).then(() => {
                    fetchTable.current!.reload();
                    destroy();
                    message.success('success');
                });
            },
        });
    };

    const handleModifyBtnClick = (id: number, record: any) => {
        WhiteCreate({
            type: 'modify',
            initialValues: record,
            onOk: (values: any, destroy: any) => {
                request(`${api.white}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(values),
                }).then(() => {
                    fetchTable.current!.reload();
                    destroy();
                    message.success('success');
                });
            },
        });
    };

    const dele = async (id: string) => {
        try {
            await request(`${api.white}/${id}`, {
                method: "DELETE",
            });
            message.success("success");
            if (fetchTable && fetchTable.current) {
                fetchTable.current.reload();
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="rdb-settings-security-white">
            <Row>
                <Col span={16}>
                    <Input.Search
                        className="rdb-settings-security-white-topInput"
                        style={{ width: 200, verticalAlign: 'top' }}
                        onSearch={(val) => {
                            setQuery({
                                query: val,
                            });
                        }}
                    />
                </Col>
                <Col span={8} className="textAlignRight">
                    <Button onClick={handlePostBtnClick}>
                        添加
                    </Button>
                </Col>
            </Row>
            <FetchTable
                ref={fetchTable}
                url={api.white}
                query={query}
                tableProps={{
                    columns: [
                        {
                            title: '序号',
                            dataIndex: 'id',
                        }, {
                            title: '起始IP',
                            dataIndex: 'startIp',
                        }, {
                            title: '结束IP',
                            dataIndex: 'endIp',
                        }, {
                            title: '开始时间',
                            dataIndex: 'startTime',
                            render: ((text) => moment(text).format('YYYY-MM-DD HH:mm:ss'))
                        }, {
                            title: '结束时间',
                            dataIndex: 'endTime',
                            render: ((text) => moment(text).format('YYYY-MM-DD HH:mm:ss'))
                        }, {
                            title: '操作',
                            width: 100,
                            render: (text: any, record: any) => (
                                <span>
                                    <a onClick={() => handleModifyBtnClick(record.id, record)}>修改</a>
                                    <Divider type="vertical" />
                                    <Popconfirm title='删除' onConfirm={() => { dele(record.id); }}>
                                        <a className="danger-link">删除</a>
                                    </Popconfirm>
                                </span>
                            ),
                        },
                    ],
                }}
            />
        </div>
    )
}

export default White;