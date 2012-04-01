dojo.AceSlide = {};

dojo.m = dojo.AceSlide;
dojo.m.frame = {};

dojo.m._get_$ = function(class_name){
    //获取一些形如 <p class=`class_name`>xxx</p> 的 innerHTML

    var t = dojo.query('p[class~="' + class_name + '"]');
    if(t.length >= 1){
        var r = dojo.trim(t[t.length - 1].innerHTML);
        t.orphan();
        return r;
    } else {
        return undefined; 
    }
}


dojo.m._get_title = dojo.hitch(null, dojo.m._get_$, 'title');
dojo.m._get_author = dojo.hitch(null, dojo.m._get_$, 'author');
dojo.m._get_date = dojo.hitch(null, dojo.m._get_$, 'date');
dojo.m._get_email = dojo.hitch(null, dojo.m._get_$, 'email');

//工具栏
dojo.m.bind_toolbar = function(){
    //dojo.create('div', {class: 'toolbar'}, dojo.body(), 'first');
    var toolbar_node = dojo.byId('toolbar');

    //按键
    dojo.connect(dojo.body(), 'keypress', function(eventObj){
        //alert(eventObj.keyCode);

        var map = {
            39:  dojo.m.next, //RIGHT
            32:  dojo.m.next, //SPACE
            37:  dojo.m.prev, //LEFT
            8:   dojo.m.prev, //BACK

            9:   function(){
                eventObj.preventDefault();
                dojo.byId('toc').toggle();
            }, //TAB

            116: function(){ //T
                dojo.style(toolbar_node, 'display') == 'block' ? dojo.style(toolbar_node, 'display', 'none') : dojo.style(toolbar_node, 'display', 'block');
            }
        };
        map[eventObj.keyCode]();
    });

    dojo.connect(dojo.byId('next'), 'click', function(eventObj){dojo.m.next()});
    dojo.connect(dojo.byId('prev'), 'click', function(eventObj){dojo.m.prev()});

    //frame_tip
    dojo.byId('total_frame').innerHTML = dojo.m.frames.length;
    dojo.byId('current_frame').innerHTML = dojo.m.index[0] + 1;
    dojo.byId('total_slice').innerHTML = dojo.m.frames[dojo.m.index[0]].overlay_node_list.length;
    dojo.byId('current_slice').innerHTML = dojo.m.index[1] + 1;

    dojo.subscribe('FrameChange', function(index, last_index){
        dojo.byId('current_frame').innerHTML = index[0] + 1;
        dojo.byId('total_slice').innerHTML = dojo.m.frames[index[0]].overlay_node_list.length;
        dojo.byId('current_slice').innerHTML = index[1] + 1;

        //处理目录
        dojo.query('div#toc ol li').forEach(dojo.hitch({i: index},
            function(item, index, obj){
                if(index == this.i[0]){dojo.style(item, 'color', 'orange')}
                else{dojo.style(item, 'color', null)}
        }));
    })

    return toolbar_node;
}

//目录
dojo.m.bind_toc = function(){
    var toc_node = dojo.byId('toc');

    dojo.m.frames.forEach(dojo.hitch({n: toc_node.children[0]},
        function(item, index, obj){
            dojo.create('li', {innerHTML: item.title || '(无标题)'}, this.n, 'last');
    }));

    dojo.query('li', toc_node).forEach(function(item, index, obj){
        dojo.connect(item, 'click', {index: index}, function(eventObj){
            dojo.m.show([this.index, 0]);
        });
    });

    toc_node.show = dojo.hitch({n: toc_node}, function(){
        dojo.anim(this.n, {left: {start: -1000, end: 0}});
    });

    toc_node.hide = dojo.hitch({n: toc_node}, function(){
        dojo.anim(this.n, {left: {start: 0, end: -1000}});
    });

    toc_node.toggle = dojo.hitch({n: toc_node},function(){
        if(this.n.marker){ this.n.marker = !this.n.marker; this.n.show(); }
        else{this.n.marker = !this.n.marker; this.n.hide();}
    });
}

dojo.m.create_frames = function(){
    return dojo.query('div[class~="frame"]').map(function(item){
        return new dojo.m.Frame(item);
    });
}


//下一帧
dojo.m.next = function(){
    var to_index = dojo.clone(dojo.m.index);
    to_index[1] += 1;
    if(to_index[1] == dojo.m.frames[dojo.m.index[0]].overlay_node_list.length){
        to_index[0] += 1;
        to_index[1] = 0;
        if(to_index[0] == dojo.m.frames.length){
            return;
            alert('已经播放完毕');
            return dojo.m.frames[dojo.m.index[0]];
        }
    }
    return dojo.m.show(to_index);    
}

//上一帧
dojo.m.prev = function(){
    var to_index = dojo.clone(dojo.m.index);
    to_index[1] -= 1;
    if(to_index[1] == -1){
        to_index[0] -= 1;
        if(to_index[0] == -1){
            return;
            alert('已经是第一张了');
            return dojo.m.frames[0];
        } else {to_index[1] = dojo.m.frames[to_index[0]].overlay_node_list.length - 1}
    }
    return dojo.m.show(to_index);    
}

//显示指定帧
dojo.m.show = function(index){
    dojo.m.frames[dojo.m.index[0]].node.hide();
    dojo.m.frames[index[0]].node.show();

    //for(var i = 0, l = dojo.m.frames[index[0]].overlay_node_list.length; i < l; i++){
    //    dojo.forEach(dojo.m.frames[index[0]].overlay_node_list[i],
    //        function(item, index, obj){item.hide()}
    //    );
    //}
    
    dojo.forEach(dojo.m.frames[dojo.m.index[0]].overlay_node_list[dojo.m.index[1]],
        function(item, index, obj){item.hide()}
    );

    //for(var i = 0, l = index[1]; i <= l; i++){
    //    dojo.forEach(dojo.m.frames[index[0]].overlay_node_list[i],
    //        function(item, index, obj){item.show()}
    //    );
    //}

    dojo.m.frames[index[0]].overlay_node_list[0][0].show();
    dojo.forEach(dojo.m.frames[index[0]].overlay_node_list[index[1]],
        function(item, index, obj){item.show()}
    );

    dojo.publish('FrameChange', [index, dojo.m.index]);
    dojo.m.index = index;

    //推头到控制服务器
    if(dojo.m._KEY){
        dojo.m.push(index);
    }
    return dojo.m.frames[index[0]];
}

dojo.m.init = function(init_index){
    //初始化环境
    
    dojo.m.title = dojo.m._get_title();
    dojo.m.author = dojo.m._get_author();
    dojo.m.date = dojo.m._get_date();
    dojo.m.email = dojo.m._get_email();

    dojo.m.frames = dojo.m.create_frames();

    dojo.m.index = init_index;
    if(dojo.m.index[0] < 0){
        dojo.m.index[0] = dojo.m.frames.length + dojo.m.index[0];
    }
    if(dojo.m.index[1] < 0){
        dojo.m.index[1] = dojo.m.frames.length + dojo.m.index[1];
    }

    dojo.m.toc = dojo.m.bind_toc();
    dojo.m.toolbar = dojo.m.bind_toolbar();
    dojo.m.show(dojo.m.index);
}


//dojo.m.init();

dojo.m._request = function(src){
    var node = dojo.create('script', {src: src, type: 'text/javascript'},
                           dojo.body(), 'last');
    return node;
}
//作为控制端连接
//获取一个KEY
dojo.m.host = function(host, password){
    dojo.m._HOST = host;
    var callback = 'dojo.m.set_key';
    dojo.m._request(host + '/key?callback=' + callback + '&' + 'password=' + password);
}

dojo.m.set_key = function(key){
    dojo.m._KEY = key;
}

dojo.m.push = function(index){
    dojo.m._request(dojo.m._HOST + '/server?key=' + dojo.m._KEY + '&' + 'f=' + index[0] + '&' + 's=' + index[1]);
}

dojo.m.pull = function(host){
    if(!dojo.m._HOST){dojo.m._HOST = host}
    dojo.m._request(dojo.m._HOST + '/client?callback=dojo.m.to_show&pull=dojo.m.pull');
}

dojo.m.to_show = function(f, s){
    dojo.m.show([f, s])
}

//为打印而将frame全部显示出来
dojo.m.for_print = function(){
    dojo.forEach(dojo.m.frames, function(e, i){
        e.node.show();
        dojo.style(e.node, {margin: 'auto', position: 'static',
                            pageBreakAfter: 'always',
                            boxShadow: 'none'});
        dojo.query('*[tabindex]', e.node).forEach(function(ee){ee.show()});
    });
}        

//绑定'连接'
dojo.addOnLoad(function(){
    dojo.query('.connect').connect('onclick', function(eventObj){
        if(dojo.m._HOST){
            var host = prompt('输入连接的服务器地址, 当前为: ' + dojo.m._HOST);
        } else {
            var host = prompt('输入连接的服务器地址');
        }

        if(host != ''){
            dojo.m.pull(host);
        }
    });

    dojo.query('.control').connect('onclick', function(eventObj){
        if(dojo.m._HOST){
            var host = prompt('输入连接的控制服务器地址, 当前为: ' + dojo.m._HOST);
        } else {
            var host = prompt('输入连接的控制服务器地址');
        }
        var password = prompt('输入连接密码');

        if(host != '' && password != ''){
            dojo.m.host(host, password);
        }
    });
});
