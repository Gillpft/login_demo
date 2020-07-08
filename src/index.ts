import * as http from 'http'
import * as url from 'url'
import * as querystring from 'querystring'

export let uid__pass__dic = Object.create(null) as { [uid: string]: string }
export let sessionID__uid__dic = Object.create(null) as { [uid: string]: string }
export let uid__nickname__dic = Object.create(null) as { [uid: string]: string }


let c = 0
const sid = () => `__asa=b&cc=123___${c++}____` //正确是随机生成sessionID的函数，这里简化了

http.createServer((request, response) => {

    //不阅读 模拟服务器
    const { pathname, query } = url.parse(request.url || '')
    const params = querystring.parse(query || '')
    const sessionID = String(querystring.parse(String(request.headers['cookie'])).sessionID)
    console.log('pathname', params, sessionID)

    const end = (obj: { [key: string]: any }, headers: { [key: string]: string } = {}) => {
        response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', ...headers })
        response.end(JSON.stringify(obj, null, 4))
    }
    //不阅读

    //注册过程
    if (pathname === '/reg') {
        const uid = String(params.uid)
        const pass = String(params.pass)
        //服务器判断该用户是否存在
        if (uid__pass__dic[uid] === undefined) {
            //用户不存在，保存用户
            uid__pass__dic[uid] = pass
            end({
                isSuccess: true,
                msg: `注册成功 uid is${uid} pass is ${pass}`
            })
        } else {
            end({
                isSuccess: false,
                msg: `用户名已注册`
            })
        }

    }
    //登录过程
    else if (pathname === '/login') {
        const uid = String(params.uid)
        const pass = String(params.pass)
        //判断用户名是否存在
        if (uid__pass__dic[uid] !== undefined) {
            //判断密码是否正确
            if(uid__pass__dic[uid] === pass){
                let sId = sid()
            end(
                {
                    isSuccess: true,
                    msg: `登录成功 uid is${uid} pass is ${pass}`
                },
                //服务器返回含sessionID的Set-Cookie
                {
                    'Set-Cookie': querystring.stringify({ sessionID: sId }),
                })
                //浏览器自动保存sessionID
            sessionID__uid__dic[sId] = uid
            }else{
                end(
                    {
                        isSuccess: false,
                        msg: `密码错误`
                    })
            }
            
        } else {
            end(
                {
                    isSuccess: false,
                    msg: `该用户未注册`
                })
        } 


    }


    //设置昵称
    else if (pathname === '/set_nickname') {
        const nickname = String(params.nickname)
        //判断sessionID是否存在
        if (sessionID__uid__dic[sessionID] !== undefined) {
            //查找用户名
            const uId=sessionID__uid__dic[sessionID]
            //保存昵称
            uid__nickname__dic[uId] = nickname
            end({
                isSuccess: true,
                msg: `设置昵称成功 nickname is${nickname}`
            })
        } else {
            end({
                isSuccess: false,
                msg: `请先登录`
            })
        }
    }

    //获取昵称
    else if (pathname === '/get_nickname') {
        //浏览器发送sessionID给服务器，服务器判断sessionID是否存在
        if (sessionID__uid__dic[sessionID] !== undefined) {
            //查找用户名
            const uId=sessionID__uid__dic[sessionID]
            end({
                isSuccess: true,
                nickname: uid__nickname__dic[uId],
            })
        } else {
            end({
                isSuccess: false,
                msg: `请先登录`
            })
        }
    }
    else {
        end({})
    }
}).listen(8000)
console.log('Server running') 