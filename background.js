// 后台脚本文件（background.js）
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;

    if (url.startsWith("http://") || url.startsWith("https://")) {
      fetch(url)
        .then(response => response.text())
        .then(html => {
          // 在这里处理获取到的HTML数据
          console.log(html);
        })
        .catch(error => {
          console.error("Error fetching HTML:", error);
        });
    }
  });
});

