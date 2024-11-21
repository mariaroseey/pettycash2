const models = require('../models');
const sequelize = models.sequelize;

const add_custodianView = (req, res) => {
    res.render("admin/addCustodian");
};

const add_custodian = async (req, res) => {
    const custodian_data = {
        username: req.body.usernameCustodian_data,
        custodian_no: req.body.custodiannum_data,
        password: req.body.passwordCustodian_data,
        custodian_name: req.body.custodianname_data,
        userType: 'custodian'
    };

    try {
        await sequelize.transaction(async (transaction) => {
            // create the user creds
            const user = await models.User.create(
                {
                    username: custodian_data.username,
                    password: custodian_data.password,
                    userType: custodian_data.userType
                }, 
                { transaction }
            );

            // new user is new custodian, they link upon creation
            const custodian = await models.Custodian.create(
                {
                    user_id: user.user_id,
                    custodian_no: custodian_data.custodian_no,
                    custodian_name: custodian_data.custodian_name,
                    status: 'active'
                }, 
                { transaction }
            );

            // new custodian has it's own cashfund
            await models.CashFund.create(
                {
                    user_id: user.user_id,
                    custodian_no: custodian_data.custodian_no,
                    custodian_name: custodian_data.custodian_name,
                    amount: 0.00 // default amount, can be adjusted
                },
                { transaction }
            );

            res.redirect("/addCustodian?message=Success!");
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("/addCustodian?message=ServerError!");
    }
};

const updateCashF_view = async (req, res) => {
    try {
        const custodians = await models.Custodian.findAll({
            include: {
                model: models.User,
                attributes: ['username']
            }
        });
        res.render("admin/updateCashF", { custodians });
    } catch (error) {
        console.error("Error fetching custodians:", error);
        res.render("admin/updateCashF", { custodians: [] });
    }
};


const updateCashFund = async (req, res) => {
    const { custodian, newfund_data } = req.body;
    try {
        const cashFund = await models.CashFund.findOne({
            where: { custodian_no: custodian }
        });

        if (cashFund) {
            cashFund.amount = parseFloat(newfund_data);
            await cashFund.save();
            console.log('Cash fund updated successfully');
            res.redirect("/updateCashFund?message=FundUpdated");
        } else {
            console.log('Cash fund record not found');
            res.redirect("/updateCashFund?message=RecordNotFound");
        }
    } catch (error) {
        console.error("Error updating cash fund:", error);
        res.redirect("/updateCashFund?message=ServerError");
    }
};




const getCustodianData = async (req, res) => {
    const custodianId = req.params.id;
    try {
        const custodian = await models.Custodian.findOne({
            where: { custodian_no: custodianId },
            include: [
                { model: models.User, attributes: [] },  // No need to fetch username if not needed
                { model: models.CashFund, attributes: ['amount'], as: 'cashFund' }
            ]
        });
        
        if (custodian) {
            res.json({
                name: custodian.custodian_name,  // Use custodian_name instead of username
                currentCashFund: custodian.cashFund ? custodian.cashFund.amount : 'N/A'
            });
        } else {
            res.status(404).json({ message: 'Custodian not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



module.exports = {
    add_custodianView,
    add_custodian,
    updateCashF_view,
    updateCashFund,
    getCustodianData
};
