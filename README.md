Go Memcached Admin
==================

Graphic monitor for memcached. Powered by [Golang](http://golang.org/).

![Screenshot](https://raw.github.com/codeb2cc/gmcadmin/master/screenshot.png "gmcadmin")


Installing
==========

[Golang](http://golang.org/) and [Node.js](http://nodejs.org/) are required. Use `git clone` to checkout the source code:

    git clone https://github.com/codeb2cc/gmcadmin.git $GOPATH/src/gmcadmin

or use `go get`:

    go get -u github.com/codeb2cc/gmcadmin

`gmcadmin` uses [Revel](http://robfig.github.io/revel/) framework and a forked version of `gomemcache`:

    go get -u github.com/robfig/revel/revel
    go get -u github.com/codeb2cc/gomemcache/memcache

Use [Grunt](http://gruntjs.com/) to build the web app:

    cd $GOPATH/path/to/gmcadmin
    cd public

    npm install
    grunt release

All static files go to the `public/dist` folder. The resources url prefix is `/public/`. You can move them somewhere else to be better served by Nginx. Check `conf/routes` for route details.

Before starting the app, you may want to open `conf/app.conf` and modify the memcached address and listening port. Default is `127.0.0.1:11211` and `8000`. Finally,

    revel run gmcadmin prod

or

    revel run github.com/codeb2cc/gmcadmin


Demo
====

Take a look at [HERE](http://mc.codeb2cc.com/)

