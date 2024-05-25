import fetchApi, { getAxiosError } from './fetchApi';

const mainRoute = 'users';

const list = async (initialData) => {
  try {
    const { data } = await fetchApi.get(mainRoute, initialData);
    return data.body;
  } catch (error) {
    return { error: true, message: getAxiosError(error) };
  }
};

const listActive = async (initialData) => {
  try {
    const { data } = await fetchApi.get(`${mainRoute}/active`, initialData);
    return data.body;
  } catch (error) {
    return { error: true, message: getAxiosError(error) };
  }
};

const detail = async (id, initialData) => {
  try {
    const { data } = await fetchApi.get(`${mainRoute}/${id}`, initialData);
    return data.body;
  } catch (error) {
    return { error: true, message: getAxiosError(error) };
  }
};

const create = async (initialData) => {
  try {
    const { data } = await fetchApi.post(mainRoute, initialData);
    return data.body;
  } catch (error) {
    return { error: true, message: getAxiosError(error) };
  }
};

const signUp = async (initialData) => {
  try {
    const { data } = await fetchApi.post(`${mainRoute}/sign-up`, initialData);
    return data.body;
  } catch (error) {
    return { error: true, message: getAxiosError(error) };
  }
};

const login = async ({ username, password }) => {
  try {
    const route = `${mainRoute}/sign-in`;
    const { data } = await fetchApi({
      url: route,
      method: 'post',
      auth: {
        username,
        password,
      },
    });
    return data.body;
  } catch (error) {
    return { error: true, message: getAxiosError(error) };
  }
};

const update = async (id, initialData) => {
  try {
    const { data } = await fetchApi.put(`${mainRoute}/${id}`, initialData);
    return data.body;
  } catch (error) {
    return { error: true, message: getAxiosError(error) };
  }
};

const remove = async (id) => {
  try {
    const { data } = await fetchApi.delete(`${mainRoute}/${id}`);
    return data.body;
  } catch (error) {
    console.log('error', error);
    return { error: true, message: getAxiosError(error) };
  }
};

const productsApi = { list, listActive, detail, create, signUp, update, remove, login };
export default productsApi;
