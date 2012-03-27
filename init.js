//开始
dojo.addOnLoad(function(){
    //dojo.m.init([0, 0]);
    dojo.m.init([6, 0]);
    prettyPrint();
});

//计算frame的位置
dojo.addOnLoad(function(){
    var all_frames = dojo.query('.frame');
    var left = (screen.width - dojo.style(all_frames[0], 'width')) / 2;
    var top = (screen.height - dojo.style(all_frames[0], 'height')) / 2;
    all_frames.style('left', left + 'px');
    all_frames.style('top', top + 'px');
});

//填充相关常量
dojo.addOnLoad(function(){
    dojo.query('span.author').forEach(function(item){
        item.innerHTML = dojo.m.author;
    });
    dojo.query('span.title').forEach(function(item){
        item.innerHTML = dojo.m.title;
    });
    dojo.query('span.date').forEach(function(item){
        item.innerHTML = dojo.m.date;
    });
    dojo.query('span.email').forEach(function(item){
        item.innerHTML = dojo.m.email;
    });
});
