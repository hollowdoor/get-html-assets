get-html-assets
===============

Install
-------
npm install get-html-assets

Usage
-----

get-html-assets in an instance of EventEmitter.

When the read option is set there will be a `content` property with the file text set on the file data object of those file types.

```javascript
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
```

Use Streams
-----------

```javascript
var GetAssets = require('get-html-assets');

var h = new GetAssets('index.html', {stream: ['scripts', 'styles', 'images']});

h.on('error', function(err){
    console.log(err);
});

h.on('stream', function(stream, data){
    //Use every stream.
    var writeStream = fs.createWriteStream(path.resolve('backup/', data.name));
    stream.pipe(writeStream);
});

h.on('scriptstream', function(stream, data){
    var writeStream = fs.createWriteStream(path.resolve('scripts/', data.name));
    stream.pipe(writeStream);
});

h.on('stylestream', function(stream, data){
    var writeStream = fs.createWriteStream(path.resolve('css/', data.name));
    stream.pipe(writeStream);
});

h.on('imagestream', function(stream, data){
    var writeStream = fs.createWriteStream(path.resolve('images/', data.name));
    stream.pipe(writeStream);
});
```
