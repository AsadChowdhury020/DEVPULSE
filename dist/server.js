

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/database/index.ts
import { Pool } from "pg";

// src/config/dotenv.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  access_secret: process.env.JWT_ACCESS_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN
};
var dotenv_default = config;

// src/database/index.ts
var pool = new Pool({
  connectionString: dotenv_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'contributor' CHECK( role IN ('contributor', 'maintainer')),
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
                type VARCHAR(20) NOT NULL CHECK(type IN ('bug', 'feature_request')),
                status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN('open', 'in_progress', 'resolved')),
                reporter_id INTEGER NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()	
            )
            `);
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (payLoad) => {
  const { name, email, password, role } = payLoad;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
            INSERT INTO users (name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor')) 
            RETURNING *
            `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
            SELECT * FROM users
            `);
  result.rows.map((singleUser) => {
    delete singleUser.password;
  });
  return result;
};
var getSingleUserFromDB = async (id) => {
  const result = await pool.query(`
            SELECT * FROM users WHERE id = $1
            `, [id]);
  delete result.rows[0].password;
  return result;
};
var updateUserFromDB = async (payLoad, id) => {
  const { name, password, role } = payLoad;
  const result = await pool.query(`
            UPDATE users 
            SET name = COALESCE( $1, name),
            password = COALESCE($2, password),
            role = COALESCE($3, role),
            updated_at = NOW()

            WHERE id = $4
            RETURNING *
            `, [name, password, role, id]);
  delete result.rows[0].password;
  return result;
};
var deleteUserFromDB = async (id) => {
  const result = await await pool.query(`
            DELETE FROM users WHERE id = $1
            `, [id]);
  return result;
};
var userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserFromDB,
  deleteUserFromDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully!",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsersFromDB();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users retrived successfully!",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserFromDB(id);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found!",
        data: {}
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User retrived successfully!",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUserFromDB(req.body, id);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found!",
        data: {}
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User updated successfully!",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserFromDB(id);
    if (result.rowCount === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found!",
        data: {}
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User deleted successfully!"
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decode = jwt.verify(token, dotenv_default.access_secret);
      const userData = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [decode.email]);
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "User not found!!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!! This role has no access"
        });
      }
      req.user = decode;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/types/index.role.ts
var USER_ROLES = {
  maintainer: "maintainer",
  contributor: "contributor"
};

// src/modules/user/user.route.ts
var router = Router();
router.post("/", userController.createUser);
router.get("/", auth(USER_ROLES.maintainer), userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
var userRoute = router;

// src/modules/issue/issue.router.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (payLoad) => {
  const { title, description, type, reporter_id } = payLoad;
  const user = await pool.query(
    `
        SELECT id FROM users WHERE id = $1
        `,
    [reporter_id]
  );
  if (user.rows.length === 0) {
    throw new Error("Reporter not found");
  }
  const result = await pool.query(
    `
            INSERT INTO issues (title, description, type, reporter_id ) VALUES ($1, $2, $3, $4)

            RETURNING *
            `,
    [title, description, type, reporter_id]
  );
  return result;
};
var getAllIssuesFromDB = async (filters) => {
  const { sort = "newest", type, status } = filters;
  let query = `SELECT * FROM issues`;
  const values = [];
  const conditions = [];
  if (type) {
    conditions.push(`type = $${values.length + 1}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(status);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (sort === "oldest") {
    query += ` ORDER BY created_at ASC`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(query, values);
  return result;
};
var getAllIssuesCreatedByAnUserFromDB = async (reporterId) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE reporter_id = $1
        `,
    [reporterId]
  );
  return result;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
        `,
    [id]
  );
  return result;
};
var updateIssueFromDB = async (id, payLoad, reporterId, role) => {
  const { title, description, type, status } = payLoad;
  const issueData = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
        `,
    [id]
  );
  if (issueData.rows.length === 0) {
    throw new Error("Issue not found!!");
  }
  if (issueData.rows[0].status !== "open") {
    throw new Error("Cannot update resolved or in_progress issues");
  }
  const result = await pool.query(
    `
        UPDATE issues 
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        updated_at = NOW()

        WHERE id = $5
        RETURNING *

        `,
    [title, description, type, status, id]
  );
  return result;
};
var deleteIssueFromDB = async (id, reporterId) => {
  const issueData = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
        `,
    [id]
  );
  if (issueData.rows.length === 0) {
    throw new Error("Issue not found!!");
  }
  if (issueData.rows[0].reporter_id !== reporterId) {
    throw new Error("Forbidden!!");
  }
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id = $1
        `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB,
  getAllIssuesCreatedByAnUserFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    if (!req.user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found!!"
      });
    }
    const reporterId = req.user.id;
    const payLoad = {
      ...req.body,
      reporter_id: reporterId
    };
    const result = await issueService.createIssueIntoDB(payLoad);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully!",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const result = await issueService.getAllIssuesFromDB({
      sort,
      type,
      status
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssuesCreatedByAnUser = async (req, res) => {
  try {
    if (!req.user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found!!"
      });
    }
    const reporterId = req.user.id;
    const result = await issueService.getAllIssuesCreatedByAnUserFromDB(reporterId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found!"
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found!!"
      });
    }
    const reporterId = req.user.id;
    const role = req.user.role;
    const result = await issueService.updateIssueFromDB(
      id,
      req.body,
      reporterId,
      role
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found!!"
      });
    }
    const reporterId = req.user.id;
    const result = await issueService.deleteIssueFromDB(
      id,
      reporterId
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: {}
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getAllIssuesCreatedByAnUser,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issue/issue.router.ts
var router2 = Router2();
router2.post("/", auth("contributor", "maintainer"), issueController.createIssue);
router2.get("/", auth("contributor", "maintainer"), issueController.getAllIssues);
router2.get("/user", auth("contributor", "maintainer"), issueController.getAllIssuesCreatedByAnUser);
router2.get("/:id", issueController.getSingleIssue);
router2.put("/:id", auth("contributor", "maintainer"), issueController.updateIssue);
router2.delete("/:id", auth("maintainer"), issueController.deleteIssue);
var issueRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserFromDB = async (payLoad) => {
  const { email, password } = payLoad;
  const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid credential!!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credential!!");
  }
  const jwtPayLoad = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtPayLoad, dotenv_default.access_secret, { expiresIn: "1d" });
  const refreshToken = jwt2.sign(jwtPayLoad, dotenv_default.refresh_secret, { expiresIn: "10d" });
  return { accessToken, refreshToken };
};
var generateRefreshTokenFromDB = async (token) => {
  if (!token) {
    throw new Error("Unauthorized access!!");
  }
  const decode = jwt2.verify(token, dotenv_default.refresh_secret);
  const userData = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [decode.email]);
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("User not found!!");
  }
  const jwtPayLoad = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtPayLoad, dotenv_default.access_secret, { expiresIn: "1d" });
  return { accessToken };
};
var authService = {
  loginUserFromDB,
  generateRefreshTokenFromDB
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserFromDB(req.body);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      // In production => true,
      httpOnly: true,
      sameSite: "lax"
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Access token generated successfully!",
      data: result
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var generateRefreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshTokenFromDB(req.cookies.refreshToken);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Access token generated successfully!",
      data: result
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  generateRefreshToken
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/access_token", authController.loginUser);
router3.post("/refresh_token", authController.generateRefreshToken);
var authRoute = router3;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `

Method: ${req.method} - URL : ${req.url} - Time : ${Date.now()}`;
  fs.appendFile("logger.txt", log, (error) => {
    if (error) {
      console.log(error);
    }
  });
  next();
};

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  sendResponse(res, {
    statusCode: 500,
    success: false,
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = express();
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(express.json());
app.use(logger);
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);
app.use("/api/login", authRoute);
app.get("/", (req, res) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Hello from DEVPULSE server!"
  });
});
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var port = dotenv_default.port;
var main = () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`DEVPULSE app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map