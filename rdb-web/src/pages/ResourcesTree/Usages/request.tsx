import api from '@pkgs/api';

export const getUsages = async (tenant: number) => {
    const response =  await fetch(api.zstack + '/' + tenant + '/usages')
    const data = await response.json()
    if(response.status < 200 || response.status >= 300){
      console.log(data.err);
    }
    return data;
  };

  export const updateQuota = async (tenant: string, name: string, value: number) => {
    const response =  await fetch(api.updateZstack + '/actions', {
      method: 'PUT',
      body: JSON.stringify({ updateQuota :{
        identityUuid: tenant,
        name: name,
        value: value
      }}),
    })
    const data = await response.json()
    if(response.status < 200 || response.status >= 300){
      console.log(data.err);
    }
    return data;
  };