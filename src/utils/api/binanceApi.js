import fetchApi, { getAxiosError } from "./fetchApi";

const mainRoute = "binance";

const getHistorySymbol = async (initialData) => {
  try {
    const { data } = await fetchApi.get(`${mainRoute}/getHistoryPar`, initialData);
    return data.body;
  } catch (error) {
    return { error: true, message: getAxiosError(error) };
  }
};

const binanceApi = { getHistorySymbol };
export default binanceApi;
