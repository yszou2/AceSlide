# -*- coding: utf-8 -*-

import imp
import os
import uuid
import functools

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)

tornado.options.parse_command_line()


IL = tornado.ioloop.IOLoop.instance()
PASSWORD = '123'

class BaseHandler(tornado.web.RequestHandler):
    pass

class TestHandler(BaseHandler):
    def get(self):
        return self.write('it works!')


class KeyHandler(BaseHandler):
    '获取key'

    def get(self):
        password = self.get_argument('password')
        if password != PASSWORD:
            raise tornado.web.HTTPError(403)

        callback = self.get_argument('callback', 'callback')
        key = uuid.uuid4().hex
        code = 'alert("ok"); %s("%s");' % (callback, key)
        self.__class__.is_get = True
        ServerHandler.key = key
        print self.request.remote_ip + ' get the key ...'
        return self.write(code)


class ClientHandler(BaseHandler):
    '客户端过来的请求'

    cons = []

    @tornado.web.asynchronous
    def get(self):
        print self.request.remote_ip + ' client ...'
        self.__class__.cons.append(self)

    def change(self, f, s):
        callback = self.get_argument('callback', 'callback')
        pull = self.get_argument('pull', 'pull');
        code = '%s(%s, %s); %s();' % (callback, f, s, pull)
        return self.finish(code)

    def next(self, callback='dojo.m.next', pull='dojo.m.pull'):
        code = '%s(); %s();' % (callback, pull)
        return self.finish(code)

    def prev(self, callback='dojo.m.prev', pull='dojo.m.pull'):
        code = '%s(); %s();' % (callback, pull)
        return self.finish(code)


class ServerHandler(BaseHandler):
    '控制端过来的信息'

    key = None
    f = 0
    s = 0

    @tornado.web.asynchronous
    def get(self):
        print self.request.remote_ip + ' server ...'

        key = self.get_argument('key')
        if key != self.__class__.key:
            raise tornado.web.HTTPError(403)
        f = self.get_argument('f', None)
        s = self.get_argument('s', None)
        if f is None or s is None:
            raise tornado.web.HTTPError(403)

        self.__class__.f = f
        self.__class__.s = s

        IL.add_callback(functools.partial(self.return_cons, ClientHandler.cons, f, s))
        return self.finish('0')


    def return_cons(self, conns, f, s):
        '返回客户端的请求'

        while conns:
            c = conns.pop()
            c.change(f, s)


class ControlHandler(BaseHandler):
    '一个专门的控制界面'

    @tornado.web.asynchronous
    def get(self):
        password = self.get_argument('password', '')
        if password != PASSWORD:
            return self.finish('<form action="/"><input name="password" /><input type="submit" value="提交" /></form>')

        a = self.get_argument('a', 'next')
        IL.add_callback(functools.partial(self.return_cons, ClientHandler.cons, a))

        return self.finish(u'<a href="/?password=%s&a=prev" style="font-size: 140px;">&lt;&lt;</a><span style="font-size: 140px;">　</span><a href="/?password=%s&a=next" style="font-size: 140px;">&gt;&gt;</a>' % (password, password))


    def return_cons(self, conns, a):

        while conns:
            c = conns.pop()
            if a == 'next':
                c.next()
            else:
                c.prev()



Handlers = (
    (r"/", ControlHandler),
    (r"/test", TestHandler),
    (r"/key", KeyHandler),
    (r"/server", ServerHandler),
    (r"/client", ClientHandler),
)


class Application(tornado.web.Application):
    def __init__(self):
        settings = dict(
            cookie_secret="tTS%!v8{Xku!Xpxno6e*l)X0gx*IIXOe",
            login_url="/login",
            xsrf_cookies=False,
            static_path = os.path.join(os.path.dirname(__file__), "static"),
            template_path = os.path.join(os.path.dirname(__file__), "template"),
            debug=True,
        )
        tornado.web.Application.__init__(self, Handlers, **settings)


def main():
    http_server = tornado.httpserver.HTTPServer(Application(), xheaders=True)
    http_server.listen(options.port)
    IL.start()


if __name__ == "__main__":
    main()
