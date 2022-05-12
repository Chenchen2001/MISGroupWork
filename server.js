const express = require('express'); // 导入express中间件
const mysql = require('mysql'); // 导入mysql联络驱动
const log4js = require("log4js");   // 导入日志配置文件
const app = express()   // 激活express中间件

let log = log4js.getLogger("Management");   // 激活日志并配置
log4js.configure({
    appenders: {
        infoLogs: { 
            type: 'dateFile',
            filename: './logs/server_log',
            backups:5,  // 仅保留最新的五个日志文件
            pattern: ".yyyy-MM-dd", // 用于确定何时滚动日志的模式
            alwaysIncludePattern: true,
            compress: true
        },
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: [ 'infoLogs', 'console' ], level: 'all' }
    }
  });

const conn = mysql.createConnection({   // 激活与数据库的链接
    host: 'localhost',
    user: 'root',
    password: '<yourPassWordHere>',
    database: 'MIS'
    });
let sql;
let id = '00000000';
let pwd = '00000000';
conn.connect();

// 维持与数据库的链接 避免每8h断开一次
setInterval(function(){conn.query('select name from users where id=10000000;',(err,result)=>{})},7200000);

// 处理报错
process.on('uncaughtException', err => {
    log.error(err && err.stack)
});

// 登陆验证 D
app.get('/login', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query
        id = params.id;
        pwd = params.pwd;
        sql = `select password,user_name,authority from users where user_id='${id}';`;
        conn.query(sql, (err, result)=>{
            if(result[0]==undefined){
                sqlpwd = 'None';
            }else{
                sqlpwd = result[0].password;
                name = result[0].user_name;
                authority = result[0].authority;
            }
            if(pwd === sqlpwd){
                if(authority == 2){
                    log.info(id+" tried to login as student, success.");
                    response.send("S,"+name);     // 找到密码且正确
                }else if(authority == 1){
                    log.info(id+" tried to login as teacher, success.");
                    response.send("T,"+name);     // 找到密码且正确
                }else{
                    log.info(id+" tried to login as manager, success.");
                    response.send("M,"+name);     // 找到密码且正确
                }
            }else if(sqlpwd === 'None'){
                log.info(id+" tried to login, no such account.");
                response.send('no');    // 账号不存在
            }else{
                log.info(id+" tried to login, failed.");
                response.send("N");     // 找到密码且错误
            }
        })
    }catch(e){
        response.send('err')
    }
})

// 查询成绩 D
app.get('/search', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.student_id;
        semester = params.semester;
        course_name = params.course_name ? params.course_name : '';
        sqlAuth = `select authority from users where user_id='${id}';`
        conn.query(sqlAuth,(err,result)=>{
            auth = result[0].authority;
        })
        if(auth >= 2){
            sql = `select lessons.course_id,courses.course_name,courses.credit,main.score 
            from main left join lessons on main.course_recog=lessons.course_recog 
            left join courses on courses.course_id=lessons.course_id where student_id="${id}" and lessons.semester="${semester}" and 
            courses.course_name like "%${course_name}%" order by lessons.course_id;`;
        }else if(auth >= 1){
            course_id = params.course_id ? params.course_id : '';
            class_id = params.class_id ? params.class_id : '';
            if(params.forEmpty == 'true'){
                sql = `select main.student_id,lessons.class_id,lessons.course_id,courses.course_name,courses.credit,main.score 
                from main left join lessons on main.course_recog=lessons.course_recog 
                left join courses on courses.course_id=lessons.course_id where teacher_id="${id}" and lessons.semester="${semester}" and 
                courses.course_name like "%${course_name}%" and lessons.course_id like "%${course_id}%" and lessons.class_id like "%${class_id}%" 
                and main.score is null order by lessons.course_id limit 0,200;`;
            }else{
                sql = `select main.student_id,lessons.class_id,lessons.course_id,courses.course_name,courses.credit,main.score 
                from main left join lessons on main.course_recog=lessons.course_recog 
                left join courses on courses.course_id=lessons.course_id where teacher_id="${id}" and lessons.semester="${semester}" and 
                courses.course_name like "%${course_name}%" and lessons.course_id like "%${course_id}%" and lessons.class_id like "%${class_id}%" 
                order by lessons.course_id limit 0,200;`;
            }
        }else{
            teacher_id = params.teacher_id ? params.teacher_id : '';
            course_id = params.course_id ? params.course_id : '';
            class_id = params.class_id ? params.class_id : '';
            if(params.forEmpty == 'true'){
                sql = `select main.student_id,lessons.class_id,lessons.course_id,lessons.teacher_id,courses.course_name,courses.credit,main.score 
                from main left join lessons on main.course_recog=lessons.course_recog 
                left join courses on courses.course_id=lessons.course_id where lessons.semester="${semester}" and 
                courses.course_name like "%${course_name}%" and lessons.teacher_id like "%${teacher_id}%" and lessons.course_id like "%${course_id}%" 
                and lessons.class_id like "%${class_id}%" and main.score is null order by lessons.course_id limit 0,200;`;
            }else{
                sql = `select main.student_id,lessons.class_id,lessons.course_id,lessons.teacher_id,courses.course_name,courses.credit,main.score 
                from main left join lessons on main.course_recog=lessons.course_recog 
                left join courses on courses.course_id=lessons.course_id where lessons.semester="${semester}" and 
                courses.course_name like "%${course_name}%" and lessons.teacher_id like "%${teacher_id}%" and lessons.course_id like "%${course_id}%" 
                and lessons.class_id like "%${class_id}%" order by lessons.course_id limit 0,200;`;
            }
        }
        conn.query(sql, (err, result)=>{
            log.info(id+" searched for his/her score.");
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// 成绩大表 D
app.get('/all-search', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.student_id;
        sql = `select lessons.course_id,lessons.semester,courses.course_name,courses.credit,main.score 
        from main left join lessons on main.course_recog=lessons.course_recog 
        left join courses on courses.course_id=lessons.course_id where student_id="${id}" order by lessons.semester,lessons.course_id;`;
        conn.query(sql, (err, result)=>{
            log.info(id+" searched for his/her score.");
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// 学生权限判断 D
app.get('/anthority-student', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.user_id;
        sql = `select authority from users where user_id='${id}';`;
        conn.query(sql, (err, result)=>{
            if(err===null && result){
                if(result){
                    try{
                        if(result[0].authority <= 2){
                            log.info(id+" tried to get student's admission, passed.");
                            response.send("true");
                        }else{
                            log.info(id+" tried to get student's admission, failed.");
                            response.send("false");
                        }
                    }catch{
                        response.send('err');
                        log.warn("unknown user tried to get student's admission, failed.");
                    }
                }else{
                    log.info(id+" tried to get student's admission, failed.");
                    response.send("false");
                }
            }else{
                response.send('err');
            }
        })}catch(e){
            response.send('err');
        }
})

// 教师权限判断 D
app.get('/anthority-teacher', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.user_id;
        sql = `select authority from users where user_id='${id}';`;
        conn.query(sql, (err, result)=>{
            if(err===null && result){
                if(result){
                    try{
                        if(result[0].authority <= 1){
                            log.info(id+" tried to get teacher's admission, passed.");
                            response.send("true");
                        }else{
                            log.info(id+" tried to get teacher's admission, failed.");
                            response.send("false");
                        }
                    }catch{
                        response.send('err');
                        log.warn("unknown user tried to get teacher's admission, failed.");
                    }
                }else{
                    log.info(id+" tried to get teacher's admission, failed.");
                    response.send("false");
                }
            }else{
                response.send('err');
            }
        })}catch(e){
            response.send('err');
        }
})

// 管理员权限判断 D
app.get('/anthority-admin', (request, response)=>{    
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.user_id;
        sql = `select authority from users where user_id='${id}';`;
        conn.query(sql, (err, result)=>{
            if(err===null && result){
                if(result){
                    try{
                        if(result[0].authority == 0){
                            log.info(id+" tried to get admin's admission, passed.");
                            response.send("true");
                        }else{
                            log.info(id+" tried to get admin's admission, failed.");
                            response.send("false");
                        }
                    }catch{
                        response.send('err');
                        log.warn("unknown user tried to get admin's admission, failed.");
                    }
                }else{
                    log.info(id+" tried to get admin's admission, failed.");
                    response.send("false");
                }   
            }else{
                response.send('err');
            }
        })
    }catch(e){
        response.send('err');
    }
})

// ScoreAdd获取名册 D
app.get('/get-roll-for-score-add', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        sql = `select main.student_id, users.user_name from main left join users 
        on main.student_id=users.user_id where course_recog = (select course_recog from lessons 
        where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" and class_id="${class_id}") 
        and main.score is null order by main.student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of '${course_id}' '${class_id}' '${semester}' in ScoreAdd`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreAdd传递数据 D
app.get('/post-score-for-score-add', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        student_id = params.student_id;
        teacher_id = params.teacher_id;
        score = params.score;
        postscript = params.postscript;
        teacher_no = params.class_id;
        course_id = params.course_id;
        semester = params.semester;
        sql = `update main set score=${score},postscript='${postscript}' where student_id="${student_id}" and course_recog = (select course_recog from lessons 
            where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" and class_id="${teacher_no}");`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} added score to ${student_id}'s ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in ScoreAdd.`);
            response.send("done");
        });
    }catch(e){
        response.send('err');
        log.warn(`${teacher_id} failed to add score to ${student_id}'s ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in ScoreAdd.`);
    }
})

// ScoreUpdate获取名册 with student_id
app.get('/get-roll-for-score-update-with-student-id', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        let student_id = params.student_id;
        sql = `select main.student_id, users.user_name,main.score from main left join users 
        on main.student_id=users.user_id where course_recog = (select course_recog from lessons 
        where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" 
        and lessons.class_id = "${class_id}") and main.score is not null and main.student_id="${student_id}";`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of ${course_id} ${class_id} ${semester} in ScoreUpdate.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreUpdate获取名册 without student_id D
app.get('/get-roll-for-score-update-without-student-id', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        sql = `select main.student_id, users.user_name,main.score from main left join users 
        on main.student_id=users.user_id where course_recog = (select course_recog from lessons 
        where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" 
        and lessons.class_id = "${class_id}") and main.score is not null;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of ${course_id} ${class_id} ${semester} in ScoreUpdate.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreUpdate传递数据 D
app.get('/post-score-for-score-update', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        student_id = params.student_id;
        teacher_id = params.teacher_id;
        score = params.score;
        postscript = params.postscript;
        teacher_no = params.class_id;
        course_id = params.course_id;
        semester = params.semester;
        sql = `update main set score=${score},postscript='${postscript}' where student_id="${student_id}" and course_recog = (select course_recog from lessons 
            where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" and class_id="${teacher_no}");`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} update score to ${student_id}'s ${course_id} ${teacher_no} ${semester} with ${score} and 
            postscript '${postscript}' in ScoreUpdate.`);
            response.send("done");
        });
    }catch(e){
        response.send('err');
        log.warn(`${teacher_id} failed to update score to ${student_id}'s ${course_id} ${teacher_no} ${semester} with ${score} and 
        postscript '${postscript}' in ScoreUpdate.`);
    }
})

// ScoreDelete获取名册 with student_id D
app.get('/get-roll-for-score-delete-with-student-id', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        let student_id = params.student_id;
        sql = `select main.student_id, users.user_name,main.score from main left join users 
        on main.student_id=users.user_id where course_recog = (select course_recog from lessons 
        where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" 
        and class_id="${class_id}") and main.score is not null and main.student_id="${student_id}";`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of ${course_id} ${class_id} ${semester} in ScoreDelete.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreDelete获取名册 without student_id D
app.get('/get-roll-for-score-delete-without-student-id', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        sql = `select main.student_id, users.user_name,main.score from main left join users 
        on main.student_id=users.user_id where course_recog = (select course_recog from lessons 
        where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" 
        and class_id="${class_id}") and main.score is not null order by main.student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of ${course_id} ${class_id} ${semester} in ScoreDelete.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreDelete操作 D
app.get('/post-for-score-delete', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        student_id = params.student_id;
        teacher_id = params.teacher_id;
        postscript = params.postscript;
        teacher_no = params.class_id;
        course_id = params.course_id;
        semester = params.semester;
        sql = `update main set score=null ,postscript="${postscript}" where student_id="${student_id}" and course_recog = (select course_recog from lessons 
            where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" and class_id="${teacher_no}");`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} deleted score of ${student_id}'s ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in ScoreDelete.`);
            response.send("done");
        });
    }catch(e){
        log.warn(`${teacher_id} failed to delete score of ${student_id}'s ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in ScoreDelete.`);
        response.send('err');
    }
})

// PeopleUpdate获取名册 D
app.get('/get-roll-for-people-update', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let admin_id = params.admin_id;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        sql =  `select main.student_id, users.user_name from main left join users 
        on main.student_id=users.user_id where course_recog = (select course_recog from lessons 
        where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" 
        and class_id="${class_id}") order by main.student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${admin_id} got the roll of ${course_id} ${teacher_id} ${class_id} ${semester} in ScoreDelete.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// PeopleUpdate 删除学生 D
app.get('/post-for-people-update-delete', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        admin_id = params.admin_id;
        student_id = params.student_id;
        teacher_id = params.teacher_id;
        postscript = params.postscript;
        teacher_no = params.class_id;
        course_id = params.course_id;
        semester = params.semester;
        sql = `delete from main where student_id='${student_id}' and course_recog = (select course_recog from lessons 
            where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" 
            and class_id="${teacher_no}");`;
        conn.query(sql, (err, result)=>{
            log.info(`${admin_id} deleted ${student_id} to ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in PeopleUpdate.`);
            response.send("done");
        });
    }catch(e){
        response.send('err');
        log.warn(`${admin_id} failed to delete ${student_id} to ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in PeopleUpdate.`);
    }
})


// PeopleUpdate 增加学生 D
app.get('/post-for-people-update-add', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        admin_id = params.admin_id;
        student_id = params.student_id;
        teacher_id = params.teacher_id;
        postscript = params.postscript;
        teacher_no = params.class_id;
        course_id = params.course_id;
        semester = params.semester;
        sql = `insert into main(student_id,course_recog) values('${student_id}',(select course_recog from lessons 
            where teacher_id="${teacher_id}" and course_id="${course_id}" and semester="${semester}" 
            and class_id="${teacher_no}"));`;
        conn.query(sql, (err, result)=>{
            log.info(`${admin_id} added ${student_id} to ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in PeopleUpdate.`);
            response.send("done");
        });
    }catch(e){
        response.send('err');
        log.warn(`${admin_id} failed to add ${student_id} to ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in PeopleUpdate.`);
    }
})

app.listen(8000, ()=>{
    console.log('Server Activated, Port 8000 Listening.\n');
})

