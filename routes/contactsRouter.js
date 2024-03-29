import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact
} from "../controllers/contactsControllers.js";


const contactsRouter = express.Router();

contactsRouter.get("/", authMiddleware, getAllContacts);

contactsRouter.get("/:id", authMiddleware, getOneContact);

contactsRouter.delete("/:id", authMiddleware, deleteContact);

contactsRouter.post("/", authMiddleware, createContact);

contactsRouter.put("/:id", authMiddleware, updateContact);

contactsRouter.patch("/:id/favorite", authMiddleware, updateStatusContact);

export default contactsRouter;