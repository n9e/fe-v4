import PropTypes from 'prop-types';

export const funcMap = {
  all: {
    label: '连续发生',
    meaning: '持续 $n 秒每个值都 $v',
    meaningEn: 'duration $n s, every value $v',
    params: [],
    defaultValue: [],
  },
  happen: {
    label: '发生次数',
    meaning: '持续 $n 秒内 $m 次值 $v',
    meaningEn: 'duration $n s, $m times value $v',
    params: ['m'],
    defaultValue: [1],
  },
  nodata: {
    label: '数据上报中断',
    meaning: '持续 $n 秒无数据上报',
    meaningEn: 'duration $n s, no data',
    params: [],
    defaultValue: [],
  },
  max: {
    label: '最大值',
    meaning: '持续 $n 秒最大值 $v',
    meaningEn: 'duration $n s, max $v',
    params: [],
    defaultValue: [],
  },
  min: {
    label: '最小值',
    meaning: '持续 $n 秒最小值 $v',
    meaningEn: 'duration $n s, min $v',
    params: [],
    defaultValue: [],
  },
  avg: {
    label: '均值',
    meaning: '持续 $n 秒均值 $v',
    meaningEn: 'duration $n s, avg $v',
    params: [],
    defaultValue: [],
  },
  sum: {
    label: '求和',
    meaning: '持续 $n 秒求和值 $v',
    meaningEn: 'duration $n s, sum $v',
    params: [],
    defaultValue: [],
  },
  diff: {
    label: '突增突降值',
    meaning: '最新值与其之前 $n 秒的任意值之差 (区分正负) $v',
    params: [],
    defaultValue: [],
  },
  pdiff: {
    label: '突增突降率',
    meaning: '(最新值与其之前 $n 秒的任意值之差)除以对应历史值 (区分正负) $v ％',
    params: [],
    defaultValue: [],
  },
  c_avg_rate_abs: {
    label: '同比变化率',
    meaning: '最近 $n 秒平均值相对 $m 天前同周期平均值变化绝对值 $v ％',
    params: ['m'],
    defaultValue: [86400],
  },
  c_avg_rate: {
    label: '同比变化率(区分正负)',
    meaning: '最近 $n 秒平均值相对 $m 天前同周期平均值变化 $v ％',
    params: ['m'],
    defaultValue: [86400],
  },
  c_avg_abs: {
    label: '同比变化值',
    meaning: '最近 $n 秒平均值相对 $m 天前同周期平均值变化绝对值 $v',
    params: ['m'],
    defaultValue: [86400],
  },
  c_avg: {
    label: '同比变化值(区分正负)',
    meaning: '最近 $n 秒平均值相对 $m 天前同周期平均值变化 $v',
    params: ['m'],
    defaultValue: [86400],
  },
  stddev: {
    label: '3-sigma离群点检测',
    meaning: '持续 $n 秒内波动值过大，超过了 $m 个标准差范围',
    meaningEn: 'within $n seconds, the fluctuation value exceeds the $m standard deviation range',
    params: ['m'],
    defaultValue: [3],
  },
};

export const defaultExpressionValue = {
  metric: '',
  func: 'all',
  eopt: '=',
  threshold: 0,
  params: [], // 必须和当前 func 的初始值对应 !!!
};

export const commonPropTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  alertDuration: PropTypes.number,
  readOnly: PropTypes.bool,
  metrics: PropTypes.array,
  renderHeader: PropTypes.func,
  renderFooter: PropTypes.func,
};

export const commonPropDefaultValue = {
  readOnly: false,
  metrics: [],
  renderHeader: () => {},
  renderFooter: () => {},
};
