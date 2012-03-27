dojo.m.recursion_parse_overlay = function(node, list, order){
    //递归解析出需要放到overlay列表中的结点

    if(dojo.hasClass(node, 'overlay')){
        var marker = true;
    } else {var marker = false;}

    var children = node.children;
    for(var i = 0, l = children.length; i < l; i++){
        if(marker){
            if(dojo.hasClass(node, 'phantom')){dojo.addClass(children[i], 'phantom')}

            if(!dojo.hasAttr(children[i], 'tabindex')){
                dojo.attr(children[i], 'tabindex', order + '-');
                order[0] += 1;
            }
            //list.push([children[i]]);
        }    
        dojo.m.recursion_parse_overlay(children[i], list, order);
    }
}

dojo.m.frame.init = function(node){
    this.node = node;

    if(this.node.show == undefined){
        this.node.show = dojo.hitch({'n': this.node},
                            function(){
                                if(dojo.hasClass(this.n, 'phantom')){
                                    dojo.style(this.n, {visibility: 'visible'});
                                } else {
                                    dojo.style(this.n, {display: 'block'});
                                }
                            });
    }


    if(this.node.hide == undefined){
        this.node.hide = dojo.hitch({n: this.node},
                            function(){
                                if(dojo.hasClass(this.n, 'phantom')){
                                    dojo.style(this.n, {visibility: 'hidden'});
                                } else {
                                    dojo.style(this.n, {display: 'none'});
                                }
                            });
    }

    this.title = dojo.attr(node, 'name');
    this.node.hide();

    this.overlay_node_list = [[this.node]];
    dojo.m.recursion_parse_overlay(this.node, this.overlay_node_list, [1]);

    var infinity = [];
    dojo.query('*[tabindex]', this.node).forEach(
        dojo.hitch({list: this.overlay_node_list, infinity: infinity},
            function(item, index, obj){
                if(item.show == undefined){
                    item.show = dojo.hitch({'n': item},
                          function(){
                              if(dojo.hasClass(this.n, 'phantom')){
                                  dojo.style(this.n, {visibility: 'visible'});
                              } else {
                                  dojo.style(this.n, {display: null});
                              }
                          });
                }

                if(item.hide == undefined){
                    item.hide = dojo.hitch({'n': item},
                        function(){
                            if(dojo.hasClass(this.n, 'phantom')){
                                dojo.style(this.n, {visibility: 'hidden'});
                            } else {
                                dojo.style(this.n, {display: 'none'});
                            }
                        });
                }

                var tabindex = [];
                var tabindex_str = dojo.trim(dojo.attr(item, 'tabindex'));
                dojo.forEach(tabindex_str.split(','), function(i){
                    var pair = dojo.trim(i).split('-');
                    if(pair.length == 1){
                        tabindex.push(pair[0]);
                        return;
                    } else {
                        if(pair[1] != ''){
                            for(var k = pair[0]; k <= pair[1]; k++){
                                tabindex.push(k);
                            }
                            return;
                        } else {
                            tabindex.push(pair[0]);
                            tabindex.push('@');
                        }
                    }
                });
                tabindex.sort();

                for(var i = 0, l = tabindex.length; i < l; i++){
                    if(tabindex[i] != '@'){
                        if(this.list[tabindex[i]] == undefined){this.list[tabindex[i]] = []}
                        this.list[tabindex[i]].push(item);
                    } else {infinity.push([parseInt(tabindex[i-1]), item])}       
                }
                item.hide();
            }
        )
    );


    for(var i = 0, l = infinity.length; i < l; i++){
        for(var j = infinity[i][0] + 1; j < this.overlay_node_list.length; j++){
            if(this.overlay_node_list[j] == undefined){this.overlay_node_list[j] = []}
            this.overlay_node_list[j].push(infinity[i][1]);
        }
    }

    for(var i = 0, l = this.overlay_node_list.length; i < l; i++){
        if(this.overlay_node_list[i] == undefined){this.overlay_node_list[i] = []}
    }

    if(this.title && this.title != ''){
        dojo.create('div', {class: 'frame_title',
                            innerHTML: this.title}, node, 'first');
    }
}

dojo.declare('dojo.m.Frame', null, {
    constructor: dojo.m.frame.init,
});
