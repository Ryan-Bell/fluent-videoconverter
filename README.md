# fluent-videoconverter

[![Build Status](https://travis-ci.org/Ryan-Bell/fluent-videoconverter.svg?branch=master)](https://travis-ci.org/Ryan-Bell/fluent-videoconverter)
[![Coverage Status](https://coveralls.io/repos/github/Ryan-Bell/fluent-videoconverter/badge.svg?branch=master)](https://coveralls.io/github/Ryan-Bell/fluent-videoconverter?branch=master)

This module acts as the glue between [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) and [ffmpeg.js](https://github.com/Kagami/ffmpeg.js) in order to provide an easy interface for ffmpeg without requiring its installation. 

##### [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
> This library abstracts the complex command-line usage of ffmpeg into a fluent, easy to use node.js module.

##### [ffmpeg.js](https://github.com/Kagami/ffmpeg.js)
>  This library provides FFmpeg builds ported to JavaScript using [Emscripten project](https://github.com/kripken/emscripten) project.

### Installation

```sh
$ npm install fluent-videoconverter
```

### Usage

```javascript
let ffmpeg = require('fluent-videoconverter');

// See the fluent-ffmpeg documentation fo rmore usage examples
ffmpeg('input.webm')
    .noAudio()
    .size('640x480')
    .save('output.webm');
```

##### Notes
This project shouldn't be used in production (it was a mostly failed experiment). It hasn't been fully tested so some advanced ffmpeg usage may not work with the emscripten build. Furthermore, any fluent-ffmpeg that requires the use of ffprobe will not work. In general, there are bugs.
