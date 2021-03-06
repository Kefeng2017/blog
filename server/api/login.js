const Router = require('koa-router');
const router = new Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const md5 = require('../libs/md5');
const config = require('../config');
const passport = require('koa-passport');

/**
 *  @POST '/login'
 *  @登录接口，接口是公开的
 *  登录成功生成token
 */
router.post('/', async ctx => {
    try {
        const data = ctx.request.body;
        // 登陆信息校验
        const loginResult = await Admin.find({ email: data.email });
        const user = loginResult[0];

        if (!user) {
            ctx.status = 200;
            ctx.body = { msg: '用户不存在！' };
        } else {
            // 验证密码
            if (md5(data.password) == user.password) {
                // 密码对，生成token
                const payload = { id: user.id, name: user.name, avatar: user.avatar };
                // console.log(payload);
                const token = jwt.sign(payload, config.TOKEN_KEY, { expiresIn: 3600 * 24 * 2 });
                // 设置session
                ctx.status = 200;
                ctx.body = { success: true, token: "Bearer " + token, user: user };
            } else {
                ctx.status = 200;
                ctx.body = { msg: '密码错误！' };
            }
        }
    } catch (e) {
        ctx.status = 500;
        ctx.body = { msg: "服务器错误" };
    }
});


/**
 *  @GET '/login/valid'
 *  @在线时间更新认证，接口是私密的，需要token验证
 */
router.get('/valid', passport.authenticate('jwt', { session: false }), async ctx => {
    console.log('ds');
    try {
        const admin = await Admin.findOne({ _id: ctx.state.user.id });
        console.log(admin);
        if (admin) {
            const payload = { id: admin.id, name: admin.name, avatar: admin.avatar };
            // console.log(payload);
            const token = jwt.sign(payload, config.TOKEN_KEY, { expiresIn: 3600 * 24 * 2 });
            ctx.status = 200;
            ctx.body = { msg: "success", user: { name: admin.name, avatar: admin.avatar }, token: "Bearer " + token };
        } else {
            ctx.status = 401;
            ctx.body = { msg: "登录信息已过期，请重新登录" };
        }
    } catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = { msg: '服务器崩了' };
    };
});

module.exports = router.routes();
