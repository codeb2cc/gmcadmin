[![Build Status](https://travis-ci.org/codeb2cc/gmcadmin.png)](https://travis-ci.org/codeb2cc/gmcadmin)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/codeb2cc/gmcadmin/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

Go Memcached Admin
==================

Graphic monitor for memcached. Powered by [Golang](http://golang.org/).

![Screenshot](https://raw.github.com/codeb2cc/gmcadmin/master/screenshot.png "gmcadmin")


Installing
==========

[Golang](http://golang.org/) and [Node.js](http://nodejs.org/) are required. Use `go get` to install:

    go get -u github.com/codeb2cc/gmcadmin

`gmcadmin` uses [Revel](http://robfig.github.io/revel/) framework and a forked version of `gomemcache`:

    go get -u github.com/robfig/revel/revel
    go get -u github.com/codeb2cc/gomemcache/memcache

Use [Grunt](http://gruntjs.com/) to build the web app. Remember to modify the websocket url and other configs in `public/src/js/app.js` before building.

    cd $GOPATH/src/github.com/codeb2cc/gmcadmin
    cd public

    npm install
    grunt release

All static files go to the `public/dist` folder. The resources url prefix is `/public/`. You can move them somewhere else to be better served by Nginx, etc. Check `conf/routes` for route details.

Before starting the app, you may want to open `conf/app.conf` and modify the memcached address and listening port. Default is `127.0.0.1:11211` and `8000`. Finally,

    revel run github.com/codeb2cc/gmcadmin prod


Demo
====

Take a look at [HERE](http://mc.codeb2cc.com/)

