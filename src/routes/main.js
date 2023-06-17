const express = require("express");

const router = express.Router();

const mainController = require("../controllers").mainController;
router.get("/", mainController.getAll);
router.post("/", mainController.insertClockIn);
router.get("/today", mainController.getOne);
router.patch("/editClockOut", mainController.editLog);
router.get("/semua/data", mainController.getSemua);
router.get("/allhistori", mainController.getHistori);
module.exports = router;
