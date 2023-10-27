document.addEventListener("DOMContentLoaded", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    var s_url = new URL(tab.url);
    var rootPath = s_url.origin;
    var resultdata = "";
    var all_url_list = [];
    var all_resultdata =   "";
    var other_resultdata = "其他：\n";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      fetch(url)
        .then(response => response.text())
        .then(html => {
          // 过滤换行 空格
          //var htmldata = html.replace(/\n/g, '').replace(/\s/g, "");
          var htmldata = html;
          // 使用换行符拆分字符串
          var htmlLines = htmldata.split(' ');
          // 规则数组
          // var rules = [{"URL":/(https?|ftp|file):\/\/[^\s/$.?#].[^\s]*$/},{"URL":/^(https?|http):\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?/},{"IP": /\b(?:\d{1,3}\.){3}\d{1,3}\b/}]; 
          var rules = [{"URL":/^(https?|http):\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?/},{"PATH":/['"](?:\/|\.\.\/|\.\/)[^\/\>\< \)\(\{\}\,\'\"\\]([^\>\< \)\(\{\}\,\'\"\\])*?['"]/g},{"URL":/['"](([a-zA-Z0-9]+:)?\/\/)?[a-zA-Z0-9\-\.]*?\.(xin|com|cn|net|com.cn|vip|top|cc|shop|club|wang|xyz|luxe|site|news|pub|fun|online|win|red|loan|ren|mom|net.cn|org|link|biz|bid|help|tech|date|mobi|so|me|tv|co|vc|pw|video|party|pics|website|store|ltd|ink|trade|live|wiki|space|gift|lol|work|band|info|click|photo|market|tel|social|press|game|kim|org.cn|games|pro|men|love|studio|rocks|asia|group|science|design|software|engineer|lawyer|fit|beer|我爱你|中国|公司|网络|在线|网址|网店|集团|中文网)(\:\d{1,5})?(\/.*?)?['"]/}]; 
          // 返回的数据 resultdata
          // 返回的数据 resultdata
          // 处理html
          for (var i = 0; i < htmlLines.length; i++) {
            var htmlLine = htmlLines[i];
            for (var j = 0; j < rules.length; j++) {
              var rule = rules[j];
              var ruleKey = Object.keys(rule)[0];
              var rule_data = rules[j][ruleKey];
              //var ruleValue = rule[ruleKey];
              // ruleKye 代表规则名称
              // rule_data 代表规则字符串
              var regex = new RegExp(rule_data, 'g');
              var match;
              while ((match = regex.exec(htmlLine)) !== null) {
                if(ruleKey === "PATH"){
                  var matchedString = match[0];
                  var data = matchedString.replace(/\n/g, '').replace(/\s/g, "").replace(/\"/g, "");
                  //resultdata += "\n"  + rootPath + data.replace(/\"/g, "") + '';
                  if (data.startsWith(".") || data.startsWith("..")) {
                    data = data.replace(/^\.+/, "");
                  }
                  resultdata = "\n"  + rootPath + data + '';
                  all_url_list.push(resultdata);
                  break; // 匹配到规则后跳出内层循环
                }else{
                  var matchedString = match[0];
                  var data = matchedString.replace(/\n/g, '').replace(/\s/g, "");
                  data = data.replace(/\"/g, "");
                  if (data.startsWith("https://") || data.startsWith("http://")) {
                    //resultdata += "\n" + data + '';
                    resultdata = "\n" + data + '';
                    all_url_list.push(resultdata);
                    break; // 匹配到规则后跳出内层循环
                  } else {
                    if(data.startsWith("//")){
                      data = data.replace(/^\/\//, "");
                      data = "http://" + data;
                      //resultdata += "\n" + data + '';
                      resultdata = "\n" + data + '';
                      all_url_list.push(resultdata);
                      break; // 匹配到规则后跳出内层循环

                    }else{
                      data = "http://" + data;
                      //resultdata += "\n" + data + '';
                      resultdata = "\n" + data + '';
                      all_url_list.push(resultdata);
                      break; // 匹配到规则后跳出内层循环
                    }
                  }
                }
              }
            }
          }
          // 显示数据到控件
          if (all_url_list.length === 0) {
            var contentDiv = document.getElementById("content");
            contentDiv.innerText = "没有匹配到数据。";
          } else {
            all_url_list = [...new Set(all_url_list)];
            for (var i = 0; i < all_url_list.length; i++) {
              let test_url = all_url_list[i].replace(/\'/g, '').replace(/\n/g, '');
              if (test_url.endsWith("=")) {
                test_url = test_url + "1234";
              }
              // 判断跟路径是否在URL中
              if (test_url.includes(rootPath)){
                var check_test_url = test_url.replace(/\'/g, '').replace(/\n/g, '');
                var status = "000";
                //var test_url_2 ="https://www.baidu.cn";

                fetch(check_test_url)
                  .then(function(response) {
                    status = response.status;
                    return response.text();
                  })
                  .then(function(data) {
                    let size = get_html_size(data);
                    let title = get_html_title(data).replace(/\'/g, '').replace(/\n/g, '').replace(/\r/g, '');
                    let contentDiv = "";
                    contentDiv = document.getElementById("test");
                    test_url = test_url.replace(/\'/g, '').replace(/\n/g, '').replace(/\r/g, '');
                    contentDiv.innerText += "\tcode：" + status + "，size：" + size + "，title：" + title + "，url：" + test_url + "\n";

                  })
                  .catch(function(error) {
                    status = "000";
                    let  contentDiv = "";
                    contentDiv = document.getElementById("test");
                    contentDiv.innerText += status + " " + test_url + "\n";
                });
              }else{
                test_url = test_url.replace(/\'/g, '');
                other_resultdata += test_url + "\n";
              }
            }
          }
          var contentDiv = document.getElementById("content");
          all_resultdata = all_resultdata + "\n" + other_resultdata;
          contentDiv.innerText = all_resultdata;
        })
        .catch(error => {
          var contentDiv = document.getElementById("content");
          contentDiv.innerText = error;
        });
    }
    //
  });
});

function get_html_size(html) {
  return html.length  
}

function get_html_title(html) {
  let match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (match && match[1]) {
    return match[1];
  }
  return "N/A";
}