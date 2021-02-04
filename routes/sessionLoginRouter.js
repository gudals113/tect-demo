const express = require('express');
const app = express();
const router = require('express').Router();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const Admin = require('../firebase/index');
app.use(cookieParser())


const User = require('../models/user')
const {CHECK_SESSION, CHECK_USER, VERIFY_SESSION,MAKE_SESSION} =require('../firebase/sessionAuth');


//Route
//Profile
router.get('/profile', async (req,res)=>{
    const user =await CHECK_USER(req, res)
    user ? res.json(user) : res.json("NO USER") //redirect to create Account
})


router.get('/account', async (req,res)=>{
    const decodedClaims = await CHECK_SESSION(req, res)
    res.json(decodedClaims)
})


//Create USER DATA
router.post('/account', async (req, res) => {
    const sessionCookie = await MAKE_SESSION(req, res)
    const decodedClaims = await VERIFY_SESSION(sessionCookie)
    // console.log(sessionCookie)
    // console.log(firebase_uid)

    const user = new User();
    user.email = decodedClaims.email
    user.nickname = req.body.nickname
    user.points= req.body.points

    //DB에 저장
    user.save((err) => {
        if (err) {
            console.log(err, "data save error");
            res.json({ result: 0 });
            return
        } else {
            res.json({ result: 1 });
        }
    })
    // res.json("SUCCESS MAKING USER DATA")
})
    
    
router.post('/forgot', async(req,res)=>{
    //
})

//프론트에서 보내준 firebaseToken 이용, session cookie 생성
//Login
router.post('/sessionLogin', async (req, res) => {
    await MAKE_SESSION(req, res)
    res.json("session login 성공")
})

//Logout
router.get('/sessionLogout', async (req, res) => {
    try{
        await res.clearCookie('loginSession');
        const decodedClaims = await CHECK_SESSION(req, res)
        await Admin.revokeRefreshTokens(decodedClaims.sub)
        res.redirect('/')
    } catch(err) {
        res.json(err)
        //res.redirect('/')
    }
   
});

module.exports = router;
