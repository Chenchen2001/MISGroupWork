# MISGroupWork

## THIS IS A PRIVATE PROJECT. JUST FOR A COURSE ASSIGNMENT.

The MIS group work of Shanghai University School of Management in March to June, 2022.

This is a Student Score Managing System, made up by using `HTML`, `CSS`, `JavaScript` and `Ajax`, `Axios`, `jQuery`.

This should be runned on a remote server, having `MySQL` established and being configured correctly in file `server.js`.

The server is powered by `NodeJS`, having `express`,`mysql`,`log4js`,`nodemon` installed by npm.

To activate the server, double-clicking `runServer.bat` on Microsoft Windows (or running `nodemon server.js` in shell or cmd).

All IP addresses in the project has been blocked by using '\<serverIP\>'. If you want to run this service, change them to your `all-ready-available` server and change all '\<serverIP\>' to your own IP adress or domain.

CONFIRM THAT PORT 8000 IS NOT OCCUPIED, or change the port in all files to your unoccupied one.


-------------------------

The database consists of the following tables.

Table `users` for storing all user-info(All passwords are encoded by md5 so that they've got the same length.):

| Field        | Type        | Null | Key | Default | Extra |
|--------------|-------------|------|-----|---------|-------|
| user_id    | char(8)     | NO  |PRI | NULL    |       |
| user_name | varchar(8)  | YES  |     | NULL    |       |
| password  | char(64) | YES  |     | NULL    |       |
| authority       | tinyint      | YES  |     | NULL    |       |


Table `courses` for storing all course-info:


| Field | Type        | Null | Key | Default | Extra |
|-------|-------------|------|-----|---------|-------|
| course_id | char(8)  | NO  | PRI  | NULL    |       |
| course_name  | varchar(20)  | YES  |     | NULL    |       |
| credit   | tinyint | YES  |     | NULL    |       |



Table `lessonss` for storing all course-info (`course_recog` is an identifier of a lesson.It is the md5 encoded string of 'teacher_id'+'course_id'+'class_id'+'semester'):


| Field | Type        | Null | Key | Default | Extra |
|-------|-------------|------|-----|---------|-------|
| teacher_id | char(8)  | NO  | PRI  | NULL    |       |
| course_id  | char(8)  | YES  |     | NULL    |       |
| class_id   | char(4) | YES  |     | NULL    |       |
| semester   | char(5) | YES  |     | NULL    |       |
| course_recog   | char(64) | NO  | PRI | NULL    |       |


Table `main` for score-storing:

| Field | Type        | Null | Key | Default | Extra |
|-------|-------------|------|-----|---------|-------|
| student_id | char(8)  | NO  | PRI  | NULL    |       |
|course_recog  | char(64)|YES  | PRI | NULL    |       |
| score   | tinyint  |YES| | NULL    |       |
| postscript   | varchar(5) | YES  |     | NULL    |       |
  
There might be the same `course_recog` appears in the far future, but there's  no need for me to think so far as its probability is so low😀.
