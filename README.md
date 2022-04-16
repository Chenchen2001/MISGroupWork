# MISGroupWork

## THIS IS A PRIVATE PROJECT. JUST FOR A COURSE ASSIGNMENT.

The MIS group work of Shanghai University School of Management.

This is a Student Score Managing System, made up by using `HTML`, `CSS`, `JavaScript` and `Ajax`, `Axios`, `jQuery`.

This should be runned on a remote server, having `MySQL` established and being configured correctly in file `server.js`.

The server is powered by `NodeJS`, having `express`,`mysql`,`log4js` installed by npm.

Now having accounts below for test.

Admin: 10000000 adminpassword

Teacher: 10110000 teacherpassword

Student: 20110000 studentpassword

-------------------------
The Database is waiting for an update by the groupmate. What the database require is in the file `Requirements of the database.md`.

The database for testing now is consists of the following tables.

Table `scores`:

| Field        | Type        | Null | Key | Default | Extra |
|--------------|-------------|------|-----|---------|-------|
| course_id    | char(8)     | YES  |     | NULL    |       |
| teacher_no   | char(4)     | YES  |     | NULL    |       |
| student_id   | char(8)     | YES  |     | NULL    |       |
| score        | tinyint     | YES  |     | NULL    |       |
| student_name | varchar(6)  | YES  |     | NULL    |       |
| course_name  | varchar(15) | YES  |     | NULL    |       |
| credit       | float       | YES  |     | NULL    |       |
| semester     | char(5)     | YES  |     | NULL    |       |
| teacher_id   | char(8)     | YES  |     | NULL    |       |
| postscript   | varchar(20) | YES  |     | NULL    |       |
| status       | tinyint     | YES  |     | NULL    |       |

Table `users`:


| Field | Type        | Null | Key | Default | Extra |
|-------|-------------|------|-----|---------|-------|
| id    | varchar(8)  | YES  |     | NULL    |       |
| name  | varchar(6)  | YES  |     | NULL    |       |
| pwd   | varchar(64) | YES  |     | NULL    |       |
| type  | tinyint     | YES  |     | NULL    |       |

