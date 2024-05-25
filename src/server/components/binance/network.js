import controller from "./controller";
import response from "../../network/response";
import baseHandler from "@/server/network/baseHandler";

const handler = baseHandler();
const apiURL = "/api/binance";

// GET: api/binance/getHistoryPar
handler.get(`${apiURL}/getHistoryPar`, async function (req, res) {
  try {
    const result = await controller.getHistoryPar();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

export default handler;
