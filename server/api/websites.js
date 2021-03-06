const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');
const Admin = require('../models/Admin');
const Website = require('../models/Website');
const { DEFAULT_WEBSITE_ICON } = require('../config');

/**
 *  @GET '/websites'
 *  @获取公开websites数据接口，接口是公开的
 */
router.get('/', async ctx => {
    try {
        const webs = await Website.find();
        // console.log(webs);
        ctx.status = 200;
        ctx.body = { webs: webs, msg: 'get websites data from table websites.' };
    } catch (e) {
        console.log(e);
        ctx.status = 404;
        ctx.body = { msg: 'not found.' };
    }
});

/**
 *  @GET '/websites/hide'
 *  @获取隐藏websites数据接口，接口是私密的
 */
router.get('/hide', passport.authenticate('jwt', { session: false }), async ctx => {
    try {
        const admin = await Admin.find({ _id: ctx.state.user.id });
        if (admin.length > 0) {
            const webs = await Website.find({ show: true });
            console.log(webs);
            ctx.status = 200;
            ctx.body = { msg: 'get websites data from table websites.' };
        } else {
            ctx.status = 400;
            ctx.body = { msg: '你不是管理员用户。' };
        }
    } catch (e) {
        ctx.status = 500;
        ctx.body = { msg: 'not found.' };
    }
});


/**
*  @POST '/websites/add'
*  @添加web数据接口，接口是私密的，需要token验证
*/
// router.post('/add', passport.authenticate('jwt', { session: false }), async ctx => {
//     try {
//         const admin = await Admin.find({ _id: ctx.state.user.id });
//         if (admin.length > 0) {
//             const data = ctx.request.body;
//             // 验证数据然后添加到数据库
//             const web = {};
//             web.user = data.email || "匿名用户";
//             web.title = data.title || '';
//             web.info = data.description || 'No description';
//             web.category = data.category || '其他';
//             web.url = data.url || "";
//             web.cover = data.cover || DEFAULT_WEBSITE_ICON;
//             web.note = data.note || "";

//             const saveWeb = await new Website(web).save();
//             if (saveWeb) {
//                 ctx.status = 200;
//                 ctx.body = { msg: "添加成功", saveWeb };
//             } else {
//                 ctx.status = 500;
//                 ctx.body = { msg: '添加失败' };
//             }
//         } else {
//             ctx.status = 400;
//             ctx.body = { msg: 'aceess denied' };
//         }
//     } catch (e) {
//         ctx.status = 500;
//         ctx.body = { msg: '崩了！' };
//     };
// });

/**
*  @POST '/websites/add'
*  @添加web数据接口，接口是公开的，需要token验证
*/
router.post('/add', async ctx => {
    try {
        if (true) {
            const data = ctx.request.body;
            // 验证数据然后添加到数据库
            const web = {};
            web.user = data.email || "匿名用户";
            web.title = data.title || '';
            web.info = data.description || 'No description';
            web.category = data.category || '其他';
            web.url = data.url || "";
            web.cover = data.cover || DEFAULT_WEBSITE_ICON;
            web.note = data.note || "";

            const saveWeb = await new Website(web).save();
            if (saveWeb) {
                ctx.status = 200;
                ctx.body = { msg: "添加成功", saveWeb };
            } else {
                ctx.status = 200;
                ctx.body = { msg: '添加失败' };
            }
        } else {
            ctx.status = 200;
            ctx.body = { msg: 'aceess denied' };
        }
    } catch (e) {
        ctx.status = 500;
        ctx.body = { msg: '崩了！' };
    };
});


/**
 *  @GET '/websites/delete'
 *  @管理员删除website
 *  @接口是私密的
 */
router.post('/delete', passport.authenticate('jwt', { session: false }), async ctx => {
    try {
        const admin = await Admin.find({ _id: ctx.state.user.id });
        const idList = ctx.request.body.idList.split(',');
        if (admin.length > 0) {
            // 删除操作
            let delCount = 0;
            for (var i = 0; i < idList.length; i++) {
                await Website.deleteOne({ _id: idList[i] }).then((del) => {
                    if (del.ok) {
                        delCount = delCount + 1;
                    }
                });
            }
            ctx.status = 200;
            ctx.body = { msg: `成功删除${delCount}条记录` };
        } else {
            ctx.status = 400;
            ctx.body = { msg: '身份验证失败' };
        }
    } catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = { msg: '崩了' };
    }
});

/**
 *  @GET '/websites/search'
 *  @关键字查找
 */
router.get('/search', async ctx => {
    try {
        const keywords = ctx.query.k.toString();
        //正则匹配查询 
        const searchResult = await Website.find({ $or: [{ title: { $regex: keywords } }, { user: { $regex: keywords } }, { info: { $regex: keywords } }] });
        if (searchResult.length > 0) {
            ctx.status = 200;
            ctx.body = { msg: 'success', webs: searchResult };
        } else {
            ctx.status = 200;
            ctx.body = { msg: 'nothing to match.' }
        }
    } catch (e) {
        ctx.status = 500;
        ctx.body = { msg: 'not found.' };
    }
});

/**
 * @desc 点赞接口
 * @port /websites/vote
 * @query id
 * @access public
 */
router.get('/vote', async ctx => {
    try {
        const id = ctx.query.id;
        await Website.updateOne({ "_id": id }, { $inc: { "likes": 1 } }).then(res => {
            if (res.nModified == 1) {
                ctx.status = 200;
                ctx.body = { msg: "唔该晒！" };
            } else {
                ctx.status = 500;
                ctx.body = { msg: "服务器出错" };
            }
        });
    } catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = { msg: "服务器出错" };
    }
});

/**
 * @desc 访问接口
 * @port /websites/view
 * @query id
 * @access public
 */
router.get('/view', async ctx => {
    try {
        const id = ctx.query.id;
        await Website.updateOne({ "_id": id }, { $inc: { "view": 1 } }).then(res => {
            if (res.nModified == 1) {
                ctx.status = 200;
                ctx.body = { msg: "success" };
            } else {
                ctx.status = 500;
                ctx.body = { msg: "服务器出错" };
            }
        });
    } catch (e) {
        ctx.status = 500;
        ctx.body = { msg: "服务器出错" };
    }
})

module.exports = router.routes();
