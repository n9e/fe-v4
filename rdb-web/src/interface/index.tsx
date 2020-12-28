import React from 'react';
// TODO: 菜单配置接口有点乱，看是否可以归类下，以及是否可以去掉一些非必要的属性
export interface MenuConfItem {
  key?: string,
  name: string | React.ReactNode,
  path: string,
  icon?: string,
  children?: MenuConfItem[],
  visible?: boolean,
  rootVisible?: boolean,
  to?: string,
  divider?: boolean,
  target?: string,
  getQuery?: (query: any) => any,
}

export interface TreeNode {
  id: number,
  pid: number,
  ident: string,
  name: string,
  path: string,
  type: number,
  leaf: number,
  children?: TreeNode[],
  icon_color?: string,
  icon_char?: string,
  cate?: string,
  note?: string,
}

export interface ResponseDat {
  list: any[],
  total: number,
}

export interface Response {
  err : string,
  dat: any | ResponseDat,
}

export interface UserProfile {
  id: number,
  username: string,
  dispname: string,
  email: string,
  phone: string,
  im: string,
  isroot: boolean,
  status: number,
  type: number
}

export interface Tenant {
  id: number,
  ident: string,
  name: string,
  note: string,
}

export interface Team {
  id: number,
  ident: string,
  name: string,
  note: string,
  mgmt: number,
}

export interface Role {
  id: number,
  name: string,
  note: string,
  cate: 'global' | 'local',
  operations: string[],
}

export interface Order {
  id: number,
  title: string,
  levels: number,
  cc: string,
  content: string,
  scheduleStartTime: string,
  status: string,
  creator: string,
  targetQueueId: number,
}


export interface NewOrder {
  title: string,
  contactInfo: string,
  cc: string,
  level: number,
  scheduleStartTime: string,
  scheduleEndTime: string,
  relatedId: string[],
  content: string,
  targetQueueId: number,
  templateId: number,
}

export interface Tpl {
  id: number,
  queueId: number,
  name: string,
  title: string,
  desn: string,
  creator: string,
  remark: string,
  action: string,
  formSchema: string,
  actionSchema: string,
  approveInfo: string,
  createdAt: string,
  updatedAt: string,
  levels: number,
  cc: string,
  contact: string,
  scheduleStartTime: string,
  scheduleEndTime: string,
  relatedTicket: string,
}

// 所属组
export interface IQueue {
  id: number,
  identity: string,
  name: string,
  creator: string,
  desn: string,
  recieveLevel: string,
  thirdPartyToken: string,
  oncall: false,
  eventNotify: string,
  alarmNotify: string,
  createdAt: string,
  updatedAt: string,
  saasTenantId: number,
  holidayOncallInfo: string,
  normalOncallInfo: string,
  ticketCount: number,
  userCount: number,
}

export interface NodeCate {
  id: number,
  name: string,
  icon_color: string,
  icon_char: string,
  note: string,
  ident: string,
}

export interface NodeCateField {
  cate?: string,
  field_ident: string,
  field_name: string,
  field_type: string,
  field_required: 0 | 1,
  field_extra: string,
}

export interface WhiteCreate{
  startIp: string,
  endIp:string,
  startTime: string,
  endTime: string
}