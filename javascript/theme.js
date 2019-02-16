if (typeof theme_js_loaded_count == 'undefined')
  var theme_js_loaded_count = 0, prev_path = '';

jQuery(function() {

var get_pathname = function() {
  // delete slashes at the end of pathname except "/", so /\/+$/ doesn't work
  return document.location.pathname.replace(/(.)\/+$/, '$1');
}

var load_page = function(url, popstate) {
  if (!popstate && url == get_pathname()) {
    $('#main').click(); // for toggle #header
    return;
  }
  console.log('load_page("' + url + '", popstate=' + (!!popstate) + ')');
  prev_path = url;
  // $('#temp').load(url, function(){
  //   $('#temp').children().filter(function(){
  //     var id = $(this).attr('id')
  //     return id && id.match(/^t-/);
  //   }).map(function(){
  //     var $this = $(this), id = $this.attr('id').substring(2);
  //     $('#' + id).children().remove();
  //     $this.children().detach().appendTo('#' + id);
  //   });
  //   window.history.pushState({}, '', url);
  //   $.getScript('/javascript/theme.js'); // load theme.js again
  //   $.getScript('/javascript/main.js', function(){
  //     $('#main').click(); // for toggle #header
  //     if (!popstate)
  //       $('body').animate({scrollTop: 0}, 250);
  //     $(window).trigger('load'); // for init scrollzer
  //   });
  //   $.getScript('/javascript/script.js');
  // });
  var ids = ['nav', 'main'], loaded_id = 0;
  ids.map(function(v){
    $('#temp').load(url + ' #t-' + v, function() {
      $('#' + v).children().remove();
      $('#t-' + v).children().detach().appendTo('#' + v);
      if ((++loaded_id) == ids.length) {
        // settings after all ids are loaded
        window.history.pushState({}, '', url);
        $.getScript('/javascript/theme.js'); // load theme.js again
        $.getScript('/javascript/main.js', function() {
          $('#main').click(); // for toggle #header
          if (!popstate)
            $('html,body').animate({scrollTop: 0}, 250);
          $('#js-init').click();
          $.getScript('/javascript/script.js');
          $(window).trigger('load'); // for init scrollzer
        });
      }
    });
  });
};

var set_single_page = function() {
  // set <a> which has an internal target
  $('a')
    .filter(function(){
      var href = $(this).attr('href');
      if (!href) return false;
      var c1 = (href[0] == '#' || href.match(/:/) || $(this).attr('target') == '_blank');
      var c2 = $(this).attr('single-page');
      // check if <a> is hooked, if re-hooked, load_page() would be called duplicately
      if (!c2)
        $(this).attr('single-page', '1');
      return !c1 && !c2;
    })
    .click(function(){
      load_page($(this).attr('href'));
      return false;
    });
};

if (theme_js_loaded_count === 0) {
  var t_els = $('body').children().detach();
  prev_path = get_pathname();
  $('body').append('<div id="temp" style="display: none">');
  $('#temp').load('/theme.html', function() {
    // load h-elmt to <elmt>
    $.map($('#temp').children(), function(v) {
      var $v = $(v), id = $v.attr('id');
      if (id && id.match(/^h-/))
        $v.children().detach().appendTo(id.substring(2));
    });
    // load t-elmt to #elmt
    $.map(t_els, function(v) {
      var $v = $(v), id = $v.attr('id');
      if(id && id.match(/^t-/))
        $v.children().detach().appendTo('#' + id.substring(2));
    });
    set_single_page();
    $.getScript('/javascript/main.js', function() {
      $(window).trigger('load'); // for init scrollzer
      $('body').show();
    });
    // call js-init after script.js loaded in theme.html
    $('#js-init').click();
  });
  $(window).on('popstate', function(e) {
    if (prev_path != (path = get_pathname()))
      load_page(path, true);
  });
} else {
  // set <a> after new links is created
  set_single_page();
}

theme_js_loaded_count++;

});
