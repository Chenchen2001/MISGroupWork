## 数据库设计要求

### 一些简介

`${xxx}`是JavaScript中的格式化输出格式，表示这里要输入的数据，不用管里面是什么。

当前使用users表储存登录信息 用scores表储存所有成绩和课程信息 较混乱 故需重新规划数据库。

当前数据表的描述：

![image-20220331172047895](C:\Users\chenc\AppData\Roaming\Typora\typora-user-images\image-20220331172047895.png)

~~~json
{
    id: "学工号 八位固定",
    name: "姓名 最多6个汉语字符",
    pwd: "密码 为32位固定长度",
    type: "权限等级 0-管理员 1-教师 2-学生"
}
~~~



![image-20220331172055014](C:\Users\chenc\AppData\Roaming\Typora\typora-user-images\image-20220331172055014.png)

![image-20220331172102338](C:\Users\chenc\AppData\Roaming\Typora\typora-user-images\image-20220331172102338.png)

~~~JSON
{
    course_id: "课程号 八位固定",
    teacher_no: "班级号（课程班级） 四位固定",
    student_id: "学生学号 八位固定",
    score: "成绩 必须是数字类型",
    student_name: "学生姓名",
    course_name: "课程名"
    credit: "学分数",
    semester: "学期号 五位固定 格式为年份+学期序号 1-秋 2-冬 3-春 4-夏 20223-2022年春季学期",
    teacher_id: "教师号 八位固定",
    postscript: "备注 最多20个字符",
    status: "状态 现在全是1暂时没用"
}
~~~

![image-20220331172114533](C:\Users\chenc\AppData\Roaming\Typora\typora-user-images\image-20220331172114533.png)

期望：

1. 避免重复数据的出现 浪费存储空间
2. 数据按照种类分表存储 样式清晰

### 登录功能

输入：

1. 一个固定为8位数的学工号`id`(以`CHAR`存储)
2. 一个长度固定为32位的md5编码后的密码`pwd`

输出：

1. 一个长度固定为32位的md5编码后的密码`pwd`
2. 一个长度最多为6个汉字的姓名`name`

==登录不涉及权限控制==

当前为：`select * from users where id=${id};`

### 教师、管理员权限判定

输入：

1. 当前用户的学工号`id`

输出：

1. 上述用户的权限等级`type`

当前为：`select type from users where id=${id};`

### 学生成绩查询

输入：

1. 学生的学工号`student_id`
2. 当前的学期编号`semester`

输出：

1. 以输入的学生号查询到的所有课程号`course_id`
2. 上述课程号对应的课程名`course_name`
3. 上述课程对应的学分数`credit`
4. 上述课程对应的成绩`score`

当前为：`select * from scores where student_id=${id} and semester=${semester} and status=1 and score is not NuLL order by course_id;`

### 录入成绩功能的名单获取

输入：

1. 教师号`teacher_id`
2. 课程号`course_id`
3. 班级号（指改课程的班级）`teacher_no`
4. 当前的学期编号`semester`

输出：

1. 未录入成绩的学生编号`student_id`和姓名`name`

当前为：`select student_id,student_name from scores where course_id=${course_id} and teacher_id=${teacher_id} and teacher_no=${class_id} and semester=${semester} and score is NULL order by student_id;`

### 录入成绩

输入：

1. 学生编号`student_id`
2. 教师工号`teacher_id`
3. 成绩`score`
4. 备注`postscript`
5. 班级号`teacher_no`
6. 课程号`course_id`
7. 当前的学期编号`semester`

输出：

无输出 使用上述输入对指定的学生课程录入`score`和`postscript`

当前为：`update scores set score=${score},postscript="${postscript}",status=1 where student_id=${student_id} and teacher_id=${teacher_id} and course_id=${course_id} and teacher_no=${teacher_no} and semester=${semester};`

### 修改成绩、删除成绩功能的名单获取（指定学生编号时）

输入：

1. 教师号`teacher_id`
2. 课程号`course_id`
3. 班级号（指改课程的班级）`teacher_no`
4. 学期编号`semester`
5. 学生编号`student_id`

输出：

1. 已录入成绩的学生编号`student_id`、姓名`name`和当前成绩`score`

当前为：`select student_id,student_name,score from scores where course_id=${course_id} and teacher_id=${teacher_id} and teacher_no=${class_id} and semester=${semester} and student_id=${student_id} and score is not NULL order by student_id;`

### 修改成绩、删除成绩功能的名单获取（未指定学生编号时）

输入：

1. 教师号`teacher_id`
2. 课程号`course_id`
3. 班级号（指改课程的班级）`teacher_no`
4. 学期编号`semester`

输出：

1. 已录入成绩的学生编号`student_id`、姓名`name`和当前成绩`score`

当前为：`select student_id,student_name,score from scores where course_id=${course_id} and teacher_id=${teacher_id} and teacher_no=${class_id} and semester=${semester} and score is not NULL order by student_id;`

### 修改成绩功能

输入：

1. 学生编号`student_id`
2. 教师编号`teacher_id`
3. 修改后的成绩`score`
4. 备注`postscript`
5. 班级号（指改课程的班级）`teacher_no`
6. 课程号`course_id`
7. 学期编号`semester`

输出：

无输出 使用上述输入进行`score`和`postscript`的更新

当前为：`update scores set score=${score},postscript="${postscript}",status=1 where student_id=${student_id} and teacher_id=${teacher_id} and course_id=${course_id} and teacher_no=${teacher_no} and semester=${semester};`

### 删除成绩功能

输入：

1. 学生编号`student_id`
2. 教师编号`teacher_id`
3. 备注`postscript`
4. 班级号（指改课程的班级）`teacher_no`
5. 课程号`course_id`
6. 学期编号`semester`

输出：

无输出 使用上述输入进行`score`的删除（变`NULL`(空 不是字符串)）和`postscript`的更新

当前为：`update scores set score=null ,postscript="${postscript}",status=1 where student_id=${student_id} and teacher_id=${teacher_id} and course_id=${course_id} and teacher_no=${teacher_no} and semester=${semester};`

# <span style="color:red">新增需求</span>

### 人员管理

1. 人员检索

    输入：

    1. 课程号`course_id`
    2. 教师号`teacher_id`
    3. 学期`semester`
    4. 班级号`teacher_no`

    输出：

    1. 已在班级中的学生编号`student_id`和姓名`name`

2. 人员删除

    输入：

    1. 学生编号`student_id`
    2. 课程号`course_id`
    3. 教师号`teacher_id`
    4. 学期`semester`
    5. 班级号`teacher_no`
    6. 备注`postscript`

    输出：

    无输出，执行人员删除后该人员应被标记为“删除”或从数据库中移除。

3. 人员增加

    输入：

    1. 学生编号`student_id`
    2. 课程号`course_id`
    3. 教师号`teacher_id`
    4. 学期`semester`
    5. 班级号`teacher_no`
    6. 备注`postscript`

    输出：

    无输出，执行向指定班级中增加人员并设置成绩为空(null)（默认为空）

​    
