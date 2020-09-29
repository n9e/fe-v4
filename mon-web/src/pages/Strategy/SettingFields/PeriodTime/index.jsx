import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select, TimePicker } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { allDaysOfWeek } from './config';

const { Option } = Select;
const format = 'HH:mm';

export default class PeriodTime extends Component {
  static defaultValue = {
    enable_stime: '00:00',
    enable_etime: '23:59',
    enable_days_of_week: [0, 1, 2, 3, 4, 5, 6],
  };

  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
  };

  static defaultProps = {
    value: {},
    onChange: () => {},
    readOnly: false,
  };

  handleEnableDurationChange = (key, val) => {
    const { value, onChange } = this.props;
    const valueClone = _.cloneDeep(value);

    valueClone[key] = val;
    onChange(valueClone);
  }

  handleDaysChange = (val) => {
    const { value, onChange } = this.props;
    const valueClone = _.cloneDeep(value);

    valueClone.enable_days_of_week = val;
    onChange(valueClone);
  }

  render() {
    const { value, readOnly } = this.props;
    const stime = value.enable_stime;
    const etime = value.enable_etime;
    const days = value.enable_days_of_week;

    return (
      <div>
        <div>
          <Select
            style={{ width: '100%' }}
            disabled={readOnly}
            mode="multiple"
            value={days}
            onChange={this.handleDaysChange}
          >
            {
              _.map(allDaysOfWeek, (val, i) => {
                return <Option key={i} value={i}><FormattedMessage id={val} /></Option>;
              })
            }
          </Select>
        </div>
        <div>
          <TimePicker
            disabled={readOnly}
            format={format}
            value={moment(stime, format)}
            onChange={(val) => {
              this.handleEnableDurationChange('enable_stime', val.format(format));
            }}
          />
          <span style={{ padding: '0 8px' }}>~</span>
          <TimePicker
            disabled={readOnly}
            format={format}
            value={moment(etime, format)}
            onChange={(val) => {
              this.handleEnableDurationChange('enable_etime', val.format(format));
            }}
          />
        </div>
      </div>
    );
  }
}
