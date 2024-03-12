import Contact from "../models/contact.js"
import HttpError from "../helpers/HttpError.js";
import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    }
    catch (error) {
        next(error)
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params
        const contact = await Contact.findById(id)
        if (!contact) {
            throw HttpError(404)
        }
        res.status(200).json(contact)
    } catch (error) {
        next(error)
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByIdAndDelete(id)
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
        const { error } = createContactSchema.validate({ name, email, phone })
        if (error) {
            throw HttpError(400, error.message)
        }
        const newContact = new Contact({ name, email, phone });
        await newContact.save()
        res.status(201).json(newContact)
    } catch (error) {
        next(error)
    }
};

export const updateContact = async (req, res) => {
    const { id } = req.params
    const { name, email, phone } = req.body;
    if (!name && !email && !phone) {
        throw HttpError(400, "Body must have at least one field")
    }

    const { error } = updateContactSchema.validate(req.body);
    if (error) {
        throw HttpError(400, error.message);
    }

    const contact = await Contact.findByIdAndUpdate(id, { name, email, phone }, { new: true });
    if (!contact) {
        throw HttpError(404)
    }
    res.status(200).json(contact);
};

export const updateStatusContact = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const { favorite } = req.body;

        const contact = await Contact.findById(contactId);
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