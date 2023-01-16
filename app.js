const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const Sequelize = require('sequelize');
const rootDir = require('./util/path');
const sequelize = require('./util/db');

const Expense = require('./models/expense');
const User = require('./models/user');
const Order = require('./models/order');

const auth = require('./middlewares/auth');
const Razorpay = require('razorpay');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const app = express();



app.use(cors());
app.use(bodyParser.json({ extended: false }));

//other nornmal functions:-->
function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, userName: name }, process.env.SECRET_KEY_TOKEN);

}

//user uses:--->
app.get('/getform', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'getform.html'))
});
app.post('/getform', (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, 10, (err, hash) => { //save encripted password in database;

        User.create({
            name: name,
            email: email,
            password: hash
        })
            .then(user => {
                console.log("ctrate user:--->>", user)
                res.status(201).json({ msg: 'user created successfully!' });
            })
            .catch(err => {
                res.status(500).json({ msg: 'Email id already exist' })
            })
    })



});
app.get('/getform/login', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'login.html'))
});
app.post('/getform/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findAll({ where: { email: email } })//array form 
        .then(user => {
            console.log(user[0]);
            if (user.length > 0) {
                bcrypt.compare(password, user[0].password, (err, result) => {
                    if (err) {
                        res.status(500).json({ msg: 'something went wrong' });
                    }
                    else if (result === true) {
                        res.status(200).json({ msg: 'loggedIn successful', status: 'successful', token: generateAccessToken(user[0].id, user[0].name) })

                    }
                    else {

                        return res.status(400).json({ success: false, message: 'Incorrect Password! Please refresh the page and Enter again' })


                    }
                })

            }
            else {
                return res.status(404).json({ success: false, message: 'user does not exist' })

            }
        })
        .catch(err => {
            res.status(500).json(err);
        })
});

//purchase:--->
app.get('/user/add-expense', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'expenses.html'))
});
app.post('/user/add-expense', auth, (req, res, next) => {
    const amount = req.body.amount;
    const description = req.body.description;

    req.user.createExpense({
        amount: amount,
        description: description
    })
        .then(userExp => {
            console.log("userExp====>>>>", userExp.amount);
            res.status(201).json(userExp);
        })
        .catch(err => {
            res.status(500).json(err);
        })

});
app.get('/user/expense/get-all', auth, (req, res, next) => {
    Expense.findAll({ where: { userId: req.user.id } })
        .then(userExp => {
            res.status(200).json({ userExp: userExp, userName: req.user.name });
        })
        .catch(err => {
            res.status(500).json(err);
        })

});
app.get('/user/rzp/premium-membership', auth, async (req, res, next) => {

    //instantiate razorpay object:--> currently working on
    try {
        const rzp = new Razorpay({
            key_id: 'rzp_test_BTrefcF9EaGjmx' ,
            key_secret: 'ljscIUtx64OgRwtS6cBNjnQn'
        });
        const amount = 2500;
        rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
            console.log("order--->",order);
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            req.user.createOrder({ orderid: order.id, status: 'PENDING' }).then(() => {
                return res.status(201).json({ order, key_id: rzp.key_id })
            })
            .catch(err => {
                    throw new Error(err);
                })

        })
    }
    catch (err) {
        console.log("err----->>>>", err);
        res.status(403).json({ message: 'something went wrong', Error: err });
    }


})
app.post('/user/rzp/premium-membership/updateTrasactionStatus',auth,async(req,res,next)=>{
    try{
        const { payment_id,order_id}=req.body;
        const order=await Order.findOne({where:{orderid:order_id}})
        const p1=order.update({paymentid:payment_id,status:'SUCCESSFUL'});
        const p2=req.user.update({isPremiumUser:true});
        Promise.all([p1,p2])
        .then(()=>{

            return res.status(202).json({success:true,message:'Transaction Successful'});
        })
        .catch(err=>{
            throw new Error(err);
        })


    }
    catch(err){
        res.status(500).json(err);
    }
})



//relations:--->
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

sequelize
    .sync()
    .then(() => {
        app.listen(4000)

    })