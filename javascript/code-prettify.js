var code_prettify;

$(function(){

code_prettify = function () {
  setTimeout(function(){
    $('pre.code').addClass('prettyprint');
    $.getScript('/javascript/google-code-prettify.min.js');
  }, 40);
};


})
