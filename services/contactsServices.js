const fs = require("fs/promises")
const patch = require("path")
const { v4: uuidv4 } = require("uuid")

const contactsPatch = patch.resolve("db", "contacts.json")

async function contactsList() {
    const data = await fs.readFile(contactsPatch)

    return JSON.parse(contacts)
};

async function getContactById(contactId) {
    const contacts = await contactsList();
    const result = contacts.find(item => { return item.id === contactId })
    return result || null;
};

async function contactRemove(contactId) {
    const contacts = await contactsList()
    const index = contacts.findIndex(item => item.id === contactId);
    if (index === -1) {
        return null
    }
    else {
        const newContacts = contacts.filter(item => {
            return item.id != contactId
        })
        await fs.writeFile(contactsPatch, JSON.stringify(newContacts, null, 2));
        return contacts.find(item => {return item.id === contactId})
    }
};

async function addContact(name, email, phone) {
    const contacts = await contactsList()
    const newContact = {
        id: uuidv4(),
        name,
        email,
        phone,
    }
    contacts.push(newContact)

    await fs.writeFile(contactsPatch, JSON.stringify(contacts, null, 2))
    return newContact
};

async function updateContact(id, data) {
    const contacts = await contactsList();
    const index = contacts.findIndex(item => item.id === id)
    if (index === -1) {
        return null
    }
    contacts[index] = { id, ...data }
    await fs.writeFile(contactsPatch, JSON.stringify(contacts, null, 2));
    return contacts[index];
}

module.exports = {
    contactsList,
    getContactById,
    addContact,
    contactRemove,
    updateContact
}