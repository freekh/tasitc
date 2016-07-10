// require('codemirror/addon/hint/show-hint');
// require('codemirror/addon/hint/xml-hint');
// require('codemirror/addon/hint/html-hint');

require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/css/css');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/keymap/emacs');

const CodeMirror = require('codemirror/lib/codemirror');
const app = document.getElementById('app');

// TODO: clean up. got it from: http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

CodeMirror.commands.save = cm => {
  const value = cm.getValue();
  console.log('save', value);
  
  const xhr = new XMLHttpRequest();
  xhr.open('POST', getURLParameter('path'));
  xhr.onload = () => {
    console.log('TODO: done');
  };
  xhr.send(value);
};

CodeMirror.defineMode('tasitc', function() {
  return {
    startState: () => {
      return {
      };
    },
    token: (stream, state) => {
      if (stream.match(/.*/)) {
        return null;
      }
      console.log(state);
      return '';
    },
  };
});
CodeMirror.defineMIME('text/x-tasitc', 'tasitc');

const xhr = new XMLHttpRequest();
xhr.open('GET', getURLParameter('path'));
xhr.onload = () => {
  const value = xhr.responseText;
  const cm = CodeMirror(app, {
    mode: 'text/x-tasitc',
    keyMap: 'emacs',
    theme: 'monokai',
    value,
  });
};
xhr.send();
