import React, { useState, useEffect } from 'react';
import { Button, Input, Pagination, Modal } from 'antd';
import _ from 'lodash';
import { appname } from '@common/config';
import request from '@pkgs/request';
import api from '@common/api';
import './style.less';

interface Data {
  id: number,
  ident: string,
  name: string,
  [index: string]: any,
}

interface Props {
  title: string,
  intl?: any,
  selectedItem?: Data,
  onChange: (item: any) => void,
  onCreate: () => void,
  onDelete?: (id: number) => void,
}

const PAGE_SIZE = 10;

export default function index(props: Props) {
  const cls = `${appname}-user-siderlist`;
  const [data, setData] = useState<Data[]>([] as Data[]);
  const [total, setTotal] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | undefined>(_.get(props.selectedItem, 'id'));
  const currentData = data;

  useEffect(() => {
    request(`${api.teams}/mine?limit=${PAGE_SIZE}&p=${currentPage}&query=${query}`).then((res) => {
      let list = res.list || [];
      setData(list);
      setTotal(res.total);
      if (!props.selectedItem) {
        setSelectedId(list[0].id);
        const selectedItem = _.find(list, { id: list[0].id });
        props.onChange(selectedItem);
      } else {
        const selectedItem = _.find(list, { id: props.selectedItem.id });
        props.onChange(selectedItem);
      }
    });
  }, [currentPage, query]);

  return (
    <div className={cls}>
      <div className={`${cls}-header`}>
        <div className={`${cls}-header-title`}>
          {props.title}
        </div>
        <div className={`${cls}-header-extra`}>
          <Button
            shape="circle"
            icon="minus"
            size="small"
            onClick={() => {
              if (props.intl) {
                Modal.confirm({
                  title: props.intl.formatMessage({ id: 'table.delete.sure' }),
                  content: <span>{
                    `${_.get(props.selectedItem, 'ident')} - ${_.get(props.selectedItem, 'name')}`
                  }</span>,
                  onOk: () => {
                    if (selectedId && props.onDelete) {
                      props.onDelete(selectedId);
                    }
                  },
                });
              }
            }}
            style={{ marginRight: 8 }}
          />
          <Button
            type="primary"
            shape="circle"
            icon="plus"
            size="small"
            onClick={() => {
              props.onCreate();
            }}
          />
        </div>
      </div>
      <div className={`${cls}-search`}>
        <Input.Search
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
          }}
          onSearch={(val) => {
            setQuery(val);
          }}
        />
      </div>
      <div className={`${cls}-main`}>
        <ul>
          {
            _.map(currentData, (item, i) => {
              return (
                <li
                  key={item.id}
                  className={selectedId === item.id ? 'active' : ''}
                  onClick={() => {
                    setSelectedId(item.id);
                    const selectedItem = _.find(data, { id: item.id });
                    props.onChange(selectedItem);
                  }}
                  title={
                    `${item.ident} - ${item.name}`
                  }
                >
                  <div />
                  <div
                    style={{
                      borderTop: _.get(currentData[i - 1], 'id') === selectedId ? '0 none' : '1px solid #e8e8e8',
                      borderBottom: i === currentData.length -1 || selectedId === item.id ? '1px solid #e8e8e8' : '0 none',
                    }}
                  >
                    {
                      `${item.ident} - ${item.name}`
                    }
                  </div>
                </li>
              );
            })
          }
        </ul>
      </div>
      <Pagination
        style={{ textAlign: 'center' }}
        simple
        current={currentPage}
        pageSize={PAGE_SIZE}
        total={total}
        onChange={(page) => {
          setCurrentPage(page);
        }}
      />
    </div>
  );
}
