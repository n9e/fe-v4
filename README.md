## 开发

1、先运行基座(layout-web)  
2、运行指定子系统

## 构建

基座和各个子系统分别构建   
构建后的代码默认会存放到 `<root>/pub` 文件夹里

## 部署
把 `<root>/pub` 部署到环境机器上，修改 nginx server root 配置  
复制 `<root>/layout/static` 到环境机器的 `pub` 下

> static 里面存放的是一些前端的静态配置，没有特殊需求不需要做任何修改，后面会逐步完善文档。  

## 常见问题
1、Error: Cannot find module '../src/package/xxxx'  
子系统没有安装公共组件 git clone <fe-packages.git> src/packages

2、根目录缺少  proxy.config.js 文件
需要手动在根目录创建代理配置文件  
```
module.exports = {
  '/api/rdb': 'http://rdb.com',
  '/api/ams-ce': '',
  '/api/job': '',
  '/api/ticket': '',
  '/api/mon': '',
  '/api/transfer': '',
  '/api/index': '',
}
```
