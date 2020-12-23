import api from '@pkgs/api';
import request from '@pkgs/request';

export const auth = async () => {
    try{
        const data = await request(api.auth);
        return data;
    }catch(e){
        console.log(e);
    }
}

export const authPost = async (reqBody: {}) => {
    try{
        const data = await request(api.auth, {
            method: "PUT",
            body: JSON.stringify(reqBody),
        });
        return data;
    }catch(e){
        console.log(e);
    }
}