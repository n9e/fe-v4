import React from 'react';
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
      data: [{
        value: props.data,
        itemStyle: {
          normal: {
            color: eval("if(props.data<0.5){'#16c45b'}else if(props.data<0.7){'#3370ff'}else if(props.data<0.9){'#ffab0a'}else{'#fb4e57'}")
          }
        }
      }],
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
          fontSize: 28,
          formatter: function (params: any) {
            if(!params.value && params.value !== 0) {
              return '--%'
            }else{
              return `${(params.value * 100).toFixed(0)} %`;
            }
          },
        }
      },
    }]
  }

  return (<>
    <ReactCharts
      option={liquidoption}
      style={{ height: '170px', width: '100%' }} />
  </>)
}

export default UsageStat;
