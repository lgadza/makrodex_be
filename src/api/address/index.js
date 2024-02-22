import express from "express";
import AddressModel from "./model.js";
import UserModel from "../users/model.js";
import { JWTAuthMiddleware } from "../lib/auth/jwtAuth.js";
import { param, validationResult } from "express-validator";

const addressRouter = express.Router();

// Create an address for a specific user
addressRouter.post("/:user_id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const user = await UserModel.findByPk(user_id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const addressData = {
      ...req.body,
      user_id: user_id, 
    };

    const { id } = await AddressModel.create(addressData );
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

// Get all addresses
addressRouter.get("/all/:user_id", [
  param('user_id').isUUID().withMessage('User ID must be a UUID.') 
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_id } = req.params;
  try {
    const addresses = await AddressModel.findAll({ where: { user_id } });
    // Check if addresses exist for the user_id
    if (addresses && addresses.length > 0) {
      res.status(200).json({  addresses });
    } else {
      res.status(404).json({ success: false, message: "No addresses found for the given user." });
    }
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: "An error occurred while fetching addresses." });
  }
});

// Get an address by ID
addressRouter.get("/:user_id/:address_id", async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const address_id = req.params.address_id;
    const address = await AddressModel.findOne({ where: { user_id , id:address_id} });
    if (!address) {
      return res.status(404).send({ error: "Address not found" });
    }
    res.status(200).send(address);
  } catch (error) {
    next(error);
  }
});

// Update an address by ID
addressRouter.put("/:user_id/:address_id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const address_id = req.params.address_id;

    // Find the address by ID
    const address = await AddressModel.findByPk(address_id);
    if (!address) {
      return res.status(404).send({ error: "Address not found" });
    }

    // Get the user ID from the address record
    const user_id = address.user_id;

    // Find the user by ID
    const user = await UserModel.findByPk(user_id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    // Update the address with the new data
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
addressRouter.delete("/:user_id/:address_id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const address_id = req.params.address_id;

    // Find the address by ID
    const address = await AddressModel.findByPk(address_id);
    if (!address) {
      return res.status(404).send({ error: "Address not found" });
    }

    // Get the user ID from the address record
    const user_id = address.user_id;

    // Find the user by ID
    const user = await UserModel.findByPk(user_id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Delete the address
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
