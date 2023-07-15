import express from "express";
import CandidateModel from "./registration-model.js";
import { Op } from "sequelize";
import sgMail from "@sendgrid/mail";

const candidate_router = express.Router();

candidate_router.post(
  "/register",
  async (req, res, next) => {
    try {
      const { email } = req.body; // Destructure the email from req.body
      const candidate = await CandidateModel.findOne({ where: { email: email } });
      if (candidate) {
        return res.send({
          message: "This email has already been registered. Please login.",
        });
      } else {
        const new_candidate = await CandidateModel.create(req.body); 
        const { candidate_id } = new_candidate; 
        res.status(201).send({ candidate_id })
      }
    } catch (error) {
      console.log(error)
      next(error);
    }
  }
);

// candidate_router.get("/")

export default candidate_router;
