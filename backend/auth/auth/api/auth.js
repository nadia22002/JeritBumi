const express = require("express");
const router = express.Router();

const Middleware = require("../middleware/authMiddleware");
const Validation = require("../helpers/validationHelper");
const AuthHelper = require("../helpers/authHelper");
const GeneralHelper = require("../helpers/generalHelper");

const register = async (request, reply) => {
  try {
    Validation.registerValidation(request.body);

    const { name, email, password, notelp, alamat, role } = request.body;
    const response = await AuthHelper.registerUser({
      name,
      email,
      password,
      notelp,
      alamat,
      role,
    });

    return reply.send(response);
  } catch (err) {
    return reply
      .status(GeneralHelper.statusResponse(err))
      .send(GeneralHelper.errorResponse(err));
  }
};

const login = async (request, reply) => {
  try {
    Validation.loginValidation(request.body);

    const { email, password } = request.body;
    const response = await AuthHelper.login({ email, password });

    return reply.send(response);
  } catch (err) {
    return reply
      .status(GeneralHelper.statusResponse(err))
      .send(GeneralHelper.errorResponse(err));
  }
};

const getProfile = async (request, reply) => {
  try {
    const { verifiedUser } = request.user;
    const response = await AuthHelper.getProfile(verifiedUser.email);

    return reply
      .status(200)
      .json({ message: "Successfully get data", data: response });
  } catch (err) {
    return reply.send(GeneralHelper.errorResponse(err));
  }
};

const changePassword = async (request, reply) => {
  try {
    Validation.changePasswordValidation(request.body);

    const { oldPassword, newPassword } = request.body;
    const { verifiedUser } = request.user;
    const response = await AuthHelper.changePassword(
      verifiedUser.email,
      oldPassword,
      newPassword
    );

    return reply.send(response);
  } catch (err) {
    console.log(err);
    return reply.send(GeneralHelper.errorResponse(err));
  }
};

const getUrlForgotPassword = async (request, reply) => {
  try {
    Validation.urlForgotPasswordValidation(request.body);
    const response = await AuthHelper.getUrlForgotPassword(request.body.email);

    return reply.send(response);
  } catch (err) {
    console.log(err);
    return reply.send(GeneralHelper.errorResponse(err));
  }
};

const changeForgotPassword = async (request, reply) => {
  try {
    Validation.forgotPasswordValidation(request.body);

    const response = await AuthHelper.changeForgotPassword(
      request.params.token,
      request.body.newPassword
    );

    return reply.send(response);
  } catch (err) {
    console.log(err);
    return reply.send(GeneralHelper.errorResponse(err));
  }
};

const hello = async (request, reply) => {
  return reply.send("HELLO");
};

// Gunakan "router" bukan "Router"
router.post("/register", register);
router.post("/login", login);
router.get("/get-profile", Middleware.validateToken, getProfile);
router.put("/change-password", Middleware.validateToken, changePassword);
router.post("/forgot-password", getUrlForgotPassword);
router.get("/forgot-password/change/:token", (req, res) => {
  const { token } = req.params;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Token Reset Password</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f4f8;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .card {
            background-color: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .token {
            font-weight: bold;
            color: #2c3e50;
            word-break: break-all;
            background-color: #ecf0f1;
            padding: 10px;
            border-radius: 6px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Token Reset Password</h2>
          <p>Gunakan token ini di aplikasi untuk mengubah password Anda:</p>
          <div class="token">${token}</div>
        </div>
      </body>
    </html>
  `);
});
router.put("/forgot-password/change/:token", changeForgotPassword);
router.get("/hello", Middleware.validateToken, hello);
router.get("/auth/verify-email/:token", async (req, res) => {
  try {
      console.log("Token received:", req.params.token);
      const result = await AuthHelper.verifyEmail(req.params.token);
      res.status(200).json(result);
  } catch (error) {
      console.error("Error verifying email:", error);
      res.status(400).json({ error: error.message });
  }
});


module.exports = router;
