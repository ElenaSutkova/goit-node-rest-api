const fs = require("fs/promises")
const patch = require("path")
const { v4: uuidv4 } = require("uuid")

const contactsPatch = patch.join(__dirname, "db", "contacts.json")

async function contactsList() {
    const contacts = await fs.readFile(contactsPatch)

    return JSON.parse(contacts)
};

async function getContactById(contactId) {
    const contacts = await contactsList();
    const contact = contacts.find(el => el.id === contactId)
    if (contact) {
        return contact
    } else {
        return null
    }
};

async function contactRemove(contactId) {
    const contacts = await contactsList()
    const deletedContactIndex = contacts.findIndex((contact) => contact.id === contactId)

    if (deletedContactIndex !== -1) {
        const [deletedContact] = contacts.splice(deletedContactIndex, 1)
        await fs.writeFile(contactsPatch, JSON.stringify(contacts, null, 2))
        return deletedContact
    } else {
        return null
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

    await fs.writeFile(contactsPatch, JSON.stringify(contacts))
    return newContact
};

module.exports = {
    contactsList,
    getContactById,
    addContact,
    contactRemove
}