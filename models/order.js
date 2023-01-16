const Sequelize=require('sequelize');
const path=require('path');
const sequelize=require('../util/db');
const Order=sequelize.define('order',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
   paymentid:Sequelize.STRING,
   orderid:Sequelize.STRING,
   status:Sequelize.STRING

});
module.exports=Order;