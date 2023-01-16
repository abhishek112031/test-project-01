const {Sequelize}=require('sequelize');
const sequelize=new Sequelize('practice-01','root','mysql@2022',{
    dialect:'mysql',
    host:'localhost'
});

module.exports=sequelize;