const express = require("express");
const custodianController = require("../controller/custodian.controller.js");
const multer = require("multer");
const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Adjust destination path as needed

// Define routes

// Dashboard Custodian Route
router.get('/dashboardCustodian', (req, res) => {
    res.render('custodian/dashboardCustodian'); // Ensure 'dashboardCustodian.ejs' exists in your views folder
});

// Add Transactions Form Route
router.get('/addTransactions', (req, res) => {
    res.render('custodian/addTransactions'); // Ensure this matches your EJS file name
});
router.get('/user', (req, res) => {
    res.render('custodian/user'); // Ensure this matches your EJS file name
});

// POST request to handle adding a transaction (with file uploads)
router.post('/add-transaction', upload.array('receipts[]'), custodianController.addTransaction);
router.post('/add-transaction', (req, res) => {
    console.log('POST /add-transaction hit');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    res.send('Route working!');
  });
  
  

// View Transactions Route
router.get("/custodianViewTrans", custodianController.CustoViewTrans);

// Print Voucher Route
router.get("/printVouch", custodianController.PrintVouch);


// Export the router
module.exports = router;
