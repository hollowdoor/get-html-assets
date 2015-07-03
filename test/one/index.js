var GetAssets = require('get-html-assets');

var h = new GetAssets('index.html', {read: ['scripts', 'styles']});

h.on('error', function(err){
    console.log(err);
});

h.on('done', function(data, names, paths){
    console.log('done -------');
    console.log('data ', data);
    console.log('data.scripts ', data.scripts);
    console.log('data.styles ', data.styles);
    console.log('data.images ', data.images);
    console.log('names', names);
    console.log('paths', paths);
});

h.on('script', function(data){
    console.log('on script -------');
    console.log(data.name);
    console.log(data.content);
});

h.on('style', function(data){
    console.log('on style -------');
    console.log(data.name);
    console.log(data.content);
});

h.on('image', function(data){
    console.log('on image -------');
    console.log(data.name);
    console.log(data.content);
});
