/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  Form, Modal, Input, Spin, message,
} from 'antd';
import { FormComponentProps } from 'antd/es/form';
import api from '@common/api';
import request from '@pkgs/request';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';

interface Props {
  type: string;
  selectedNid: number;
  data?: any[]; // 批量导出对象
  initialvalue?: string;
}

const FormItem = Form.Item;
const { TextArea } = Input;

const fetchScreenSubclass = (id: number) => {
  return request(`${api.screen}/${id}/subclass`);
};

const fetchScreenChart = (id: number) => {
  return request(`${api.subclass}/${id}/chart`);
};

const createScreen = (id: number, body: Object) => {
  return request(`${api.monNode}/${id}/screen`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

const createScreenTag = (id: number, body: Object) => {
  return request(`${api.screen}/${id}/subclass`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

const createScreenChart = (id: number, body: Object) => {
  return request(`${api.subclass}/${id}/chart`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};


function BatchImportExportModal(props: Props & FormComponentProps & ModalWrapProps) {
  const [screensDetail, setScreensDetail] = useState(props.initialvalue || '');
  const [screensDetailLoading, setScreensDetailLoading] = useState(false);
  // const [importProgress, setImportProgress] = useState(false);
  // const [importPercent, setImportPercent] = useState(0);
  // const [requestCount, setRequestCount] = useState(0);
  const makeImport = async () => {
    // let count = 0;
    try {
      const parsedScreensDetail = JSON.parse(screensDetail);
      _.forEach(parsedScreensDetail, async (screen) => {
        // count += 1;
        // setImportPercent(count / requestCount * 100);
        const screenId = await createScreen(props.selectedNid, {
          name: screen.name,
          weight: screen.weight,
        });
        _.forEach(screen.tags, async (tag) => {
          // count += 1;
          // setImportPercent(count / requestCount * 100);
          const tagId = await createScreenTag(screenId, {
            name: tag.name,
            weight: tag.weight,
          });
          _.forEach(tag.charts, async (chart) => {
            // count += 1;
            // setImportPercent(count / requestCount * 100);
            const chartConfigs = JSON.parse(chart.configs);
            chartConfigs.metrics = _.map(chartConfigs.metrics, (metric) => {
              return {
                ...metric,
                selectedNid: props.selectedNid,
              };
            });
            await createScreenChart(tagId, {
              configs: JSON.stringify(chartConfigs),
              weight: chart.weight,
            });
          });
        });
        props.onOk();
      });
    } catch (e) {
      console.log('导出大盘失败');
    }
  };

  useEffect(() => {
    if (!props.data) return;
    const data = _.cloneDeep(props.data);
    async function fetchData() {
      setScreensDetailLoading(true);
      try {
        // let count = 0;
        const newData = await Promise.all(_.map(data, async (screen) => {
          // count += 1;
          const screenSubclass = await fetchScreenSubclass(screen.id);
          delete screen.id;
          delete screen.node_id;
          delete screen.last_updator;
          delete screen.last_updated;
          const subclassDetail = await Promise.all(_.map(screenSubclass, async (tag) => {
            // count += 1;
            const charts = await fetchScreenChart(tag.id);
            delete tag.id;
            delete tag.screen_id;
            return {
              ...tag,
              charts: _.map(charts, (chart) => {
                // count += 1;
                return {
                  configs: chart.configs,
                  weight: chart.weight,
                };
              }),
            };
          }));
          return {
            ...screen,
            tags: subclassDetail,
          };
        }));
        if (!_.isEmpty(newData)) {
          // setRequestCount(count);
          setScreensDetail(JSON.stringify(newData, null, 4));
        }
      } catch (e) {
        message.warning('导出配置失败');
      }
      setScreensDetailLoading(false);
    }
    fetchData();
  }, [JSON.stringify(props.data)]);

  return (
    <>
      <Modal
        title={props.title}
        visible={props.visible}
        onOk={() => {
          props.destroy();
          if (props.type === 'import') {
            makeImport();
          }
        }}
        onCancel={() => {
          props.destroy();
        }}
      >
        <Spin spinning={screensDetailLoading}>
          <Form layout="vertical">
            <FormItem>
              <TextArea
                autoSize={{ minRows: 2, maxRows: 10 }}
                value={screensDetail}
                onChange={(e) => {
                  setScreensDetail(e.target.value);
                }}
              />
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}

export default ModalControl(Form.create()(BatchImportExportModal));
