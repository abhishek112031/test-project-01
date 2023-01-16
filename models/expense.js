const Sequelize=require('sequelize');
const sequelize=require('../util/db');
const Expense = sequelize.define('expense',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
   amount:Sequelize.INTEGER,

   description:Sequelize.STRING

});
module.exports=Expense;