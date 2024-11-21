const models = require('../models'); // Assuming you're using Sequelize for the Transaction model
const multer = require('multer');
const sequelize = models.sequelize;



// Render Add Transaction Page
const addTrans = async (req, res) => {
    res.render("custodian/addTransactions"); // Renders the add transaction form
};

// Render View Transaction Page
const CustoViewTrans = (req, res) => {
    res.render("custodian/custodianViewTrans"); // Ensure the EJS file exists
};
// Render Print Voucher Page
const PrintVouch = async (req, res) => {
    res.render("custodian/printVoucher"); // Renders the print voucher page
};

// Render Custodian Dashboard
const CusDashboard = (req, res) => {
    res.render("custodian/dashboardCustodian"); // Renders the custodian dashboard page
};
const addTransaction = async (req, res) => {
    const transaction_data = {
        transaction_id: req.body.transaction_id,
        transaction_date: req.body.transaction_date,
        amount_given: parseFloat(req.body.amount_given),
        or_no: req.body.or_no,
        description: req.body.description,
        total: parseFloat(req.body.total),
        purchaser: req.body.purchaser,
        employee_id: req.body.employee_id,
        personal_contribution: parseFloat(req.body.personal_contribution) || 0,
        store_name: req.body.store_name,
        custodian_no: req.body.custodian_no,
        items: req.body.items || [] // Expecting an array of items
    };

    try {
        await sequelize.transaction(async (transaction) => {
            // Create the transaction record
            const newTransaction = await models.Transaction.create(
                {
                    transaction_id: transaction_data.transaction_id,
                    transaction_date: transaction_data.transaction_date,
                    amount_given: transaction_data.amount_given,
                    or_no: transaction_data.or_no,
                    description: transaction_data.description,
                    total: transaction_data.total,
                    purchaser: transaction_data.purchaser,
                    employee_id: transaction_data.employee_id,
                    personal_contribution: transaction_data.personal_contribution,
                    store_name: transaction_data.store_name,
                    custodian_no: transaction_data.custodian_no,
                },
                { transaction }
            );

            // Add items linked to the transaction, if available
            if (transaction_data.items.length > 0) {
                const itemsData = transaction_data.items.map((item) => ({
                    transaction_id: newTransaction.transaction_id,
                    item_name: item.item_name,
                    item_price: parseFloat(item.item_price)
                }));

                await models.Item.bulkCreate(itemsData, { transaction });
            }

            // Update the custodian's cash fund after the transaction
            const cashFund = await models.CashFund.findOne({
                where: { custodian_no: transaction_data.custodian_no },
                transaction
            });

            if (cashFund) {
                cashFund.amount -= transaction_data.total;
                await cashFund.save({ transaction });
            }
            console.log("Transaction Model:", models.Transaction);


            res.redirect("custodian/addTransaction?message=TransactionAdded");
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("custodian/addTransactions?message=ServerError");
    }
};

  
  
  


module.exports = {
    addTrans,
    CustoViewTrans,
    PrintVouch,
    CusDashboard,
    addTransaction,// Added the addTransaction function to the exports

    
};
