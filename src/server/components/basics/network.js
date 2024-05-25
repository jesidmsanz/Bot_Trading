import controller from "./controller";
import response from "../../network/response";
import baseHandler from "@/server/network/baseHandler";

const handler = baseHandler();
const apiURL = "/api/basics";

// GET: api/basics
handler.get(`${apiURL}/`, async function (req, res) {
  try {
    console.log("hola");
    const result = await controller.findAll();
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

handler.get(`${apiURL}/:id`, async function (req, res) {
  try {
    const result = await controller.findById(req.params.id);
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basicss", 400, error);
  }
});

// POST: api/basics
handler.post(`${apiURL}/`, async function (req, res) {
  try {
    const result = await controller.create(req.body);
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

// POST: api/basics/1
handler.put(`${apiURL}/:id`, async function (req, res) {
  try {
    const result = await controller.update(req.params.id, req.body);
    response.success(req, res, result);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});

// DELETE: api/basics
handler.delete(`${apiURL}/:id`, async function (req, res) {
  try {
    const model = await controller.deleteById(req.params.id);
    response.success(req, res, model);
  } catch (error) {
    console.log("ERROR: ", error);
    response.error(req, res, "Error on basics", 400, error);
  }
});



export default handler;
