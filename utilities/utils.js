//Get the connection to Heroku Database
let db = require('./sql_conn.js');





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
        // "Use to send emails";
        const nodemailer = require("nodemailer");


        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "TCSS450.group.three@gmail.com", 
                pass: "Nopassword123$$" 
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: "ChatClient <TCSS450.group.three@gmail.com>" , // sender address
            to: receiver, // list of receivers
            subject: subj, // Subject line
            // text: message.toString, // plain text body
            html: message // html body
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


