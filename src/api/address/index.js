import express from "express";
import AddressModel from "./model.js";
import ApplicantModel from "../applicants/model.js";
import { JWTAuthMiddleware } from "../lib/auth/jwtAuth.js";

const addressRouter = express.Router();

// Create an address for a specific applicant
addressRouter.post("/:applicant_id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const applicant_id = req.params.applicant_id;
    const { id } = await AddressModel.create({ ...req.body, applicant_id });
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

// Get all addresses
addressRouter.get("/", async (req, res, next) => {
  try {
    const addresses = await AddressModel.findAll();
    res.status(200).send({ addresses });
  } catch (error) {
    next(error);
  }
});

// Get an address by ID
addressRouter.get("/:address_id", async (req, res, next) => {
  try {
    const address_id = req.params.address_id;
    const address = await AddressModel.findByPk(address_id);
    if (!address) {
      return res.status(404).send({ error: "Address not found" });
    }
    res.status(200).send(address);
  } catch (error) {
    next(error);
  }
});

// Update an address by ID
addressRouter.put("/:address_id", async (req, res, next) => {
  try {
    const address_id = req.params.address_id;
    const [numberOfUpdatedRows] = await AddressModel.update(req.body, {
      where: { id: address_id },
      returning: true,
    });
    if (numberOfUpdatedRows === 0) {
      return res.status(404).send({ error: "Address not found" });
    }
    res.status(200).send({ message: "Address updated successfully" });
  } catch (error) {
    next(error);
  }
});

// Delete an address by ID
addressRouter.delete("/:address_id", async (req, res, next) => {
  try {
    const address_id = req.params.address_id;
    const numberOfDeletedRows = await AddressModel.destroy({
      where: { id: address_id },
    });
    if (numberOfDeletedRows === 0) {
      return res.status(404).send({ error: "Address not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default addressRouter;
