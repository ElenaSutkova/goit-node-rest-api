import Contact from "../models/contact.js"
import HttpError from "../helpers/HttpError.js";
import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
    try {
        const { _id: owner } = req.user;
        const contacts = await Contact.find({ owner });
        res.status(200).json(contacts);
    }
    catch (error) {
        next(error)
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { _id: owner } = req.user;
        const { id } = req.params;
        const contact = await Contact.findOne({ _id: id, owner });
        if (!contact) {
            throw HttpError(404, "Not found")
        }
        res.status(200).json(contact)
    } catch (error) {
        next(error)
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { _id: owner } = req.user;
        const contact = await Contact.findOneAndDelete({ _id: id, owner });
        if (!contact) {
            throw HttpError(404, "Not found")
        }
        res.status(200).json(contact)
    } catch (error) {
        next(error)
    }
};

export const createContact = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const { _id: owner } = req.user;

        const result = await Contact.create({ ...req.body, owner });
        if (!result) {
            throw HttpError(400, error.message)
        }

        const { error } = createContactSchema.validate({ name, email, phone })
        if (error) {
            throw HttpError(400, error.message)
        }
        res.status(201).json(result)
    } catch (error) {
        next(error)
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const { _id: owner } = req.user;
        const { id } = req.params
        const { name, email, phone } = req.body;

        if (!name && !email && !phone) {
            throw HttpError(400, "Body must have at least one field")
        }

        const { error } = updateContactSchema.validate(req.body);
        if (error) {
            throw HttpError(400, error.message);
        }

        const contact = await Contact.findOneAndUpdate({_id: id, owner}, { name, email, phone }, { new: true });
        if (!contact) {
            throw HttpError(404, "Not found")
        }
        res.status(200).json(contact);
    } catch (error) {
        next(error)
    }
}; 

export const updateStatusContact = async (req, res, next) => {
    try {
        const { favorite } = req.body;
        const { _id: owner } = req.user;
        const { id } = req.params;

        const contact = await Contact.findOne({ _id: id, owner });
        if (!contact) {
            throw HttpError(404, "Not found")
        }

        contact.favorite = favorite;
        await contact.save();

        res.status(200).json(contact);
    } catch (error) {
        next(error)
    }
}