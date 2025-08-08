const logger = require("firebase-functions/logger");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const db = getFirestore();
const contactsCollection = 'contacts';

const createContact = async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;

        if (!name || !email || !service || !message) {
            logger.error("Validation failed: Required field missing.", req.body);
            return res.status(400).send("Please fill out all required fields.");
        }

        const submission = {
            name,
            email,
            phone: phone || null,
            service,
            message,
            submittedAt: FieldValue.serverTimestamp(),
            status: "new",
        };

        const writeResult = await db.collection(contactsCollection).add(submission);
        logger.info(`New contact submission from ${email} saved with ID: ${writeResult.id}`);

        res.status(200).json({
            message: "Your message has been received. Thank you!",
            submissionId: writeResult.id,
        });
    } catch (error) {
        logger.error("Error saving contact submission to Firestore:", error);
        res.status(500).send("Something went wrong. Please try again later.");
    }
};

module.exports = {
    createContact
};


