import contactsService from '../services/contactsServices.js'
import HttpError from "../helpers/HttpError.js"
import {createContactSchema, updateContactSchema} from "../schemas/contactsSchemas"


export const getAllContacts = async (req, res, next) => {
    try {
        const result = await contactsService.contactsList();
        res.json(result)
    }
    catch (error) {
        next(error)
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await contactsService.getContactById(id);
        if (!result) {
            throw HttpError(404)
        }
        res.json(result)
    } catch (error) {
        next(error)
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await contactsService.contactRemove(id);
        if (!result) {
            throw HttpError(404)
        }
        res.json({
            message:'Delete success'
        })
    } catch (error) {
        next(error)
    }
};

export const createContact = async (req, res, next) => {
    try {
        const { error } = createContactSchema.validate(req.body)
        if (error) {
            throw HttpError(400, error.message)
        }
        const result = await contactsService.addContact(req.body)
        res.status(201).json(result)
    } catch (error) {
        next(error)
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bodyIsEmpty = Object.keys(req.body).length === 0;
        if (bodyIsEmpty) {
            throw HttpError(400, "Body must have at least one field")
        }

        const { error } = updateContactSchema.validate(req.body)
        if (error) {
            throw HttpError(400, error.message);
        }

        const result = await contactsService.updateContact(id, req.body)
        if (!result) {
            throw HttpError(404)
        }

        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
};

