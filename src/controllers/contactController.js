import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import contact from "../models/contacts.js"
import User from '../models/users.js';
import { nameRegex } from '../helper/RegexPatternHelper.js';

const createContact = async (req, res) => {
  try {

    const { id } = req.params
    const { name, email, phone } = req.body;
    // Validate all fields are present
    if (!name || !phone) {
      return res.status(400).json({ message: "All fields are required", isPassed: false });
    }

    if (typeof name !== 'string' || !nameRegex.test(name)) {
      return res.status(400).json({
        message: "Name should contain only letters and spaces",
        isPassed: false
      });
    }

    const checkUserAlreadyInDb = await User.findById(id)
    if (!checkUserAlreadyInDb) {
      return res.status(400).json({ message: "User not found", isPassed: false })
    }

    const data = await contact.insertOne({ name: name, email: email, phone: phone, userId: id })

    res.status(200).json({ message: "Succesfully Created", isPassed: true, data: data })
  } catch (error) {
    // Conditionally log the error based on the environment
    if (process.env.NODE_ENV === 'development') {
      console.log('error: ', error);
    }
    res.status(500).json({ message: "System error", isPassed: false })
  }
}

const getUserContacts = async (req, res) => {
  try {
    const { id } = req.params;

    const checkUser = await User.findById(id);
    if (!checkUser) {
      return res.status(400).json({ message: "User not found", isPassed: false });
    }

    const contacts = await contact.find({ userId: id }); // << Fetch user's contacts

    res.status(200).json({ message: "Fetched successfully", isPassed: true, data: contacts });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('error: ', error);
    }
    res.status(500).json({ message: "System error", isPassed: false });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ message: "User not found", isPassed: false });
    }

    // Check if contact exists and belongs to user
    const contactExists = await contact.findOne({ _id: contactId, userId: userId });
    if (!contactExists) {
      return res.status(404).json({ message: "Contact not found", isPassed: false });
    }

    // Delete the contact
    await contact.deleteOne({ _id: contactId });

    res.status(200).json({ message: "Contact deleted successfully", isPassed: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('error: ', error);
    }
    res.status(500).json({ message: "System error", isPassed: false });
  }
};

const updateContact = async (req, res) => {
  try {
    const { userId, contactId } = req.params; // Get userId and contactId from params
    const { name, email, phone } = req.body; // Get name, email, and phone from the body

    // Validate that name and phone are provided
    if (!name || !phone) {
      return res.status(400).json({ message: "All fields are required", isPassed: false });
    }

    // Validate name format (optional, but you can keep this check)
    if (typeof name !== 'string' || !nameRegex.test(name)) {
      return res.status(400).json({
        message: "Name should contain only letters and spaces",
        isPassed: false
      });
    }

    // Check if the user exists in the database
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ message: "User not found", isPassed: false });
    }

    // Check if the contact exists and belongs to the user
    const contactExists = await contact.findOne({ _id: contactId, userId: userId });
    if (!contactExists) {
      return res.status(404).json({ message: "Contact not found", isPassed: false });
    }

    // Update the contact with the new data
    const updatedContact = await contact.updateOne(
      { _id: contactId, userId: userId }, // Ensure the filter matches the correct contact
      { $set: { name, email, phone } } // Update only the specified fields
    );

    // Check if the document was actually modified
    if (updatedContact?.modifiedCount === 0) {
      return res.status(400).json({ message: "No changes made to the contact", isPassed: false });
    }

    // Send the response with updated contact data
    res.status(200).json({
      message: "Contact updated successfully",
      isPassed: true,
      data: { name, email, phone, _id: contactId }
    });
  } catch (error) {
    // Conditionally log the error based on the environment
    if (process.env.NODE_ENV === 'development') {
      console.log('Error while updating contact: ', error);
    }
    res.status(500).json({ message: "System error", isPassed: false });
  }
};




export default {
  createContact,
  getUserContacts,
  deleteContact,
  updateContact
}