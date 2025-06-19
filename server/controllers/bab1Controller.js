const Bab1 = require('../models/bab1Model');
const path = require('path');
const fs = require('fs');

// Create (Upload)
exports.createBab1 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }
    const { title = '', description = '' } = req.body;

    const newBab1 = new Bab1({
      title: title.trim(),
      description: description.trim(),
      pdfUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    });

    await newBab1.save();
    res.status(201).json({ message: 'Bab1 uploaded successfully', bab1: newBab1 });
  } catch (err) {
    console.error('Create Bab1 error:', err);
    res.status(500).json({ message: 'Server error during Bab1 creation' });
  }
};

// Read (Get All)
exports.getAllBab1 = async (req, res) => {
  try {
    const bab1Records = await Bab1.find().sort({ createdAt: -1 });
    res.json(bab1Records);
  } catch (err) {
    console.error('Get Bab1 error:', err);
    res.status(500).json({ message: 'Server error during fetching Bab1' });
  }
};

// Update (Edit Title/Description and Optional PDF)
exports.updateBab1 = async (req, res) => {
  try {
    const { id } = req.params;
    const { title = '', description = '' } = req.body;

    const bab1 = await Bab1.findById(id);
    if (!bab1) {
      return res.status(404).json({ message: 'Bab1 record not found' });
    }

    // If a new file is uploaded, delete old file
    if (req.file) {
      // Extract old file path from pdfUrl
      const oldFilePath = path.join(__dirname, '..', 'uploads', path.basename(bab1.pdfUrl));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // Delete old PDF file
      }

      // Update pdfUrl to new file
      bab1.pdfUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Always update title and description
    bab1.title = title.trim();
    bab1.description = description.trim();

    await bab1.save();

    res.json({ message: 'Bab1 updated successfully', bab1 });
  } catch (err) {
    console.error('Update Bab1 error:', err);
    res.status(500).json({ message: 'Server error during Bab1 update' });
  }
};

// Delete
exports.deleteBab1 = async (req, res) => {
  try {
    const { id } = req.params;
    const bab1 = await Bab1.findByIdAndDelete(id);

    if (!bab1) {
      return res.status(404).json({ message: 'Bab1 record not found' });
    }

    // Delete associated file
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(bab1.pdfUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Bab1 deleted successfully' });
  } catch (err) {
    console.error('Delete Bab1 error:', err);
    res.status(500).json({ message: 'Server error during Bab1 deletion' });
  }
};
