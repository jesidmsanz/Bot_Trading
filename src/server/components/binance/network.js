import controller from "./controller";
import response from "../../network/response";
import baseHandler from "@/server/network/baseHandler";

const handler = baseHandler();
const apiURL = "/api/binance";

// GET: api/binance/runBot
handler.get(`${apiURL}/runBot`, async function (req, res) {
  try {
    const result = await controller.runBot();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});
// GET: api/binance/trainingModel
handler.get(`${apiURL}/trainingModel`, async function (req, res) {
  try {
    const result = await controller.trainingModel();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

// GET: api/binance/getHistoryParWebSocket
handler.get(`${apiURL}/getHistoryParWebSocket`, async function (req, res) {
  try {
    console.log(" GET: api/binance/getHistoryParWebSocket");
    const result = await controller.getHistoryParWebSocket();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

// GET: api/binance/preditions
handler.get(`${apiURL}/preditions`, async function (req, res) {
  console.log("GET: api/binance/preditions");
  try {
    const result = await controller.prediction();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

// GET: api/binance/runBot
handler.get(`${apiURL}/runBot`, async function (req, res) {
  console.log("GET: api/binance/runBot");
  try {
    const result = await controller.runBot();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

export default handler;
