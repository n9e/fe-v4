import api from "./api";
import { errNotify } from "@pkgs/request";

export const getUsages = async (tenant: number) => {
  const response = await fetch(api.zstack + "/" + tenant + "/usages");
  const data = await response.json();
  if (response.status < 200 || response.status >= 300) {
    console.log(data.err);
  }
  return data;
};

const statusPoll = async (status: number, url: string) => {
  if (status === 202) {
    var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)(:[0-9]{1,4})?/g;
    const URL = url.replace(reg, ' ');
    const response = await fetch(URL);
    const data = await response.json();
    if (response.status !== 200) {
      errNotify(data.error.details);
      throw new Error(data.error.details);
    }
    statusPoll(response.status, data.location);
    return data;
  }
};

export const updateQuota = async (
  tenant: string,
  name: string,
  value: number
) => {
  const response = await fetch(api.updateZstack + "/actions", {
    method: "PUT",
    body: JSON.stringify({
      updateQuota: {
        identityUuid: tenant,
        name: name,
        value: value,
      },
    }),
  });
  const data = await response.json();
  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) {
      const redirect = window.location.pathname;
      window.location.href = `/login?redirect=${redirect}`;
    }
    if (response.status === 403) {
      window.location.href = "/403";
    }
    console.log(data.err);
  }

  statusPoll(response.status, data.location);

  return data;
};
