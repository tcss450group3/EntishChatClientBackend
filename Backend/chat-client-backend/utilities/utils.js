//Get the connection to Heroku Database
let db = require('./sql_conn.js');

// "Use to send emails";
const nodemailer = require("nodemailer");

//We use this create the SHA256 hash
const crypto = require("crypto");

function sendEmail(from, receiver, subj, message) {
    //research nodemailer for sending email from node.
    // https://nodemailer.com/about/
    // https://www.w3schools.com/nodejs/nodejs_email.asp
    //create a burner gmail account 
    //make sure you add the password to the environmental variables
    //similar to the DATABASE_URL and PHISH_DOT_NET_KEY (later section of the lab)

    // async..await is not allowed in global scope, must use a wrapper
    async function main(){

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let account = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        user: account.user, // generated ethereal user
        pass: account.pass // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: "ChatClient <TCSS450.group.three@gmail.com>" , // sender address
        to: receiver.toString, // list of receivers
        subject: subj.toString, // Subject line
        // text: message.toString, // plain text body
        html: message.toString // html body
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);


    //fake sending an email for now. Post a message to logs. 
    console.log('Email sent: ' + message);
}

/**
 * Method to get a salted hash.
 * We put this in its own method to keep consistency
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
function getHash(pw, salt) {
    return crypto.createHash("sha256").update(pw + salt).digest("hex");
}

module.exports = { 
    db, getHash, sendEmail
};


