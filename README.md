Ludum Dare 48 Warmup
===

* Pixijs
* Proton
* Require

# Runnning

Launch a local server. My prefered way is python:

```
python -m SimpleHTTPServer
```

Then go to [http://localhost:8000/game.html](http://localhost:8000/game.html)

# Deploying

To deploy you'll need `nodejs` and npm:

* install requirejs: `npm install -g requirejs`
* run the optimizer: `node deploy\r.js -o deploy\build.js`
* Open [http://localhost:8000](http://localhost:8000/game.html) in a browser.