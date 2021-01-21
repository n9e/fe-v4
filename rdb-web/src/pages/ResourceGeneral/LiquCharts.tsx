import React from 'react';
import * as echarts from 'echarts'
import 'echarts-liquidfill';
import ReactCharts from 'echarts-for-react'
import './style.less';

interface ILiquCharts {
    color: [string, string],
    data: number,
}
const UsageStat = (props: ILiquCharts) => {

    const liquidoption = {
        series: [{
            type: 'liquidFill',
            data: [props.data],
            color: [new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                    offset: 0,
                    color: props.color[0]
                },
                {
                    offset: 1,
                    color: props.color[1]
                }
            ])],
            amplitude: '3%',
            radius: '80%',
            outline: {
                borderDistance: 2,
                itemStyle: {
                    borderWidth: 3,
                    borderColor: '#F5F7FA',
                    shadowBlur: 0,
                    shadowColor: 'rgba(0, 0, 0, 0)'
                },
            },
            itemStyle: {
                opacity: 0.95,
                shadowBlur: 0,
                shadowColor: 'rgba(0, 0, 0, 0)'
            },
            backgroundStyle: {
                color: '#F5F7FA',
                borderWidth: 2,
                borderColor: '#F5F7FA',
                shadowBlur: 0,
                shadowColor: 'rgba(0, 0, 0, 0)'
            },
            label: {
                normal: {
                    color: '#333',
                    fontSize: 28
                }
            },
        }]
    }

    return (<>
        <ReactCharts
            option={liquidoption}
            style={{ height: '170px', width: '200px' }} />
    </>)
}

export default UsageStat;
