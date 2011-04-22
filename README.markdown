## Welcome to Nōdo Tanku (ノード タンク)

### Development Requirements

* [node](https://github.com/ry/node) 0.4.0 or higher (tested on 0.4.0)
* [npm](https://github.com/isaacs/npm)

### Starting local server

<pre>$ node server.js</pre>

### Joyent Deployment Requirements

* SSH - ask one of the Node Knockout team members to add your key

<pre>$ ssh node@tanku.no.de</pre>

* git remote

<pre>
$ git remote add joyent ssh://node@tanku.no.de/repo
$ git push joyent master
</pre>

### Production

[http://tanku.no.de/](http://tanku.no.de)

### Changing version of node in Production

<pre>
  $ cd local
  $ rm nodejs
  $ ln -s /opt/nodejs/vx.y.z nodejs
  Update the version to x.y.z in config.json in the root of the project
</pre>

### Building Node on Production

We've abandoned this approach; see above for preferred method.  If you need to build from source, these instructions are a start.  Currently, you will get this error:
<pre>
  [node@tanku ~/node_installs/node-0.4.6]$ ./configure 
  Checking for program g++ or c++          : not found 
  Checking for program c++                 : not found 
  /home/node/node_installs/node-0.4.6/wscript:232: error: could not configure a cxx compiler!
</pre>


Joyent gives you freedom to install any version of Node.  Just follow the Node build instructions on [GitHub](https://github.com/joyent/node/wiki/Installation).

<pre>
  cd node_installs
  wget wget https://github.com/joyent/node/tarball/v0.4.6 --no-check-certificate
  tar -zxvf node-0.4.6.tar.gz
  cd node-0.4.6
  ./configure --prefix=$HOME/local/node
</pre>

