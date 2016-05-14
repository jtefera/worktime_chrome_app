chrome.app.runtime.onLaunched.addListener(function () {
  chrome.app.window.create('index.html', {
    id: "chronoID",
    innerBounds: {
      width: 300,
      height: 200
    }
  });
});
