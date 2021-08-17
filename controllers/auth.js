const { pool } = require("../config/dbconfig");
const bcrpt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transport } = require("../config/nodemailerConfig");
const salt = 10;

async function register(req, res) {
  console.log("Register request recieved", req.body);
  const userData = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  try {
    /*------ REGISTER USER ------*/
    let result = await pool.query(
      `SELECT username, email FROM users WHERE username = $1 OR email = $2`,
      [userData.username, userData.email]
    );
    if (result.rows.length === 0) {
      bcrpt.hash(userData.password, salt, async (err, hashPassword) => {
        if (err) {
          console.log(err);
          return res.json({
            message: "internal server error",
            errcode: "#201",
          });
        } else {
          try {
            let result_1 = await pool.query(
              `INSERT INTO users (name, username, email, password, verified) VALUES ($1, $2, $3, $4, $5)`,
              [
                userData.name,
                userData.username,
                userData.email,
                hashPassword,
                "false",
              ]
            );
            return res.json({
              message: "user successfully registered",
            });
          } catch (err) {
            console.log(err);
            return res.json({
              message: "internal server error",
              errcode: "#102",
            });
          }
        }
      });
    } else {
    /*------ CHECK IF THE USER EXIST OR NOT ------*/
      if (result.rows[0].email == userData.email) {
        return res.json({
          message: "user already registered",
        });
      } else {
        return res.json({
          message: "username already exist",
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.json({
      message: "internal server error",
      errcode: "#101",
    });
  }
}

async function login(req, res) {
  userData = {
    email: req.body.email,
    password: req.body.password,
  };
  console.log("login request recieved", userData);
  try {
    let result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      userData.email,
    ]);
    if (result.rows.length === 1) {
      bcrpt.compare(
        userData.password,
        result.rows[0].password,
        async (err, match) => {
          if (err) {
            console.log(err);
            return res.json({
              message: "internal sever error",
              errcode: "#202",
            });
          } else {
            if (match) {
              const user = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                username: result.rows[0].username,
                email: result.rows[0].email,
                verified: result.rows[0].verified,
              };
              jwt.sign(
                {
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  verified: user.verified,
                },
                process.env.SECRET_KEY,
                { expiresIn: "60m" },
                (err, token) => {
                  if (err) {
                    console.log(err);
                    return res.json({
                      message: "internal server error",
                      errcode: "#301",
                    });
                  } else {
                    return res.json({
                      message: "user logged in successfully",
                      token: token,
                    });
                  }
                }
              );
            } else {
              return res.json({
                message: "password incorrect",
              });
            }
          }
        }
      );
    } else if (result.rows.length === 0) {
      return res.json({
        message: "user not found",
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      message: "internal server error",
      errcode: "#101",
    });
  }
}

async function verifyToken(req, res) {
  token = req.headers.authorization.split(" ")[1];
  console.log("verifyToken request recieved");
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      if (err.name == "TokenExpiredError") {
        return res.json({
          message: "token expired",
        });
      } else if (
        err.name == "JsonWebTokenError" &&
        err.message == "jwt malformed"
      ) {
        return res.json({
          message: "jwt malformed",
        });
      } else if (
        err.name == "JsonWebTokenError" &&
        err.message == "invalid token"
      ) {
        return res.json({
          message: "invalid token",
        });
      } else {
        return res.json({
          message: "token expired",
        });
      }
    } else {
      return res.json({
        message: "verified",
        user,
      });
    }
  });
}

async function sendEmailLink(req, res) {
  console.log("email verification sending link request recieved");
  let user = req.body;
  console.log(user);

  let emailToken = await jwt.sign(
    { email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: "2min" }
  );

  const url = `https://${process.env.SITE_URL}/auth/verifyUserEmail/${emailToken}`;

  const html = `<h1>hey, ${user.name}</h1>
                        <h3>Account Verification</h3>
                        <p>Thank you for trying out blogg. Before you are able post blogs, you must verify your email.
                        </p>
                        <p>Click on the following link to verify your email address:</p>
                        <a href="${url}">VERIFY</a>`;

  const mailOptions = {
    from: `"blogg" <${process.env.EMAIL}>`,
    to: user.email,
    subject: "Account Verification",
    html: html,
  };

  /*---------- SENDING MAIL TO PROVIDED EMAIL ADDRESS ----------*/
  transport.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      return res.json({
        message: "internal server error",
        errcode: "#401",
      });
    } else {
      console.log("mail sent");
      return res.json({
        message: "email verification link sent",
      });
    }
  });
}

async function verifyUserEmail(req, res) {
  let token = req.params.emailToken;
  jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
    if (err) {
      console.log(err);
      let errorResponse = `<!DOCTYPE html>
                                    <html lang="en">

                                    <head>
                                        <meta charset="UTF-8">
                                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <title>Email Verification</title>
                                        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                                        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
                                        <style>
                                            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap');

                                            body {
                                                width: 100vw;
                                                height: 100vh;
                                                margin: 0px;
                                                padding: 0px;
                                                font-family: 'Poppins', sans-serif;
                                                ;
                                                background: #eeeeee;
                                            }

                                            .material-icons.md-64 {
                                                font-size: 64px;
                                            }

                                            .material-icons.green600 {
                                                color: red;
                                            }

                                            .container {
                                                width: 100%;
                                                height: 100%;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                            }

                                            .message-box {
                                                padding: 20px;
                                                display: flex;
                                                justify-content: center;
                                                width: 40%;
                                                background: rgba(255, 0, 0, 0.05);
                                                border: 2px solid red;
                                                border-radius: 5px;
                                            }

                                            .tick {
                                                width: 100%;
                                                display: flex;
                                                flex-direction: column;
                                                align-items: center;
                                            }

                                            .tick div:nth-child(1) {
                                                display: flex;
                                                justify-content: center;

                                            }
                                            a {
                                                text-decoration: none;
                                                font-weight: bolder;
                                            }
                                        </style>
                                    </head>

                                    <body>
                                        <div class="container">
                                            <div class="message-box">
                                                <div class="tick">
                                                    <div><span class="material-icons md-64 green600">gpp_maybe</span></div>
                                                    <div>Error: ${err.message}</div>
                                                    <div>Verification failed</div>
                                                    <div>Click here to go to the <a href="https://letsblogg.netlify.app/views/homepage/homepage.html">blogg</a></div>
                                                </div>
                                            </div>
                                        </div>
                                    </body>

                                    </html>`;
      return res.send(errorResponse);
    } else {
      try {
        let result = await pool.query(
          `UPDATE users SET verified = $1 WHERE email = $2`,
          ["true", user.email]
        );
        let response = `<!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Email Verification</title>
                                        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                                        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
                                    <style>
                                        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap');

                                        body{
                                            width: 100vw;
                                            height: 100vh;
                                            margin: 0px;
                                            padding: 0px;
                                            font-family: 'Poppins', sans-serif;;
                                            background: #eeeeee;
                                        }
                                        .material-icons.md-64 { font-size: 64px; }
                                        .material-icons.green600 { color: green; }
                                        .container{
                                            width: 100%;
                                            height: 100%;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                        }
                                        .message-box{
                                            padding: 20px;
                                            display: flex;
                                            justify-content: center;
                                            width: 40%;
                                            background: rgba(0, 255, 0, 0.05);
                                            border: 2px solid green;
                                            border-radius: 5px;
                                        }
                                        .tick{
                                            width: 100%;
                                            display: flex;
                                            flex-direction: column;
                                            justify-content: space-evenly;
                                        }
                                        .tick div:nth-child(1){
                                            display: flex;
                                            justify-content: center;

                                        }
                                        a{
                                            text-decoration: none;
                                            font-weight: bolder;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="message-box">
                                            <div class="tick">
                                                <div><span class="material-icons md-64 green600">verified_user</span></div>
                                                <div>Thank you for verifying your E-mail. You will now be able to write public blogs. Be sure to <strong>RE-LOGIN</strong> to your account.</div>
                                                <div>Click here to go to the <a href="https://letsblogg.netlify.app/views/homepage/homepage.html">blogg</a></div>
                                            </div>
                                        </div>
                                    </div>
                                </body>
                                </html>`;
        return res.send(response);
      } catch (err) {
        console.log(err);
        let errorResponse = `<!DOCTYPE html>
                                    <html lang="en">

                                    <head>
                                        <meta charset="UTF-8">
                                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <title>Email Verification</title>
                                        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                                        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
                                        <style>
                                            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap');

                                            body {
                                                width: 100vw;
                                                height: 100vh;
                                                margin: 0px;
                                                padding: 0px;
                                                font-family: 'Poppins', sans-serif;
                                                ;
                                                background: #eeeeee;
                                            }

                                            .material-icons.md-64 {
                                                font-size: 64px;
                                            }

                                            .material-icons.green600 {
                                                color: red;
                                            }

                                            .container {
                                                width: 100%;
                                                height: 100%;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                            }

                                            .message-box {
                                                padding: 20px;
                                                display: flex;
                                                justify-content: center;
                                                width: 40%;
                                                background: rgba(255, 0, 0, 0.05);
                                                border: 2px solid red;
                                                border-radius: 5px;
                                            }

                                            .tick {
                                                width: 100%;
                                                display: flex;
                                                flex-direction: column;
                                                align-items: center;
                                            }

                                            .tick div:nth-child(1) {
                                                display: flex;
                                                justify-content: center;

                                            }
                                            a {
                                                text-decoration: none;
                                                font-weight: bolder;
                                            }
                                        </style>
                                    </head>

                                    <body>
                                        <div class="container">
                                            <div class="message-box">
                                                <div class="tick">
                                                    <div><span class="material-icons md-64 green600">gpp_maybe</span></div>
                                                    <div>Error: ${err.message}</div>
                                                    <div>Verification failed</div>
                                                    <div>Click here to go to the <a href="https://letsblogg.netlify.app/views/homepage/homepage.html">blogg</a></div>
                                                </div>
                                            </div>
                                        </div>
                                    </body>

                                    </html>`;
        return res.send(errorResponse);
      }
    }
  });
}

async function sendResetLink(req, res) {
  email = req.body.email;
  console.log("reset-link request recieved", email);
  try {
    let result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    if (result.rows.length == 1) {
      user = result.rows[0];
      let emailToken = await jwt.sign({ email }, process.env.SECRET_KEY, {
        expiresIn: "2min",
      });

      const url = `https://${process.env.FRONTEND_URL}/password-reset.html?emailtoken=${emailToken}`;

      const html = `<h1>hey, ${user.name}</h1>
                        <h3>Password reset request</h3>
                        <p>I looks like you forgot your password. Don't worry! click link below to change your password.
                        </p>
                        <p>Click on the following link to go to password reset page:</p>
                        <a href="${url}">VERIFY</a>`;

      const mailOptions = {
        from: `"blogg" <${process.env.EMAIL}>`,
        to: user.email,
        subject: "Password reset",
        html: html,
      };

      /*---------- SENDING MAIL TO PROVIDED EMAIL ADDRESS ----------*/
      transport.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          return res.json({
            message: "internal server error",
            errcode: "#401",
          });
        } else {
          console.log("mail sent");
          return res.json({
            message: "password reset link send",
          });
        }
      });
    } else if (result.rows.length == 0) {
      return res.json({
        message: "user not found",
      });
    } else {
      return res.json({
        message: "something went wrong",
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      message: "internal server error",
      errcode: "#101",
    });
  }
}

async function resetPassword(req, res) {
  token = req.headers.authorization.split(" ")[1];
  console.log("reset-password request recieved", token);
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      if (err.name == "TokenExpiredError") {
        return res.json({
          message: "token expired",
        });
      } else if (
        err.name == "JsonWebTokenError" &&
        err.message == "jwt malformed"
      ) {
        return res.json({
          message: "jwt malformed",
        });
      } else if (
        err.name == "JsonWebTokenError" &&
        err.message == "invalid token"
      ) {
        return res.json({
          message: "invalid token",
        });
      } else {
        return res.json({
          message: "token expired",
        });
      }
    } else {
      let newpassword = req.body.password;
      bcrpt.hash(newpassword, 10, (err, newhash) => {
        if (err) {
          console.log(err);
          return res.json({
            message: "internal server error",
          });
        } else {
          try {
            let result = pool.query(
              `UPDATE users SET password = $1 WHERE email = $2`,
              [newhash, user.email]
            );
            return res.json({
              message: "password reset successfully",
            });
          } catch (err) {
            console.log(err);
            return res.json({
              message: "internal server error",
              errcode: "#103",
            });
          }
        }
      });
    }
  });
}

module.exports = {
  register,
  login,
  verifyToken,
  sendEmailLink,
  verifyUserEmail,
  sendResetLink,
  resetPassword,
};
