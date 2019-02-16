// version 1.0.4

if (typeof markdown_to_html == 'undefined') {

var markdown_to_html = function(md, opts){
  if (typeof opts == 'undefined')
    opts = {};
  var last_state = '';
  var list_stack = [[-1, '']];
  var links = [];
  var line = 0;
  var debug = opts.debug;
  var debug_log = (s) => debug && console.log(s);
  var handle_state = function(tag, strs, opt) {
    if (last_state == tag)
      return;
    if (!opt)
      opt = {};
    var cls = opt.class ? ' class="' + opt.class + '"' : '';
    switch (last_state) {
      case 'list':
        while (true) {
          var li = list_stack.pop();
          if (li[0] != -1) {
            strs.push('</li></' + li[1] + '>');
          } else {
            list_stack.push(li);
            break;
          }
        }
        break;
      default:
        if (last_state)
          strs.push('</' + last_state + '>');
        if (tag)
          strs.push('<' + tag + cls + '>');
    }
    last_state = tag;
  };
  md = md.split(/\n/).reduce(function(strs, s){
    var push_str = true; // push to strs, turn off when hard break, link info, ...
    var str_space = true; // turn off if in <pre>
    var str_replace = true; // turn off if in <pre>
    line++;
    debug_log('line: ' + line);
    // escape CGI chars
    s = s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (s.match(/^ *$/)) { // hard break
      debug_log('  hard break');
      switch (last_state) {
        case 'pre':
          debug_log('  last_state == pre')
          break;
        default:
          handle_state('', strs);
          break;
      }
      push_str = false;
    } else if (s.match(/^-+$/)) {
      strs.push('<hr>');
      push_str = false;
      debug_log('  <hr>');
    } else if (m = s.match(/^>\s*(.+?)$/)) {
      handle_state('blockquote', strs);
      s = m[1];
      debug_log('  <blockquote>');
    } else if (m = s.match(/^```(.*?)$/)) {
      handle_state((last_state == 'pre' ? '' : 'pre'), strs, {class: 'code'});
      push_str = false;
      debug_log('  <pre>');
    } else if (m = s.match(/^( *)([-*+]|\d+\.) *(.+?)$/)) { // list
      if (last_state != 'list') {
        handle_state('', strs);
        last_state = 'list';
      }
      var level = m[1].length, tag = isNaN(parseInt(m[2][0])) ? 'ul' : 'ol';
      var last_level = list_stack[list_stack.length - 1][0];
      s = m[3];
      if (level > last_level) {
        strs.push('<' + tag + '><li>');
        list_stack.push([level, tag]);
      } else if (level == last_level) {
        strs.push('</li><li>');
      } else {
        var li = list_stack.pop();
        strs.push('</li></' + li[1] + '>');
        while (true) {
          li = list_stack.pop();
          if (level >= li[0]) {
            strs.push('</li><li>');
            list_stack.push(li);
            break;
          } else {
            strs.push('</li></' + li[1] + '>');
          }
        }
      }
      debug_log('  list ' + tag);
    } else {
      switch (last_state) {
        case 'blockquote', 'list':
          break;
        case 'pre':
          str_replace = false;
          str_space = false;
          s += "\n";
          break;
        default:
          handle_state('p', strs);
      }
    }
    // replaces, these syntax might happens multi times in one line
    if (str_replace) {
      // header
      if (m = s.match(/^(#+)\s*(.+?)$/)) {
        handle_state('', strs);
        var t = 'h' + m[1].length;
        s = '<' + t + '>' + m[2] + '</' + t + '>' + (t == 'h1' ? '<hr>' : '');
        debug_log('  header ' + t);
      }
      // link
      // links are stored into var links, because parsing _italic_ needs to
      // neglect the "_" in urls, replace with "&mdlkn;" (& is escaped so it can
      // be used safely), restore at the end
      // link info, before link because [aa]: can be parsed as link
      if (m = s.match(/^\s*\[(.+?)\]:\s+(.+?)$/)) {
        var r1 = new RegExp('href_t="' + m[1] + '"', 'g');
        var r2 = new RegExp('src_t="' + m[1] + '"', 'g');
        for (var i = 0; i < links.length; i++)
          links[i] = links[i]
            .replace(r1, 'href="' + m[2] + '"')
            .replace(r2, 'src="' + m[2] + '"');
        s = s.replace(m[0], '');
        push_str = false;
        debug_log('  link info ' + m[1] + ' -> ' + m[2]);
      }
      // link, nested [![a](u)?](u2)
      if (ms = s.match(/\[!\[(.+?)\](?:\((.+?)\))?\]\((.+?)\)/g)) {
        for (var i = 0; i < ms.length; i++) {
          m = ms[i].match(/\[!\[(.+?)\](?:\((.+?)\))?\]\((.+?)\)/);
          var href = 'href="' + m[3] + '"';
          var src = m[2] ? 'src="' + m[2] + '"' : 'src_t="' + m[1] + '"';
          var alt = 'alt="' + m[1] + '"';
          var esc = '&mdlk' + links.length + ';';
          links.push('<a ' + href + '><img ' + src + ' ' + alt + '></a>');
          s = s.replace(m[0], esc);
          debug_log('  link nested ' + m[0] + ' -> ' + esc);
        }
      }
      // link, not nested ![a](u)
      if (ms = s.match(/(^|.)\[(.+?)\](?:\((.+?)\))?/g)) {
        for (var i = 0; i < ms.length; i++) {
          m = ms[i].match(/(^|.)\[(.+?)\](?:\((.+?)\))?/);
          var src, tag;
          if (m[1] == '!') {
            src = m[3] ? 'src="' + m[3] + '"' : 'src_t="' + m[2] + '"';
            tag = '<img ' + src + ' alt="' + m[2] + '">';
          } else {
            href = m[3] ? 'href="' + m[3] + '"' : 'href_t="' + m[2] + '"';
            tag = ' <a ' + href + '>' + m[2] + '</a>';
            // need a space at the start due to /(^|.)/
          }
          var esc = '&mdlk' + links.length + ';';
          links.push(tag);
          s = s.replace(m[0], esc);
          debug_log('  link ' + m[0] + ' -> ' + esc);
        }
      }
      s = s.split(/(`.+?`)/)
        .map(function(v){
          if (v[0] == '`')
            return '<code>' + v.substr(1, v.length - 2) + '</code>';
          else
            return v
              .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
              .replace(/_(.+?)_/g, '<i>$1</i>');
        })
        .join('')
        .replace(/  +$/, '<br>');
    }
    if (str_space)
      s = ' ' + s;
    if (push_str)
      strs.push(s);
    return strs;
  }, []).join('');
  debug_log('var links:');
  debug_log(links);
  for (var i = 0; i < links.length; i++)
    md = md.replace('&mdlk' + i + ';', links[i]);
  return md;
};

if (typeof jQuery != 'undefined') {
  jQuery.extend({
    load_markdown: function (selector, url) {
      $.ajax({
        url: url,
        success: function(d){
          $(selector)
            .html(markdown_to_html(d))
            .addClass('markdown');
        }
      });
    }
  });
}

} // if undefined markdown_to_html

