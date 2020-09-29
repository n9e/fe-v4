import React, { useLayoutEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import _ from 'lodash';
import * as singleSpa from 'single-spa';
import Parcel from 'single-spa-react/parcel';
import { fetchManifest, getPathBySuffix, createStylesheetLink } from '@pkgs/utils';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';

const bigScreenConf = {
  development: {
    publicPath: 'http://localhost:8001/monitor-dashboard/',
    index: 'http://localhost:8001/monitor-dashboard/index.html',
  },
  production: {
    publicPath: '/monitor-dashboard/',
    index: '/monitor-dashboard/index.html',
  },
};

function Detail(props: any) {
  const id = _.get(props, 'match.params.id');
  const [name, setName] = useState('');

  useLayoutEffect(() => {
    props.mount();
    if (id) {
      fetch(`/api/v2/dashboard/retrieve?id=${id}`).then((res) => {
        return res.json();
      }).then((res: any) => {
        const { data } = res;
        setName(data.name);
      });
    }
    return () => {
      props.unmount();
    };
  }, []);

  return (
    <div>
      <Row style={{ marginBottom: 10 }}>
        <Col span={12}>
          <h3 style={{ marginBottom: 0, marginTop: 10 }}>{name}</h3>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <a
            href={`/big-screen/modify/${id}`}
            target="_blank"
          >
            <Button style={{ marginRight: 8 }}>配置大屏</Button>
          </a>
          <a
            href={`/big-screen/${id}`}
            target="_blank"
          >
            <Button>查看大屏</Button>
          </a>
        </Col>
      </Row>
      <Parcel
        config={async () => {
          const sysUrl = bigScreenConf[process.env.NODE_ENV].index;
          const htmlData = await fetchManifest(sysUrl, bigScreenConf[process.env.NODE_ENV].publicPath);
          const lifecyclesFile = await System.import(htmlData);
          const jsPath = await getPathBySuffix(bigScreenConf, lifecyclesFile.default, '.js');
          const cssPath = await getPathBySuffix(bigScreenConf, lifecyclesFile.default, '.css');
          createStylesheetLink('ticket', cssPath);
          const reactLifecycles = await System.import(jsPath);
          return reactLifecycles;
        }}
        mountParcel={singleSpa.mountRootParcel}
        {...props}
        mode="inner"
      />
    </div>
  )
}

export default CreateIncludeNsTree(Detail, { visible: false }) as any;
