const express = require('express'); // 导入express中间件
const mysql = require('mysql'); // 导入mysql联络驱动
const log4js = require("log4js");   // 导入日志配置文件
const app = express()   // 激活express中间件

let log = log4js.getLogger("Management");   // 激活日志并配置
log4js.configure({
    appenders:{
        file: {
            type:'dateFile',
            filename:'./logs/server',
            pattern: '-yyyy-MM-dd.log'
        },      
        consoleout: {type: "console"}
    },
    categories: {
        default:{
            appenders: ['file', 'consoleout'],
            level: 'info'
        }
    }   
});

const conn = mysql.createConnection({   // 激活与数据库的链接
    host: 'localhost',
    user: 'root',
    password: 'MISgroup',
    database: 'test'
    });
let sql;
let id = '00000000';
let pwd = '00000000';
conn.connect();

// 维持与数据库的链接 避免每8h断开一次
setInterval(function(){conn.query('select name from users where id=10000000;',(err,result)=>{console.log('Keep connected with MySQL database……')})},7200000);

// 处理报错
process.on('uncaughtException', err => {
    log.error(err && err.stack)
});

// 登陆验证
app.get('/login', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query
        id = params.id;
        pwd = params.pwd;
        sql = `select * from users where id='${id}';`;
        conn.query(sql, (err, result)=>{
            if(result[0]==undefined){
                sqlpwd = 'None';
            }else{
                sqlpwd = result[0].pwd;
                name = result[0].name;
            }
            if(pwd === sqlpwd){
                log.info(id+" tried to login, success.");
                response.send("Y,"+name);     // 找到密码且正确
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

// 学生查询成绩
app.get('/search', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.student_id;
        semester = params.semester;
        sql = `select * from scores where student_id='${id}' and semester='${semester}' and status=1 and score is not NuLL order by course_id;`;
        conn.query(sql, (err, result)=>{
            log.info(id+" searched for his/her score.");
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// 学生权限判断
app.get('/anthority-student', (request, response)=>{    // 权限
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.user_id;
        sql = `select type from users where id='${id}';`;
        conn.query(sql, (err, result)=>{
            if(err===null && result){
                if(result){
                    try{
                        if(result[0].type <= 2){
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

// 教师权限判断
app.get('/anthority-teacher', (request, response)=>{    // 权限
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.user_id;
        sql = `select type from users where id='${id}';`;
        conn.query(sql, (err, result)=>{
            if(err===null && result){
                if(result){
                    try{
                        if(result[0].type < 2){
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

// 管理员权限判断
app.get('/anthority-admin', (request, response)=>{    
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        id = params.user_id;
        sql = `select type from users where id='${id}';`;
        conn.query(sql, (err, result)=>{
            if(err===null && result){
                if(result){
                    try{
                        if(result[0].type == 0){
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

// ScoreAdd获取名册
app.get('/get-roll-for-score-add', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        sql = `select student_id,student_name from scores where course_id='${course_id}' and teacher_id='${teacher_id}' and teacher_no='${class_id}' and semester='${semester}' and score is NULL and status=1 order by student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of '${course_id}' '${class_id}' '${semester}' in ScoreAdd`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreAdd传递数据
app.get('/post-score-for-score-add', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let student_id = params.student_id;
        let teacher_id = params.teacher_id;
        let score = params.score;
        let postscript = params.postscript;
        let teacher_no = params.class_id;
        let course_id = params.course_id;
        let semester = params.semester;
        sql = `update scores set score='${score}',postscript="${postscript}",status=1 where student_id='${student_id}' and teacher_id='${teacher_id}' and course_id='${course_id}' and teacher_no='${teacher_no}' and semester='${semester}';`;
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
        sql = `select student_id,student_name,score from scores where course_id='${course_id}' and teacher_id='${teacher_id}' and teacher_no='${class_id}' and semester='${semester}' and student_id='${student_id}' and score is not NULL and status=1 order by student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of ${course_id} ${class_id} ${semester} in ScoreUpdate.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreUpdate获取名册 without student_id
app.get('/get-roll-for-score-update-without-student-id', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        sql = `select student_id,student_name,score from scores where course_id='${course_id}' and teacher_id='${teacher_id}' and teacher_no='${class_id}' and semester='${semester}' and score is not NULL and status=1 order by student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of ${course_id} ${class_id} ${semester} in ScoreUpdate.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreUpdate传递数据
app.get('/post-score-for-score-update', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let student_id = params.student_id;
        let teacher_id = params.teacher_id;
        let score = params.score;
        let postscript = params.postscript;
        let teacher_no = params.class_id;
        let course_id = params.course_id;
        let semester = params.semester;
        sql = `update scores set score='${score}',postscript="${postscript}",status=1 where student_id='${student_id}' and teacher_id='${teacher_id}' and course_id='${course_id}' and teacher_no='${teacher_no}' and semester='${semester}' and status=1;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} update score to ${student_id}'s ${course_id} ${teacher_no} ${semester} with ${score} and postscript '${postscript}' in ScoreUpdate.`);
            response.send("done");
        });
    }catch(e){
        response.send('err');
        log.warn(`${teacher_id} failed to update score to ${student_id}'s ${course_id} ${teacher_no} ${semester} with ${score} and postscript '${postscript}' in ScoreUpdate.`);
    }
})

// ScoreDelete获取名册 with student_id
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
        sql = `select student_id,student_name,score from scores where course_id='${course_id}' and teacher_id='${teacher_id}' and teacher_no='${class_id}' and semester='${semester}' and student_id='${student_id}' and score is not NULL and status=1 order by student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of ${course_id} ${class_id} ${semester} in ScoreDelete.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreDelete获取名册 without student_id
app.get('/get-roll-for-score-delete-without-student-id', (request, response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let teacher_id=params.teacher_id;
        let course_id = params.course_id;
        let class_id = params.class_id;
        let semester = params.semester;
        sql = `select student_id,student_name,score from scores where course_id='${course_id}' and teacher_id='${teacher_id}' and teacher_no='${class_id}' and semester='${semester}' and score is not NULL and status=1 order by student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} got the roll of ${course_id} ${class_id} ${semester} in ScoreDelete.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// ScoreDelete操作
app.get('/post-for-score-delete', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let student_id = params.student_id;
        let teacher_id = params.teacher_id;
        let postscript = params.postscript;
        let teacher_no = params.class_id;
        let course_id = params.course_id;
        let semester = params.semester;
        sql = `update scores set score=null ,postscript="${postscript}",status=1 where student_id='${student_id}' and teacher_id='${teacher_id}' and course_id='${course_id}' and teacher_no='${teacher_no}' and semester='${semester}' and status=1;`;
        conn.query(sql, (err, result)=>{
            log.info(`${teacher_id} deleted score of ${student_id}'s ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in ScoreDelete.`);
            response.send("done");
        });
    }catch(e){
        log.warn(`${teacher_id} failed to delete score of ${student_id}'s ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in ScoreDelete.`);
        response.send('err');
    }
})

// PeopleUpdate获取名册
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
        sql = `select student_id,student_name from scores where course_id='${course_id}' and teacher_id='${teacher_id}' and teacher_no='${class_id}' and semester='${semester}' and status=1 order by student_id;`;
        conn.query(sql, (err, result)=>{
            log.info(`${admin_id} got the roll of ${course_id} ${teacher_id} ${class_id} ${semester} in ScoreDelete.`);
            response.send(result);
        })
    }catch(e){
        response.send('err')
    }
})

// PeopleUpdate 删除学生
app.get('/post-for-people-update-delete', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let admin_id = params.admin_id;
        let student_id = params.student_id;
        let teacher_id = params.teacher_id;
        let postscript = params.postscript;
        let teacher_no = params.class_id;
        let course_id = params.course_id;
        let semester = params.semester;
        sql = `update scores set teacher_id=null,teacher_no=null,score=null,status=0,postscript='${postscript}-删除' where student_id='${student_id}' and teacher_id='${teacher_id}' and course_id='${course_id}' and teacher_no='${teacher_no}' and semester='${semester}';`;
        conn.query(sql, (err, result)=>{
            log.info(`${admin_id} deleted ${student_id} to ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in PeopleUpdate.`);
            response.send("done");
        });
    }catch(e){
        response.send('err');
        log.warn(`${admin_id} failed to delete ${student_id} to ${course_id} ${teacher_no} ${semester} with postscript '${postscript}' in PeopleUpdate.`);
    }
})


// PeopleUpdate 增加学生
app.get('/post-for-people-update-add', (request,response)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    try{
        let params = request.query;
        let admin_id = params.admin_id;
        let student_id = params.student_id;
        let teacher_id = params.teacher_id;
        let postscript = params.postscript;
        let teacher_no = params.class_id;
        let course_id = params.course_id;
        let semester = params.semester;
        get_course_info(teacher_id, course_id).then(data=>{
            console.log(data);
            course_info = data;
        });
        console.log(course_info);
        get_name(student_id).then(data=>{
            console.log(data);
            student_name = data;
        })
        console.log(course_name,credit,student_name);
        sql = `insert into scores(course_id,teacher_no,student_id,score,student_name,course_name,credit,semester,teacher_id,postscript,status) values('${course_id}','${teacher_no}','${student_id}',null,'${student_name}','${course_name}','${credit}','${semester}','${teacher_id}','${postscript}-新增',1);`;
        console.log(sql);
        delete course_name;
        delete credit;
        delete student_name;
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

