import React from 'react';
import SolidGauge from '@pkgs/Charts/SolidGauge';
import LiquidFillGauge from '@pkgs/Charts/LiquidFillGauge';
import Pie from '@pkgs/Charts/Pie';

export default function index() {
  return (
    <div>
      <SolidGauge value={30.33} />
      <LiquidFillGauge value={50} />
      <Pie
        fanWidth={30}
        data={[
          {
            name: 'metric_1',
            value: 11231,
          }, {
            name: 'metric_2',
            value: 97870,
          }, {
            name: 'metric_3',
            value: 65831,
          }, {
            name: 'metric_4',
            value: 650878,
          }
        ]}
      />
    </div>
  )
}
