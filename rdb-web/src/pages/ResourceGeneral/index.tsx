import React, { useEffect, useState } from 'react';
import { UsageStat, Tenant, ResuorceTrend, parseJSON } from './config';
import { Select, Progress, Empty } from 'antd';
import UsageRender from './UsageStat';
import request from '@pkgs/request';
import api from '@common/api';
import moment from 'moment';
import * as echarts from 'echarts'
import './style.less';
import _ from 'lodash';

interface ICate {
  cate: string,
  ident: string,
  api: string
}

const { Option } = Select;
const index = () => {
  const [tenantValue, setTenantValue] = useState({}) as any;
  const [projectValue, setProjectValue] = useState({}) as any;
  const [resource_cate, setResource_cate] = useState([]) as any;
  const [resource_cate_p, setResource_cate_p] = useState([]) as any;
  const [quota, setQuota] = useState([]) as any;
  const [cate, setCate] = useState({ cate: 'month', ident: 'instances', api: '/zstack/v1/cmp/dashboard/manager/resource/used' } as ICate);
  const [lineValue, setLineValue] = useState({} as any);
  const [usageStat, setUsageStat] = useState({ ident: 'zstack', api: '/zstack/v1/cmp/dashboard/manager/capacity/used' } as any);
  const [projs, setProjs] = useState([] as any);
  const [loading, setLoading] = useState(true);
  const [tab, setTabs] = useState(0);
  const tenant = parseJSON(localStorage.getItem("icee-global-tenant") as string)
  const [tenantId, setTenantId] = useState(tenant?.id);

  const Quota = [
    {
      name: '弹性云服务器', children: [
        { title: 'CPU用量', used: quota?.cpuUsed, total: quota?.cpuTotal },
        { title: '内存用量', used: quota?.memUsed, total: quota?.memTotal }]
    },
    {
      name: '裸金属服务器', children: [
        { title: 'CPU用量', used: quota?.baremetalCpuUsed, total: quota?.baremetalCpuTotal },
        { title: '内存用量', used: quota?.baremetalMemUsed, total: quota?.baremetalMemUsed }]
    },
    { name: '云硬盘', children: [{ title: '容量用量', used: quota?.volumeUsed, total: quota?.volumeTotal }] }
  ]

  const loadingCss = () => {
    let timer = setTimeout(() => setLoading(false), 200)
    loading ? null : clearTimeout(timer);
  }
  useEffect(() => {
    request(api.projs).then((res) => setProjs(res))
  }, [])
  useEffect(() => loadingCss(), [usageStat])
  useEffect(() => {
    request(`${api.quota}?tenantId=${tenantId}`).then((res) => setQuota(res));
  }, [tenantId])
  useEffect(() => {
    request(cate.api.includes('?') ? `${cate.api}&granule=${cate.cate}` : `${cate.api}?granule=${cate.cate}`).then((res) => {
      if (!!res.length) {
        const result = res.reduce((prev: any, cur: any) => {
          cate.cate === 'month' ? prev.v.push(moment.unix(cur.timestamp).format('YYYY-MM-DD')) : prev.v.push(moment.unix(cur.timestamp).format('YYYY-MM'))
          prev.h.push(cur.value)
          return prev
        }, { v: [], h: [] })
        setLineValue({ [cate.ident]: result });
      } else {
        const keys = Object.keys(res)
        const result = keys.reduce((cur: any, item: string) => {
          cur[item] = res[item].reduce((a: any, b: any) => {
            cate.cate === 'month' ? a.v.push(moment.unix(Number(b.date)).format('YYYY-MM-DD')) : a.v.push(moment.unix(Number(b.date)).format('YYYY-MM'))
            a.h.push(b.total)
            return a
          }, { v: [], h: [] })
          return cur
        }, {})
        setLineValue(result);
      }
    })
  }, [cate])
  useEffect(() => {
    const myChart = echarts.init(document.getElementById("line")!);
    var option = {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: lineValue?.[cate.ident]?.v

      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: lineValue?.[cate.ident]?.h,
        type: 'line',
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(214,226,255,1)' },
              { offset: 0.34, color: 'rgba(214,226,255,0.5)' },
              { offset: 1, color: 'rgba(214,226,255, 0)' },
            ]),
          }
        },
        itemStyle: {
          normal: {
            color: '#3370FF',
            lineStyle: {
              color: '#3370FF'
            }
          }
        },
      }],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
    };
    myChart.setOption(option);
  }, [cate, lineValue]);
  useEffect(() => {
    request(`${api.rdbResources}/tenant-rank?top=10&resource_cate=${resource_cate}`).then((res) => {
      let total = 0;
      res?.map((item: any) => {
        total = item.count + total;
      })
      setTenantValue({ data: res, total: total })
    })
  }, [resource_cate])
  useEffect(() => {
    request(`${api.rdbResources}/project-rank?top=10&resource_cate=${resource_cate_p}`).then((res) => {
      let total = 0;
      res.map((item: any) => {
        total = item.count + total;
      })
      setProjectValue({ data: res, total: total })
    })
  }, [resource_cate_p])

  return <>
    <div className='rdb-resource '>
      <div className='rdb-resource-dosage'>
        <div className='rdb-resource-dosage-top'>
          <p className='rdb-resource-dosage-top-title'>
            <span className='rdb-resource-dosage-top-title-line'></span>
            <span>用量统计</span>
          </p>
          <ul className='rdb-resource-dosage-top-tabBar'>
            {UsageStat.map((item: { ident: string, name: string, api: string, index: number }, idx: number) => (
              <li
                key={idx}
                className={tab === idx ? 'rdb-resource-dosage-top-tabBar-list-active' : 'rdb-resource-dosage-top-tabBar-list'}
                onClick={() => {
                  setUsageStat({ ...usageStat, api: item.api });
                  setLoading(true)
                  setTabs(idx)
                }}
              >{item.name}</li>
            ))}
          </ul>
        </div>
        <UsageRender usageStat={usageStat} loading={loading} />
      </div>
      <div className='rdb-resource-usage'>
        <div className='rdb-resource-dosage-top'>
          <p className='rdb-resource-dosage-top-title'>
            <span className='rdb-resource-dosage-top-title-line'></span>
            <span>租户配额统计</span>
          </p>
          <Select
            // value={tenantId?.id}
            style={{ width: 150 }}
            allowClear placeholder="请选择!"
            onChange={(value: string) => setTenantId(value)}
          >
            {projs.map((item: any) => (
              <Option value={item.id} key={item.id}>{item.name}</Option>
            ))}
          </Select>
        </div>
        <div className='rdb-resource-usage-list'>
          {Quota.map((item: { name: string, children: any }, index: number) => (
            <div className='rdb-resource-usage-list-div' key={index}>
              <p>{item.name}</p>
              <div className='rdb-resource-usage-list-div-progress'>
                {item.children.map((item: any, index: number) => {
                  const data = Number((item.used * 100 / item.total).toFixed(2));
                  return <div key={index}>
                    <Progress
                      strokeColor="#3370FF"
                      type="circle"
                      percent={data}
                      className='rdb-resource-usage-list-div-pro'
                      format={percent => `${percent}%`}
                    />
                    <p style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>{item.title}</p>
                    <p>已使用：{item.used}核</p>
                    <p>总量：{item.total}核</p>
                  </div>
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='rdb-resource-tenant'>
        <div className='rdb-resource-dosage-top'>
          <p className='rdb-resource-dosage-top-title'>
            <span className='rdb-resource-dosage-top-title-line'></span>
            <span>租户资源使用量TOP10</span>
          </p>
          <Select
            defaultValue="virtual"
            style={{ width: 150 }}
            allowClear
            placeholder="请选择!"
            onChange={(value: string) => setResource_cate(value)}
          >
            {Tenant.map((item: { name: string, value: string }, index: number) => (
              <Option value={item.value} key={index}>{item.name}</Option>
            ))}
          </Select>
        </div>
        <div className='rdb-resource-tenant-list'>
          {
            tenantValue?.data ? _.map(tenantValue?.data, (item: { name: string, count: number }, index: number) => (
              <div key={index} className='rdb-resource-tenant-list-content'>
                <div className='rdb-resource-tenant-list-title'>
                  <p>{item.name}</p>
                  <p>{item.count}台</p>
                </div>
                <Progress
                  strokeColor="#3370FF"
                  strokeLinecap="square"
                  percent={item.count * 100 / tenantValue?.total}
                  showInfo={false}
                />
              </div>
            )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: '100%' }} />}
        </div>
      </div>
      <div className='rdb-resource-tenant'>
        <div className='rdb-resource-dosage-top'>
          <p className='rdb-resource-dosage-top-title'>
            <span className='rdb-resource-dosage-top-title-line'></span>
            <span>项目资源使用量TOP10</span>
          </p>
          <Select
            defaultValue="弹性云服务器"
            style={{ width: 150 }}
            allowClear
            placeholder="请选择!"
            onChange={(value: string) => setResource_cate_p(value)}
          >
            {Tenant.map((item: { name: string, value: string }, index: number) => (
              <Option value={item.value} key={index}>{item.name}</Option>
            ))}
          </Select>
        </div>
        <div className='rdb-resource-tenant-list'>
          {projectValue?.data ? _.map(projectValue?.data, (item: { name: string, count: number }, index: number) => (
            <div key={index} className='rdb-resource-tenant-list-content'>
              <div className='rdb-resource-tenant-list-title'>
                <p>{item.name}</p>
                <p>{item.count}台</p>
              </div>
              <Progress
                strokeColor="#3370FF"
                strokeLinecap="square"
                percent={item.count * 100 / projectValue?.total}
                showInfo={false}
              />
            </div>
          )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: '100%' }} />
          }
        </div>
      </div>
      <div className='rdb-resource-tenant'>
        <div className='rdb-resource-dosage-top'>
          <p className='rdb-resource-dosage-top-title'>
            <span className='rdb-resource-dosage-top-title-line'></span>
            <span>申请资源趋势图</span>
          </p>
          <div>
            <Select
              value={cate?.ident + cate?.api}
              style={{ width: 150 }}
              allowClear
              placeholder="请选择!"
              onChange={(value: string) => {
                const req = value.indexOf('/');
                const ident = value.substring(0, req);
                const api = value.substring(req);
                setCate({ ...cate, api: api, ident: ident })
              }}
            >
              {ResuorceTrend?.map((item: { name: string, api: string, ident: string }, index: number) => (
                <Option value={item.ident + item.api} key={index}>{item.name}</Option>
              ))}
            </Select>
            <Select
              defaultValue="month"
              style={{ width: 150, marginLeft: 20 }}
              allowClear
              placeholder="请选择日期!"
              onChange={(value: string) => setCate({ ...cate, cate: value })}
            >
              <Option value='month'>最近一个月</Option>
              <Option value='year'>最近一年</Option>
            </Select>
          </div>
        </div>
        <div id="line" style={{ width: "100%", height: 400 }}></div>
      </div>
    </div>
  </>
}

export default index;
