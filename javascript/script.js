var blog_init, article_init, article_lang;

jQuery(function() {

blog_init = function() {
  $('#articles > div.container span.tag').map(function() {
    $(this).attr('tag', $(this).html().trim());
  }).end()
    .click(function() {
    var tag = $(this).attr('tag');
    $('#articles > div.container > *')
      .hide()
      .has('span[tag=' + tag + ']')
      .show();
    $('#tag-descriptor')
      .html(tag)
      .show();
    $('#tag-canceler').show();
    return false;
  });
  $('#tag-canceler > span').click(function() {
     $('#articles > div.container > *').show();
     $('#tag-descriptor, #tag-canceler').hide();
     return false;
  });
  if (!this.done) { // for settings only once
    this.done = true;
    $('div#logo a[href="/blog/index.html"]').click(function() {
      $('#tag-canceler:visible > span').click();
      return false;
    });
  }
};

article_init = function() {
  var switch_lang = function(lang) {
    $('section#blog *[lang]')
      .hide()
      .filter(function(){ return $(this).attr('lang') == lang; })
      .show();
  };
  $('div#lang-support > span').click(function() {
    switch_lang(article_lang = $(this).attr('langtype'));
  });
  if (article_lang)
    $('div#lang-support > span[langtype=' + article_lang + ']').click();
  else if ((lang = $('div#lang-support > span[default]')).length > 0)
    switch_lang(lang.attr('langtype'));
  else
    switch_lang($('div#lang-support > span:nth-child(1)').attr('langtype'));
};

code_prettify();

});
