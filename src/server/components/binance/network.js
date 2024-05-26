import controller from "./controller";
import response from "../../network/response";
import baseHandler from "@/server/network/baseHandler";

const handler = baseHandler();
const apiURL = "/api/binance";

// GET: api/binance/validCpuorGpu
handler.get(`${apiURL}/validCpuorGpu`, async function (req, res) {
  try {
    const result = await controller.validCpuorGpu();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

// GET: api/binance/entreningBot
handler.get(`${apiURL}/entreningBot`, async function (req, res) {
  try {
    const result = await controller.entreningBot();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});
// GET: api/binance/generateTrades
handler.get(`${apiURL}/generateTrades`, async function (req, res) {
  try {
    const result = await controller.generateTrades();
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
