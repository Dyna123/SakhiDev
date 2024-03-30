const express = require("express");
const dotenv = require("dotenv")
dotenv.config()
const path = require("path");
const fs = require("fs");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var myDataToBeSent;
var phoneNumber;
var friendNumber;
var numberArray=[];
var client;
var latitude;
var longitude;
var data;
let password;    
  
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;

client = require("twilio")(accountSid, authToken);
app.use(express.json());
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://sambhavsharma936:lhNAaZfkfUUjrImB@cluster0.mlsmnlg.mongodb.net/');
}

const registrationSchema= new mongoose.Schema({
  // Contact1:String,
  // Contact2:String,
  // Contact3:String,
  // Contact4:String,
  // Contact5:String,
  // Contact6:String,
  phnNo1:Number,
  phnNo2:Number,
  phnNo3:Number,
  phnNo4:Number,
  phnNo5:Number,
  phnNo6:Number,
  userPhn:Number,
});

const modelRegistration = mongoose.model('CircleData',registrationSchema);

let otpGenerated;
app.use("/static", express.static("static"));
app.use(express.urlencoded());

app.set("view engine", "pug");

app.set("views", path.join(__dirname, "views"));

app.get("/", function (req, res) {
  res.status(200).render("index.pug");
});
 


app.post("/otp.pug",async function (req, res) {
  const name = await req.body.username;
  password =await req.body.password;
  phoneNumber = password; 
  let find=await modelRegistration.findOne({userPhn:password});
  if(find!=null){
    res.status(200).render('emergencyBtn.pug');
  }
  else{
    const arrOfDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    function randomOtpGenerator() {
      otpGenerated = "";
      for (let i = 0; i < 5; i++) {
        otpGenerated += arrOfDigits[Math.floor(Math.random() * 10)];
      }
      console.log(`OTP:${otpGenerated}`);
      return otpGenerated;
    }
  
    const otpToBeSent = randomOtpGenerator(); // Generated OTP

  
    function sendOTP(phoneNumber, OTP) {
      client.messages
        .create({
          body: `Hey sambhav here: ${OTP}`,
          from: "+14807250918",
          to: `+91${phoneNumber}`,
        })
        .then((message) => console.log(message.sid))
        .catch((err) => console.error(err));
    }
    // function sendLocation(friendNumber) {
    //   client.messages
    //     .create({
    //       body: `Your friend is in danger!! Need Help at ${OTP} ASAP!`,
    //       from: "+19147684993",
    //       to: `+91${friendNumber}`,
    //     })
    //     .then((message) => console.log(message.sid))
    //     .catch((err) => console.error(err));
    // }
  
  
  
    // Usage
  // The recipient's phone number
    const generatedOTP = otpToBeSent; // Generated OTP
  
    sendOTP(phoneNumber, generatedOTP);
    console.log(`OTP sent ${name} to ${phoneNumber}`);
    res.status(200).render('otp.pug');
  }
});


function sendLocation(friendNumber,lat,lon) {
  client.messages
    .create({
      body: `Your friend is in danger!! Need Help at latitude:${lat} and longitude:${lon} ASAP!`,
      from: "+14807250918",
      to: `+91${friendNumber}`,
    })
    .then((message) => console.log(message.sid))
    .catch((err) => console.error(err));
}
app.post('/registration.pug',function(req,res){
  const otpEntered=req.body.otpEntered;
  if(otpEntered==otpGenerated){
    res.status(200).render('registration.pug');
  }
  else{
    res.status(404).render('error.pug');
  }
  app.post('/emergencyBtn.pug',function(req,res){
    const myData={
      // Contact1:req.body.Contact1,
      // Contact2:req.body.Contact2,
      // Contact3:req.body.Contact3,
      // Contact4:req.body.Contact4,
      // Contact5:req.body.Contact5,
      // Contact6:req.body.Contact6,
      phnNo1:req.body.phnNo1,
      phnNo2:req.body.phnNo2,
      phnNo3:req.body.phnNo3,
      phnNo4:req.body.phnNo4,
      phnNo5:req.body.phnNo5,
      phnNo6:req.body.phnNo6,
      userPhn:phoneNumber
    }
    myDataToBeSent= new modelRegistration(myData);
    myDataToBeSent.save().then(()=>{
      console.log("Data has been sent to database")
    }).catch(()=>{
      console.log('Error');
    });
    res.status(200).render('emergencyBtn.pug');
  })
})



app.post("/resSend.pug", async function(req, res) {
  try {

    // const lat=await req.body.latitude;
    // const lon=await req.body.longitude;
    // console.log(lat,lon);
    const documents = await modelRegistration.find({userPhn:phoneNumber});
    documents.forEach((doc)=>{
      numberArray=[doc.phnNo1,doc.phnNo2,doc.phnNo3,doc.phnNo4,doc.phnNo5,doc.phnNo6];
    })
    // numberArray.forEach((number)=>{
    //   sendLocation(number,latitude,longitude);
    //   console.log("sent location successfully!!");
    // }) 
    res.status(200).render('resSend.pug');
 
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).render('error.pug');
  }
});
app.post("/resLoc", async function (req, res) {
  data=req.body;
  console.log(data);
  latitude=data.latitude;
  longitude=data.longitude;
  console.log(latitude,longitude);
  const documents = await modelRegistration.find({userPhn:phoneNumber});
  console.log(documents);
  documents.forEach((doc)=>{
    numberArray=[doc.phnNo1,doc.phnNo2,doc.phnNo3,doc.phnNo4,doc.phnNo5,doc.phnNo6];
  })
  console.log(numberArray);
  numberArray.forEach((number)=>{
    sendLocation(number,latitude,longitude);
    console.log("sent location successfully!!");
  }) 
})
//Starting the server::
app.listen(3000, () => {
  console.log("Server is UP!!");
});
