'use strict';

require('dotenv').config();
const Knex = require('knex');
const crypto = require('crypto');
var multer = require('multer');
const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const HttpStatus = require('http-status-codes');
const fse = require('fs-extra');
const jwt = require('./jwt');
const model = require('./model');
const app = express();

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const uploadDir = process.env.UPLOAD_DIR || './uploaded';

fse.ensureDirSync(uploadDir);

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir)
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname)
//   }
// })

// var upload = multer({ storage: storage });

// var upload = multer({ dest: process.env.UPLOAD_DIR || './uploaded' });

var db = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: +process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    insecureAuth: true
  }
});

let checkAuth = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else {
    token = req.body.token;
  }

  jwt.verify(token)
    .then((decoded) => {
      req.decoded = decoded;
      next();
    }, err => {
      return res.send({
        ok: false,
        error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
        code: HttpStatus.UNAUTHORIZED
      });
    });
}

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => res.send({ ok: true, message: 'Welcome to my api serve!', code: HttpStatus.OK }));

// app.post('/upload', upload.single('file'), (req, res) => {
//   console.log(req.body);
//   console.log(req.file);
//   res.send({ ok: true, message: 'File uploaded!', code: HttpStatus.OK });
// });

// function login ตรวจสอบ username, password และทำการสร้าง token
// app.post('/login', async (req, res) => {
//   var username = req.body.username;
//   var password = req.body.password;
//   console.log(username);
//   console.log(password);
//   // if (username && password) {
//   //   // var encPassword = crypto.createHash('md5').update(password).digest('hex');
//   //   try {
//   //     var rs = await model.doLogin(db, username, password);
//   //     if (rs.length) {
//   //       var token = jwt.sign({ username: username });
//   //       res.send({ ok: true, token: token, id: rs[0].user_id});
//   //     } else {
//   //       res.send({ ok: false, error: 'Invalid username or password!', code: HttpStatus.UNAUTHORIZED });
//   //     }
//   //   } catch (error) {
//   //     console.log(error);
//   //     res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
//   //   }

//   // } else {
//   //   res.send({ ok: false, error: 'Invalid data!', code: HttpStatus.INTERNAL_SERVER_ERROR });
//   // }
// });

//? Login USER *****************************
app.post('/login', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);

  if (username && password) {
    // var encPassword = crypto.createHash('md5').update(password).digest('hex');

    try {
      var rs = await model.doLogin(db, username, password);
      if (rs.length) {
        var token = jwt.sign({ username: username });
        res.send({ ok: true, token: token, id: rs[0].user_id });
      } else {
        res.send({ ok: false, error: 'Invalid username or password!', code: HttpStatus.UNAUTHORIZED });
      }
    } catch (error) {
      console.log(error);
      res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }

  } else {
    res.send({ ok: false, error: 'Invalid data!', code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? Login Owner *****************************
app.post('/loginowner', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);

  if (username && password) {
    // var encPassword = crypto.createHash('md5').update(password).digest('hex');

    try {
      var rs = await model.doLoginOw(db, username, password);
      if (rs.length) {
        var token = jwt.sign({ username: username });
        res.send({ ok: true, token: token, id: rs[0].ow_id });
      } else {
        res.send({ ok: false, error: 'Invalid username or password!', code: HttpStatus.UNAUTHORIZED });
      }
    } catch (error) {
      console.log(error);
      res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }

  } else {
    res.send({ ok: false, error: 'Invalid data!', code: HttpStatus.INTERNAL_SERVER_ERROR });
  }

});
//todo admin ############################################
//? Login Admin *****************************
app.post('/loginadmin', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);

  if (username && password) {
    // var encPassword = crypto.createHash('md5').update(password).digest('hex');

    try {
      var rs = await model.doLoginAdmin(db, username, password);
      if (rs.length) {
        var token = jwt.sign({ username: username });
        res.send({ ok: true, token: token, id: rs[0].ad_id });
      } else {
        res.send({ ok: false, error: 'Invalid username or password!', code: HttpStatus.UNAUTHORIZED });
      }
    } catch (error) {
      console.log(error);
      res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }

  } else {
    res.send({ ok: false, error: 'Invalid data!', code: HttpStatus.INTERNAL_SERVER_ERROR });
  }

});

//todo get list user *******
app.get('/admingetlistuser', checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getDataListUser(db);
    res.send({ ok: true, rows_user: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});


//todo get list user *******
//? แสดงข้อมูล user ********************************
app.get('/getprofileadmin/:ad_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ad_id;
    console.log(id);

    if (id) {
      var rs = await model.getInfoAdmin(db, id);
      res.send({ ok: true, infoadmin: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

app.get('/admingetlistowner', checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getDataListOwner(db);
    res.send({ ok: true, rows_owner: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//todo get list user *******
app.get('/admingetlistnp', checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getDataListNp(db);
    res.send({ ok: true, rows_np: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});


//todo  แสดง Bookings in np  
app.get('/getbookingsbynp/:np_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.np_id;

    console.log(id);

    if (id) {
      var rs = await model.getBookingsbynp(db, id);
      res.send({ ok: true, rsbookbynp: rs });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});


//todo get list user *******
app.get('/admingetlistbookings', checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getDatalistBookings(db);
    res.send({ ok: true, rows_booking: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//todo admin ############################################

app.get('/users', checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getList(db);
    res.send({ ok: true, rows: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

app.post('/users', checkAuth, async (req, res, next) => {
  try {
    var username = req.body.username;
    var password = req.body.password;
    var fullname = req.body.fullname;
    var email = req.body.email;

    if (username && password && email && fullname) {
      var encPassword = crypto.createHash('md5').update(password).digest('hex');
      var data = {
        username: username,
        password: encPassword,
        fullname: fullname,
        email: email
      };
      var rs = await model.save(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? Register User *****************************
app.post('/register', async (req, res, next) => {
  try {
    var user_username = req.body.user_username;
    var user_password = req.body.user_password;
    var user_name = req.body.user_name;
    var user_lastname = req.body.user_lastname;
    var user_phone = req.body.user_phone;
    var user_email = req.body.user_email;
    var user_gender = req.body.user_gender;
    // var user_age = req.body.user_age;
    var user_bday = req.body.user_bday;

    console.log(user_username);
    console.log(user_password);
    console.log(user_name);
    console.log(user_lastname);
    console.log(user_phone);
    console.log(user_email);
    console.log(user_gender);
    // console.log(user_age);
    console.log(user_bday);
    // if (user_username && user_password && user_name && user_lastname && user_phone && user_email && user_gender && user_age) {
    if (user_username && user_password && user_name && user_lastname && user_phone && user_email && user_gender && user_bday) {
      // var encPassword = crypto.createHash('md5').update(password).digest('hex');
      var data = {
        user_username: user_username,
        user_password: user_password,
        user_name: user_name,
        user_lastname: user_lastname,
        user_phone: user_phone,
        user_email: user_email,
        user_gender: user_gender,
        // user_age: user_age,
        user_bday: user_bday,
      };
      var rs = await model.register(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? Register Owner *****************************
app.post('/registerow', async (req, res, next) => {
  try {
    var ow_username = req.body.ow_username;
    var ow_password = req.body.ow_password;
    var ow_name = req.body.ow_name;
    var ow_lastname = req.body.ow_lastname;
    var ow_phone = req.body.ow_phone;
    var ow_email = req.body.ow_email;
    var ow_gender = req.body.ow_gender;
    var ow_bday = req.body.ow_bday;
    console.log(ow_username);
    console.log(ow_password);
    console.log(ow_name);
    console.log(ow_lastname);
    console.log(ow_phone);
    console.log(ow_email);
    console.log(ow_gender);
    console.log(ow_bday);
    if (ow_username && ow_password && ow_name && ow_lastname && ow_phone && ow_email && ow_gender && ow_bday) {
      // var encPassword = crypto.createHash('md5').update(password).digest('hex');
      var data = {
        ow_username: ow_username,
        ow_password: ow_password,
        ow_name: ow_name,
        ow_lastname: ow_lastname,
        ow_phone: ow_phone,
        ow_email: ow_email,
        ow_gender: ow_gender,
        ow_bday: ow_bday,
      };
      var rs = await model.registerow(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? Register Night Place *****************************
app.post('/registernip/:ow_id', checkAuth, async (req, res, next) => {
  try {
    var ow_id = req.params.ow_id;
    var np_name = req.body.np_name;
    var np_about = req.body.np_about;
    var np_phone = req.body.np_phone;
    var np_email = req.body.np_email;
    var np_adress = req.body.np_adress;
    var np_district = req.body.np_district;
    var np_province = req.body.np_province;
    var np_lat = req.body.np_lat;
    var np_long = req.body.np_long;

    console.log(ow_id);
    console.log(np_name);
    console.log(np_about);
    console.log(np_phone);
    console.log(np_email);
    console.log(np_adress);
    console.log(np_district);
    console.log(np_province);
    console.log(np_lat);
    console.log(np_long);

    if (ow_id && np_name && np_phone && np_email && np_adress && np_district && np_province && np_lat && np_long) {
      // if (ow_id && np_name && np_about && np_phone && np_email && np_adress && np_district && np_province) {
      // var encPassword = crypto.createHash('md5').update(password).digest('hex');
      var data = {
        ow_id,
        np_name: np_name,
        np_about: np_about,
        np_phone: np_phone,
        np_email: np_email,
        np_adress: np_adress,
        np_district: np_district,
        np_province: np_province,
        np_lat: np_lat,
        np_long: np_long,
      };
      var rs = await model.registernip(db, data, ow_id);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แก้ไขข้อมูล user ***********************
app.put('/updateuser/:user_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.user_id;
    var user_name = req.body.user_name;
    var user_lastname = req.body.user_lastname;
    var user_phone = req.body.user_phone;
    var user_email = req.body.user_email;

    console.log(user_name);
    console.log(user_lastname);
    console.log(user_phone);
    console.log(user_email);

    if (id && user_name && user_lastname && user_phone && user_email) {
      var data = {
        user_name: user_name,
        user_lastname: user_lastname,
        user_phone: user_phone,
        user_email: user_email
      };
      var rs = await model.updateUser(db, id, data);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แก้ไขข้อมูล Owner ***********************
app.put('/updateowner/:ow_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ow_id;
    var ow_name = req.body.ow_name;
    var ow_lastname = req.body.ow_lastname;
    var ow_phone = req.body.ow_phone;
    var ow_email = req.body.ow_email;

    console.log(ow_name);
    console.log(ow_lastname);
    console.log(ow_phone);
    console.log(ow_email);

    if (id && ow_name && ow_lastname && ow_phone && ow_email) {
      var data = {
        ow_name: ow_name,
        ow_lastname: ow_lastname,
        ow_phone: ow_phone,
        ow_email: ow_email
      };
      var rs = await model.updateOw(db, id, data);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แก้ไขข้อมูล np ***********************
app.put('/updateownip/:np_id', checkAuth, async (req, res, next) => {
  try {
    var np_id = req.params.np_id;
    var np_name = req.body.np_name;
    var np_about = req.body.np_about;
    var np_phone = req.body.np_phone;
    var np_email = req.body.np_email;
    var np_adress = req.body.np_adress;
    var np_district = req.body.np_district;
    var np_province = req.body.np_province;
    // var np_lat = req.body.np_lat;
    // var np_long = req.body.np_long;

    console.log(np_id);
    console.log(np_name);
    console.log(np_about);
    console.log(np_phone);
    console.log(np_email);
    console.log(np_adress);
    console.log(np_district);
    console.log(np_province);
    // console.log(np_lat);
    // console.log(np_long);

    // if (np_id && np_name && np_about && np_phone && np_email && np_adress && np_district && np_province && np_lat && np_long) {
    if (np_id && np_name && np_about && np_phone && np_email && np_adress && np_district && np_province) {
      var data = {
        np_name: np_name,
        np_about: np_about,
        np_phone: np_phone,
        np_email: np_email,
        np_adress: np_adress,
        np_district: np_district,
        np_province: np_province,
        // np_lat: np_lat,
        // np_long: np_long
      };
      var rs = await model.updatenip(db, np_id, data);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});


//? update status ***********************
app.put('/updatestatus/:bk_id', checkAuth, async (req, res, next) => {
  try {
    var bk_id = req.params.bk_id;
    var bk_status = req.body.bk_status;

    console.log(bk_id);
    console.log(bk_status);

    if (bk_id && bk_status) {
      var data = {
        bk_status: bk_status,

      };
      var rs = await model.updateBookingsstatus(db, data, bk_id);
      console.log(rs);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? update status ***********************
app.put('/updatestatusnp/:np_id', checkAuth, async (req, res, next) => {
  try {
    var np_id = req.params.np_id;
    var np_bk_status = req.body.np_bk_status;

    console.log(np_id);
    console.log(np_bk_status);

    if (np_id && np_bk_status) {
      var data = {
        np_bk_status: np_bk_status,

      };
      var rs = await model.updateStatusNp(db, data, np_id);
      console.log(rs);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? del user
app.delete('/delusers/:id', async (req, res, next) => {
  try {

    var id = req.params.id;

    if (id) {
      await model.removeUser(db, id, 'tb_reviews');
      await model.removeUser(db, id, 'tb_booking');
      await model.removeUser(db, id, 'tb_user_img');
      await model.removeUser(db, id, 'tb_user');
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? del reviews
app.delete('/delreviews/:id',async (req, res, next) => {
  try {

    var id = req.params.id;

    if (id) {
      await model.removeReviews(db, id, 'tb_reviews');
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? del bookings
app.delete('/delbookings/:id', async (req, res, next) => {
  try {

    var id = req.params.id;

    if (id) {
      await model.removeBookings(db, id, 'tb_booking');
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? del promotions
app.delete('/delpromotions/:id', async (req, res, next) => {
  try {

    var id = req.params.id;

    if (id) {
      await model.removePromotions(db, id, 'tb_promotions_img');
      await model.removePromotions(db, id, 'tb_promotions');

      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? del owner
app.delete('/delowner/:id',async (req, res, next) => {
  try {

    var id = req.params.id;

    if (id) {

      var data_np = await model.getdata(db, id, 'tb_night_place', 'ow_id');
      
      // console.log(data_np[0].ow_id)

      if (data_np.length > 0) {

        for (var i = 0; i < data_np.length; i++) {

          var data_promotions = await model.getdata(db, data_np[i].np_id, 'tb_promotions', 'np_id');

          await model.removeOwner(db, data_np[i].np_id, 'tb_booking', 'np_id');
          await model.removeOwner(db, data_np[i].np_id, 'tb_night_place_imgs', 'np_id');
          await model.removeOwner(db, data_np[i].np_id, 'tb_night_place_imgs_profile', 'np_id');
          await model.removeOwner(db, data_np[i].np_id, 'tb_promotions', 'np_id');
          await model.removeOwner(db, data_np[i].np_id, 'tb_reviews', 'np_id');

          if (data_promotions.length > 0) {
            for (var j = 0; j < data_promotions.length; j++) {
              await model.removeOwner(db, data_promotions[j].pro_id, 'tb_promotions_img', 'pro_id');
            }
          }
        }
        
        await model.removeOwner(db, id, 'tb_night_place', 'ow_id');

        await model.removeOwner(db, id, 'tb_owner', 'ow_id');

        console.log(data_np)
        console.log(data_promotions)

      }

      res.send({ ok: true });

    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? del np
app.delete('/delnp/:id', async (req, res, next) => {
  try {

    var id = req.params.id;

    if (id) {

      var data_np = await model.getdata(db, id, 'tb_night_place', 'np_id');
      console.log(data_np[0].np_id)
      if (data_np.length > 0) {

        for (var i = 0; i < data_np.length; i++) {

          var data_promotions = await model.getdata(db, data_np[i].np_id, 'tb_promotions', 'np_id');

          await model.removeNp(db, data_np[i].np_id, 'tb_booking', 'np_id');
          await model.removeNp(db, data_np[i].np_id, 'tb_night_place_imgs', 'np_id');
          await model.removeNp(db, data_np[i].np_id, 'tb_night_place_imgs_profile', 'np_id');
          await model.removeNp(db, data_np[i].np_id, 'tb_promotions', 'np_id');
          await model.removeNp(db, data_np[i].np_id, 'tb_reviews', 'np_id');

          if (data_promotions.length > 0) {
            for (var j = 0; j < data_promotions.length; j++) {
              await model.removeNp(db, data_promotions[j].pro_id, 'tb_promotions_img', 'pro_id');
            }
          }
        }
        await model.removeNp(db, id, 'tb_night_place', 'np_id');

        // await model.removeOwner(db, id, 'tb_owner', 'ow_id');

        console.log(data_np)
        console.log(data_promotions)

      }

      res.send({ ok: true });

    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดงข้อมูล user ********************************
app.get('/getprofileuser/:user_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.user_id;
    console.log(id);

    if (id) {
      var rs = await model.getInfoUser(db, id);
      res.send({ ok: true, infouser: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดงข้อมูล Owner ********************************
app.get('/getprofileowner/:ow_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ow_id;
    console.log(id);

    if (id) {
      var rs = await model.getInfoOw(db, id);
      res.send({ ok: true, info: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดงข้อมูล np ********************************
app.get('/getdetailnp/:np_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.np_id;
    console.log(id);

    if (id) {
      var rs = await model.getDetilNp(db, id);
      res.send({ ok: true, infoNp: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดงข้อมูลร้าน by Owner ********************************
app.get('/getdatanpbyow/:ow_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ow_id;

    console.log(id);

    if (id) {
      var rs = await model.getListNpbyOw(db, id, 'SELECT * FROM tb_night_place desc');
      res.send({ ok: true, rows: rs });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดงข้อมูลร้านให้ user *******
app.get('/shownpforuser', checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getDataNp(db);
    res.send({ ok: true, rows: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดงรูปร้านให้ user (list)*******
app.get('/showimgnpforuser/:np_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.np_id;

    var rs = await model.getListImagesNp(db, id);
    res.send({ ok: true, imgsrows: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดงรูปร้านให้ user  ********************************
app.get('/showimgnpforuser', checkAuth, async (req, res, next) => {
  try {

    var rs = await model.getImagesNp(db);
    res.send({ ok: true, imgnp: rs });

    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });

  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง Bookings ให้ user ********************************
app.get('/getbookingsbyuser/:user_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.user_id;

    console.log(id);

    if (id) {
      var rs = await model.getBookingsbyuser(db, id);
      res.send({ ok: true, rsbookbyuser: rs });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง noti Bookings ให้ user ********************************
app.get('/getnotibookingsbyuser/:user_id', checkAuth, async (req, res, next) => {
  try {

    var id = req.params.user_id;

    console.log(id);

    if (id) {
      var rs = await model.getNotiBookingsbyuser(db, id);
      res.send({ ok: true, rsnotibookbyuser: rs });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง Bookings ให้ owner ********************************
app.get('/getbookingsbyow/:ow_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ow_id;

    console.log(id);

    if (id) {
      var rs = await model.getBookingsbyow(db, id);
      res.send({ ok: true, rsbookbyow: rs });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง noti Bookings ให้ owner ********************************
app.get('/getnotibookingsbyow/:ow_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ow_id;

    console.log(id);

    if (id) {
      var rs = await model.getNotiBookingsbyow(db, id);
      res.send({ ok: true, rsnotibookbyow: rs });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง Promotions ให้ owner ********************************
app.get('/getpromotionsnp/:np_id', checkAuth, async (req, res, next) => {
  try {

    var id = req.params.np_id;
    console.log(id);

    if (id) {
      var rs = await model.getPromotionsNp(db, id);
      res.send({ ok: true, rsprobynp: rs });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง image Promotions ให้ user  ********************************
app.get('/showimgproforuser', checkAuth, async (req, res, next) => {
  try {

    var rs = await model.getImagesPromotions(db);
    res.send({ ok: true, imgpro: rs });

    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });

  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? TEST GET
// app.get('/testget', async (req, res, next) => {
//   try {
//     // var id = req.params.;
//     // console.log(id);
//     var rs = await model.getInfoNp(db);
//       res.send({ ok: true, info: rs[0] });

//   } catch (error) {
//     console.log(error);
//     res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
//   }
// });


// ? upload immage profile np ------------------------------------------------------------------
app.use('/public', express.static('public')); app.use('/images', express.static('images'));
// Set The Storage Engine
const imgprofileuserstorage = multer.diskStorage({
  destination: './uploads/images',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  return cb(null, true);

  // if(mimetype && extname){
  //   return cb(null,true);
  // } else {
  //   cb('Error: Images Only!');
  // }
}

const uploadprofileuser = multer({
  storage: imgprofileuserstorage,
  limits: { fileSize: 20480000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array('picture', 12);

//อัพโหลดรูปภาพแจ้งซ่อม (Sendrepair Upload IMG)
var fileImgProfileName = '';

async function uploadImgUser(db, data) {
  return await model.uploadProfileUser(db, data);
}


// async function getRN_NO(){
//   return await model.getRNNO(db);
// } 

app.post('/uploadsprofileuser', function (req, res, next) {
  uploadprofileuser(req, res, (err) => {
    if (err) {
      console.log('error : ' + err)

    } else {
      if (req.files[0].filename == undefined) {
        console.log('Error: No File Selected')

      } else {
        console.log(`uploads/${req.files[0].filename}`);

        try {

          var user_id = model.getUser(db);

          //นำ path รูปมาเก็บไว้ใน ตัวแปร
          fileImgProfileName = req.files[0].filename;
          console.log(user_id);
          console.log(req.files[0].filename);
          console.log(fileImgProfileName);

          if (user_id && fileImgProfileName) {
            var data = {
              user_id: user_id,
              user_img: fileImgProfileName
            };
            var rs = uploadImgUser(db, data);
            console.log(rs);

            return res.send({ ok: true, id: rs[0] });
          } else {
            res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
          }
        } catch (error) {
          console.log(error);
          res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
        }
        // insert db 
        // get RN_NO last insert
        // 
      }
    }
  });
});

// ? upload immage profile ------------------------------------------------------------------
app.use('/public', express.static('public')); app.use('/images', express.static('images'));

// Set The Storage Engine
const profileuserstorage = multer.diskStorage({
  destination: './uploads/images',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  return cb(null, true);

  // if(mimetype && extname){
  //   return cb(null,true);
  // } else {
  //   cb('Error: Images Only!');
  // }
}

const uploadprofileusers = multer({
  storage: profileuserstorage,
  limits: { fileSize: 20480000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array('picture', 12);

//อัพโหลดรูปภาพแจ้งซ่อม (Sendrepair Upload IMG)
var fileImageName = '';

async function uploadImgProfileUser(db, data, id) {
  return await model.sendImages(db, data, id);
}


// async function getRN_NO()
//   return await model.getRNNO(db);
// } f

app.put('/uploads/:user_id', function (req, res, next) {
  uploadprofileusers(req, res, (err) => {
    if (err) {
      console.log('error : ' + err)

    } else {
      if (req.files[0].filename == undefined) {
        console.log('Error: No File Selected')

      } else {
        console.log(`uploads/${req.files[0].filename}`);

        try {
          var user_id = req.params.user_id;

          //นำ path รูปมาเก็บไว้ใน ตัวแปร
          fileImageName = req.files[0].filename;
          console.log(user_id);
          console.log(req.files[0].filename);
          console.log(fileImageName);


          if (user_id && fileImageName) {
            var data = {
              user_img: fileImageName
            };
            var rs = uploadImgProfileUser(db, data, user_id);
            // console.log(rs);

            return res.send({ ok: true, id: rs[0] });
          } else {
            res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
          }
        } catch (error) {
          console.log(error);
          res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
        }
        // insert db 
        // get RN_NO last insert
        // 
      }
    }
  });
});

// ? upload immage profile np ------------------------------------------------------------------
app.use('/public', express.static('public')); app.use('/img_np', express.static('img_np'));

// Set The Storage Engine
const profilenpstorage = multer.diskStorage({
  destination: './uploads/img_np',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  return cb(null, true);

  // if(mimetype && extname){
  //   return cb(null,true);
  // } else {
  //   cb('Error: Images Only!');
  // }
}

const uploadprofilenp = multer({
  storage: profilenpstorage,
  limits: { fileSize: 20480000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array('picture', 12);

//อัพโหลดรูปภาพแจ้งซ่อม (Sendrepair Upload IMG)
var fileProImageName = '';

async function uploadImgProfileNp(db, data) {
  return await model.uploadImagesProfilenp(db, data);
}


// async function getRN_NO(){
//   return await model.getRNNO(db);
// } 

app.post('/uploadsprofilenp', function (req, res, next) {
  uploadprofilenp(req, res, (err) => {
    if (err) {
      console.log('error : ' + err)

    } else {
      if (req.files[0].filename == undefined) {
        console.log('Error: No File Selected')

      } else {
        console.log(`uploads/${req.files[0].filename}`);

        try {

          var np_id = model.getInfoNp(db);

          //นำ path รูปมาเก็บไว้ใน ตัวแปร
          fileProImageName = req.files[0].filename;
          console.log(np_id);
          console.log(req.files[0].filename);
          console.log(fileProImageName);

          if (np_id && fileProImageName) {
            var data = {
              np_id: np_id,
              np_imgspro: fileProImageName
            };
            var rs = uploadImgProfileNp(db, data);
            console.log(rs);

            return res.send({ ok: true, id: rs[0] });
          } else {
            res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
          }
        } catch (error) {
          console.log(error);
          res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
        }
        // insert db 
        // get RN_NO last insert
        // 
      }
    }
  });
});


// ? upload immage Promotions  ------------------------------------------------------------------
app.use('/public', express.static('public')); app.use('/img_pro', express.static('img_pro'));

// Set The Storage Engine
const promotionstorage = multer.diskStorage({
  destination: './uploads/img_pro',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  return cb(null, true);

  // if(mimetype && extname){
  //   return cb(null,true);
  // } else {
  //   cb('Error: Images Only!');
  // }
}

const uploadpromotions = multer({
  storage: promotionstorage,
  limits: { fileSize: 20480000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array('picture', 12);

//อัพโหลดรูปภาพแจ้งซ่อม (Sendrepair Upload IMG)
var filePromotionsImageName = '';

async function uploadImgPromotions(db, data) {
  return await model.uploadImagesPromotions(db, data);
}


// async function getRN_NO(){
//   return await model.getRNNO(db);
// } 

app.post('/uploadsimgpromotions', function (req, res, next) {
  uploadpromotions(req, res, (err) => {
    if (err) {
      console.log('error : ' + err)

    } else {
      if (req.files[0].filename == undefined) {
        console.log('Error: No File Selected')

      } else {
        console.log(`uploads/${req.files[0].filename}`);

        try {

          var pro_id = model.getInfoPromotions(db);

          //นำ path รูปมาเก็บไว้ใน ตัวแปร
          filePromotionsImageName = req.files[0].filename;
          console.log(pro_id);
          console.log(req.files[0].filename);
          console.log(filePromotionsImageName);

          if (pro_id && filePromotionsImageName) {
            var data = {
              pro_id: pro_id,
              pro_img: filePromotionsImageName
            };
            var rs = uploadImgPromotions(db, data);
            console.log(rs);

            return res.send({ ok: true, id: rs[0] });
          } else {
            res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
          }
        } catch (error) {
          console.log(error);
          res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
        }
        // insert db 
        // get RN_NO last insert
        // 
      }
    }
  });
});


// ? upload immage np ------------------------------------------------------------------
app.use('/public', express.static('public')); app.use('/images_np', express.static('images_np'));

// Set The Storage Engine
const imgsnpstorage = multer.diskStorage({
  destination: './uploads/images_np',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  return cb(null, true);

  // if(mimetype && extname){
  //   return cb(null,true);
  // } else {
  //   cb('Error: Images Only!');
  // }
}

const uploadimgsnp = multer({
  storage: imgsnpstorage,
  limits: { fileSize: 20480000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array('picture', 12);

//อัพโหลดรูปภาพแจ้งซ่อม (Sendrepair Upload IMG)
var fileImageName = '';

async function uploadImg(db, data) {
  return await model.uploadImagesnp(db, data);
}

// async function getRN_NO(){
//   return await model.getRNNO(db);
// }

app.post('/uploadsimgnp', function (req, res, next) {
  uploadimgsnp(req, res, (err) => {
    if (err) {
      console.log('error : ' + err)
    } else {
      if (req.files[0].filename == undefined) {
        console.log('Error: No File Selected')

      } else {
        console.log(`uploads/${req.files[0].filename}`);

        try {
          var np_id = model.getInfoNp(db);

          //นำ path รูปมาเก็บไว้ใน ตัวแปร
          fileImageName = req.files[0].filename;

          console.log(req.files[0].filename);
          console.log(fileImageName);
          console.log(np_id);

          if (np_id && fileImageName) {
            var data = {
              np_id: np_id,
              np_img: fileImageName
            };
            var rs = uploadImg(db, data);
            console.log(rs);

            return res.send({ ok: true, id: rs[0] });
          } else {
            res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
          }
        } catch (error) {
          console.log(error);
          res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
        }
        // insert db 
        // get RN_NO last insert
        // 
      }
    }
  });
});

//? add reviews *****************************
app.post('/addreviews/:user_id', checkAuth, async (req, res, next) => {
  try {
    var user_id = req.params.user_id;
    var np_id = req.body.np_id;
    var rev_topic = req.body.rev_topic;
    var rev_detail = req.body.rev_detail;


    console.log(user_id);
    console.log(np_id);
    console.log(rev_topic);
    console.log(rev_detail);

    if (user_id && np_id && rev_topic && rev_detail) {
      // var encPassword = crypto.createHash('md5').update(password).digest('hex');
      var data = {
        user_id,
        np_id: np_id,
        rev_topic: rev_topic,
        rev_detail: rev_detail,
      };
      var rs = await model.addReviews(db, data, user_id);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? add bookings *****************************
app.post('/addbookings/:user_id', checkAuth, async (req, res, next) => {
  try {
    var user_id = req.params.user_id;
    var np_id = req.body.np_id;
    var bk_seat = req.body.bk_seat;
    var bk_detail = req.body.bk_detail;
    var bk_checkin_date = req.body.bk_checkin_date;


    console.log(user_id);
    console.log(np_id);
    console.log(bk_seat);
    console.log(bk_detail);
    console.log(bk_checkin_date);

    if (user_id && np_id && bk_seat && bk_detail && bk_checkin_date) {
      // var encPassword = crypto.createHash('md5').update(password).digest('hex');
      var data = {
        user_id,
        np_id: np_id,
        bk_seat: bk_seat,
        bk_detail: bk_detail,
        bk_checkin_date: bk_checkin_date,
      };
      var rs = await model.addBookings(db, data, user_id);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง reviews ให้ user ********************************
//!------------------------------------
app.get('/getlistreviews/:np_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.np_id;

    console.log(id);

    if (id) {
      var rss = await model.getListReviews(db, id);
      res.send({ ok: true, rowsrev: rss });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง Feed Review ให้ user *******
app.get('/showfeed', checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getListReviewsFeed(db);
    res.send({ ok: true, showfeed: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง reviews ให้ user limit 3 ********************************
app.get('/getlistreviewslimit/:np_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.np_id;

    console.log(id);

    if (id) {
      var rss = await model.getListReviewsLimit(db, id);
      res.send({ ok: true, revlimit: rss });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//? แสดง Promotions ******* *******
app.get('/showpromotions', checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getPromotions(db);
    res.send({ ok: true, showpromotions: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});


//? add Promotions ************************************
app.post('/addpromotions/:np_id', checkAuth, async (req, res, next) => {
  try {

    var np_id = req.params.np_id;
    var pro_topic = req.body.pro_topic;
    var pro_detail = req.body.pro_detail;
    var pro_start = req.body.pro_start;
    var pro_end = req.body.pro_end;

    console.log(np_id);
    console.log(pro_topic);
    console.log(pro_detail);
    console.log(pro_start);
    console.log(pro_end);

    if (np_id && pro_topic && pro_detail && pro_start && pro_end) {
      // var encPassword = crypto.createHash('md5').update(password).digest('hex');
      var data = {
        np_id,
        pro_topic: pro_topic,
        pro_detail: pro_detail,
        pro_start: pro_start,
        pro_end: pro_end,
      };
      var rs = await model.addPromotions(db, data, np_id);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//! error handlers ***** อย่าออกเกินนี้นะจ๊ะ!!!!! <<<<<<<<<<<<<<<<<<<<<<<<<<<<<
if (process.env.NODE_ENV === 'development') {
  app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        ok: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
      }
    });
  });
}

app.use((req, res, next) => {
  res.status(HttpStatus.NOT_FOUND).json({
    error: {
      ok: false,
      code: HttpStatus.NOT_FOUND,
      error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
    }
  });
});



var port = +process.env.WWW_PORT || 3000;

app.listen(port, () => console.log(`Api listening on port ${port}!`));

