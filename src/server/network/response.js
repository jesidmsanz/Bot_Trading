exports.success = function (req, res, message, status) {
  res.status(status || 200).send({ error: "", body: message });
};

exports.error = async function (req, res, message, status, details) {
  console.log("[response error]", details);
  console.log("[response message]", message);
  const messageText = message;

  res.status(status || 200).send({ error: messageText, body: "" });
};
