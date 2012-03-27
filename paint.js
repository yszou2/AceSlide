dojo.m.paint = {};

dojo.m.paint.init = function(){
    this.item = [];
    for(var i = 0; i < dojo.m.frames.length; i++){this.item.push([])}

    this.separate_node = dojo.byId('separate');
    this.paper = Raphael(this.separate_node, dojo.style(this.separate_node, 'width') - 10,
                                             dojo.style(this.separate_node, 'height') - 10);

    dojo.connect(window, 'onresize', {paper: this.paper, separate_node: this.separate_node},
        function(eventObj){
            this.paper.setSize(dojo.style(this.separate_node, 'width') - 10,
                               dojo.style(this.separate_node, 'height') - 10);
    });

    this.draw_start = function(eventObj){
        dojo.m.paint.is_drawing = true;

        dojo.m.paint.last_item = dojo.m.paint.paper.rect(eventObj.clientX,
                                                         eventObj.clientY, 1, 1, 0);
        dojo.m.paint.last_item.attr({
            fill: "orange",
            stroke: "red",
            'fill-opacity': .3,
            'stroke-width': 1,
            'stroke-opacity': .3
        }); 

        //删除
        dojo.m.paint.last_item.hover(
            function(eventObj){this.attr('stroke-opacity', 1)},
            function(eventObj){this.attr('stroke-opacity', .3)}
        );

        dojo.m.paint.last_item.drag(
            function(dx, dy){
                this.delta = Math.max(200 - Math.sqrt(dx * dx + dy * dy), 0) / 200;
                this.attr({
                    x: this.sx + dx,
                    y: this.sy + dy,
                    'fill-opacity': this.sfo * this.delta,
                    'stroke-opacity': this.sso * this.delta
                })
            },

            function(){
                this.sx = this.attr('x');
                this.sy = this.attr('y');
                this.sfo = this.attr('fill-opacity');
                this.sso = this.attr('stroke-opacity');
            },

            function(){
                //移动一定量才删除
                if(this.delta < 0.5){
                    this.remove();
                } else {
                    this.attr({
                        x: this.sx,
                        y: this.sy,
                        'fill-opacity': this.sfo,
                        'stroke-opacity': this.sso
                    })
                }
            }
        );

        dojo.m.paint.last_item.source_x = dojo.m.paint.last_item.attr('x');
        dojo.m.paint.last_item.source_y = dojo.m.paint.last_item.attr('y');
        dojo.m.paint.item[dojo.m.index[0]].push(dojo.m.paint.last_item);


        //分象限处理
        dojo.m.paint.drawing_connect = dojo.connect(dojo.m.paint.separate_node,
            'mousemove', {rect: dojo.m.paint.last_item,
                          f: {4: function(rect, oxy, xy){
                                     rect.attr('width', xy[0] - oxy[0]);
                                     rect.attr('height', xy[1] - oxy[1]);
                                 },
                              2: function(rect, oxy, xy){
                                     rect.attr('y', xy[1]);
                                     rect.attr('width', xy[0] - oxy[0]);
                                     rect.attr('height', oxy[1] - xy[1]);
                                  },
                              3: function(rect, oxy, xy){
                                     rect.attr('x', xy[0]);
                                     rect.attr('width', oxy[0] - xy[0]);
                                     rect.attr('height', xy[1] - oxy[1]);
                                  },
                              1: function(rect, oxy, xy){
                                     rect.attr('x', xy[0]);
                                     rect.attr('y', xy[1]);
                                     rect.attr('width', oxy[0] - xy[0]);
                                     rect.attr('height', oxy[1] - xy[1]);
                                  }
                             }
            },
                function(eventObj){
                    var ox = this.rect.source_x;
                    var oy = this.rect.source_y;
                    var x = eventObj.clientX;
                    var y = eventObj.clientY;

                    if(x > ox && y > oy){this.f[4](this.rect, [ox, oy], [x, y]); return;}
                    if(x > ox && y < oy){this.f[2](this.rect, [ox, oy], [x, y]); return;}
                    if(x < ox && y > oy){this.f[3](this.rect, [ox, oy], [x, y]); return;}
                    if(x < ox && y < oy){this.f[1](this.rect, [ox, oy], [x, y]); return;}
        });
    };


    this.draw_end = function(eventObj){
        dojo.m.paint.is_drawing = false;
        dojo.disconnect(dojo.m.paint.drawing_connect);
    }

    dojo.connect(this.separate_node, 'mousedown', function(eventObj){
        dojo.m.paint._sx = eventObj.clientX;
        dojo.m.paint._sy = eventObj.clientY;
    });

    dojo.connect(this.separate_node, 'mouseup', function(eventObj){
        var dx = dojo.m.paint._sx - eventObj.clientX;
        var dy = dojo.m.paint._sy - eventObj.clientY;

        //拖动的话不做任何操作
        if(Math.sqrt(dx * dx + dy * dy) > 5){return;}

        if(dojo.m.paint.is_drawing == undefined || !dojo.m.paint.is_drawing){
              dojo.m.paint.draw_start(eventObj);
        } else {dojo.m.paint.draw_end(eventObj);}
    });

    dojo.subscribe('FrameChange', function(index, last_index){
        dojo.forEach(dojo.m.paint.item[last_index[0]], function(item){item.hide()});
        dojo.forEach(dojo.m.paint.item[index[0]], function(item){item.show()});
    });
}
