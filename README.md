## 开发

1、先运行基座(layout-web)  
2、运行指定子系统

## 构建

基座和各个子系统分别构建   
构建后的代码默认会存放到 `<root>/pub` 文件夹里

## 部署
把 `<root>/pub` 部署到环境机器上，修改 nginx server root 配置  
复制 `<root>/layout/static` 到 `<root>/pub` 下

> static 里面存放的是一些前端的静态配置，没有特殊需求不需要做任何修改，后面会逐步完善文档。
