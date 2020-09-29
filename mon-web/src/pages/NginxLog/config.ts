export const interval = [10, 30, 60, 120, 300, 600, 1800, 3600];
export const serviceRule = {
  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\_]{0,128}$/,
  message: "服务只允许英文、数字、_",
};

// 获取url，search部分转换为对象
export const getQueryVariabe = (name: any) => {
  try{
    let h = window.location.href.split("?")[1];
    let vars = h.split("&");
    let pair = [] as any;
    for (let i = 0; i < vars.length; i++) {
      pair = vars[i].split("=");
      if (pair[0] == name) return pair[1];
    }
    return pair[1];
  }catch{
    return ''
  }
};
