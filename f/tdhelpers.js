// Three-D Helpers
var TDHelpers = {
  disableWebGL2: function(browser) {
    return browser.satisfies( { mobile: { safari: "=13.1.1" } } ) || false;
  }
}
