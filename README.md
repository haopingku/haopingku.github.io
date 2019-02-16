
This is my blog, features of its framework are

* There is only one theme file (`theme.html`), which is loaded to all pages instead of merging into pages before deploying website. Thus only one file needs modified when changing user interface.
* Theme is loaded only once. Changing page will be fast and smooth without re-rendering, URL history back is also supported.
* It's implemented by JavaScript, no backend support is needed.

```html
<!-- theme.html -->
<div id="h-head">
  ...
</div>
<div id="h-body">
  <div id="header"></div>
  <div id="main"></div>
  <div id="footer"></div>
  <script src="..."></script>
</div>
```
```html
<!-- somepage.html -->
<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8"/>
    <link rel="stylesheet" href="/stylesheet/theme.css"/>
    <script src="/javascript/jquery.min.js"></script>
    <script src="/javascript/theme.js"></script>
  </head>
  <body>
    <nav id="t-nav"> <!-- will be loaded to <nav> -->
      <ul>
        <li> ...
      </ul>
    </nav>
    <div id="t-main"> <!-- will be loaded to #main -->
      <section> ...
    </div>
  </body>
</html>
```

First, `somepage.html` loads, then `theme.js` reads `theme.html`. `theme.js` cuts all top `div`s in `theme.html` which has id starts as "h-" and paste into DOM, for example, `<div id="h-head">`'s all DOM children are cut and pasted into `<head>`, `<div id="h-body">` to `<body>`.

Then `theme.js` changes all `<a>` that links to other pages in the same website. When click an `<a>`, only contents needed is changed, like `<nav>` and `<div id="main">`, instead of reload and re-render all page. This brings smooth user experience which is fast and pages won't flash.

In `theme.js`
```javascript
if (typeof theme_js_loaded_count == 'undefined')
  var theme_js_loaded_count = 0, prev_path = '';
```
`theme.js` is loaded each time a new HTML is loaded, `theme_js_loaded_count` counts the time. `prev_path` prevents loading same page.
`load_page` changes content with reload the page.
`set_single_page` sets proper links' click event to `load_page()` and prevent default reload.

```javascript
if (theme_js_loaded_count == 0) {
  // first time theme.js is loaded
  // load theme.html, cut and paste its elements
  // call set_single_page()
} else {
  // call set_single_page()
}
theme_js_loaded_count++;
```
