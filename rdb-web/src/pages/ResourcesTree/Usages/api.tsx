function getZstack(path: string) {
    const prefix = '/zstack/v1';
    return `${prefix}${path}`;
  }
  const api = {
    zstack: getZstack('/accounts/quota'),
    updateZstack: getZstack('/accounts/quotas'),
  };
  
  export default api;
  