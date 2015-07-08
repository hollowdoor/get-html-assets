var cwd = process.cwd(),
    fs = require('graceful-fs'),
    path = require('path'),
    cheerio = require('cheerio'),
    events = require('events'),
    util = require('util'),
    mime = require('mime');

/*
git remote add origin https://github.com/hollowdoor/get-html-assets.git
git push -u origin master
npm publish
*/

module.exports = GetHTMLAssets;

function GetHTMLAssets(htmlfile, options, complete){

    events.EventEmitter.call(this);

    htmlfile = path.resolve(cwd, htmlfile);

    if(typeof options === 'function'){
        complete = options;
        options = {};
    }

    options = options || {};

    if(typeof complete === 'function'){
        self.on('done', complete);
    }

    if(Object.prototype.toString.call(options.read) !== '[object Array]'){
        if(options.read === 'all'){
            options.read = typelist;
        }else if(options.read === undefined){
            options.read = [];
        }
    }

    if(Object.prototype.toString.call(options.stream) !== '[object Array]'){
        if(options.stream === 'all'){
            options.stream = typelist;
        }else if(options.stream === undefined){
            options.stream = [];
        }
    }

    var self = this,
        local = true,
        names = [],
        paths = [],
        data = {},
        running = 0,
        httpRoot,
        types = [
            {
                //javascript
                use: true,//options.scripts,
                type: 'script',
                select: 'script',
                fileAttribute: 'src',
                readable: 'scripts',
                streamable: 'scripts',
                attributes: ['type', 'src'],
                condition: function(a){
                    return true;
                }
            },
            {
                //css
                use: true,//options.styles,
                type: 'style',
                select: 'link',
                fileAttribute: 'href',
                readable: 'styles',
                streamable: 'styles',
                attributes: ['type', 'href', 'rel'],
                condition: function(a){
                    return a.attr('rel') === 'stylesheet';
                }
            },
            {
                //images
                use: true,//options.images,
                type: 'image',
                select: 'img',
                fileAttribute: 'src',
                readable: false,
                streamable: 'images',
                attributes: ['src'],
                condition: function(a){
                    return true;
                }
            }
        ];

    if(options.read.length){
        for(var i=0; i<types.length; i++){
            if(types[i].readable && options.read.indexOf(types[i].readable) !== -1)
                types[i].read = true;
            else {
                types[i].read = false;
            }
        }
    }

    if(options.stream.length){
        for(var i=0; i<types.length; i++){
            if(options.stream.indexOf(types[i].streamable) !== -1){
                types[i].stream = true;
            }else{
                types[i].stream = false;
            }
        }
    }

    if(fs.existsSync(htmlfile)){
        fs.readFile(htmlfile, {encoding:'utf8'}, function(err, str){
            if(err){
                self.emit('error',
                new Error('' + err.message));
            }
            readLinks(str);
        });
    }

    function readLinks(html){
        var $elements, $element, attr, type,
            $ = cheerio.load(html);
        

        for(var t=0,l=types.length; t<l; t++){

            if(!types[t].use)
                continue;

            type = types[t];

            $elements = $(type.select);

            data[type.type + 's'] = [];
            attr = type.attributes;

            $elements.each(function(i, e){
                $element = $(this);
                var a = {}, at;

                if(!type.condition($element))
                    return;

                if($element.attr(type.fileAttribute) === undefined)
                    return;

                running++;

                for(var i=0, len=attr.length; i<len; i++){
                    if(at = $element.attr(attr[i]))
                        a[attr[i]] = at;
                }

                PrepareLink(type, $element, a);

            });

        }
    }

    function PrepareLink(type, $element, a){

        a.name = $element.attr(type.fileAttribute);
        a.path = path.resolve(cwd, a.name);
        a.cwd = cwd;

        //The names, and paths must be recorded for future usage
        //if another module does file operations it may need this
        //information for adding, or ignoring.

        names.push(a.name);
        paths.push(a.path);

        var stream = null;

        if(type.read || type.stream && fs.existsSync(a.path)){
            stream = fs.createReadStream(a.path, {encoding: 'utf8'});
            if(type.stream){
                self.emit('stream', stream, PreserveObject(a));
                self.emit(type.type + 'stream', stream, PreserveObject(a));
            }
        }

        if(type.read){
            if(fs.existsSync(a.path)){
                readLink(type, a);
            }
        }else{
            setImmediate(function(){
                finalLink(type, a);
            });
        }
    }

    function readLink(type, a){

        fs.readFile(a.path, 'utf8', function(err, str){
            if(err){

                self.emit('error',
                    new Error('' + err.message));
                return;
            }

            a.content = str;
            finalLink(type, a);
        });
    }

    function finalLink(type, a){
        data[type.type + 's'].push(PreserveObject(a));
        self.emit(type.type, PreserveObject(a));

        if(!--running){
            self.emit('done', data, names, paths);
        }
    }
}

util.inherits(GetHTMLAssets, events.EventEmitter);

function PreserveObject(a){
    var b = {};
    for(var n in a)
        b[n] = a[n];
    return b;
}
